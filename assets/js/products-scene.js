/* ===================================================================
   EDS Soluções Inteligentes — Mockups 3D dos produtos (vitrine)
   -------------------------------------------------------------------
   Cada card de app (.appslide-device .device) vira uma malha 3D real
   (corpo + tela), com a screenshot do próprio produto como textura —
   não é genérico, é o print de verdade de cada app.

   TRUQUE DE DESEMPENHO: um único canvas/contexto WebGL cobre a tela
   inteira (position:fixed); a cada quadro, "recorta" (scissor) um
   retângulo por card e desenha só aquele telefone ali dentro — técnica
   padrão do three.js pra sincronizar 3D com posições de elementos HTML
   sem abrir um WebGLRenderer por card (5 contextos simultâneos, ali
   sim, seria risco real de travar em aparelho mais fraco).

   Cards "em breve" (sem screenshot real, .is-ph) ficam de fora — nada
   de textura genérica em cima de produto que ainda não existe.

   Exposto como window.EDS_initProductScene3D() → true se iniciou.
   =================================================================== */
window.EDS_initProductScene3D = function () {
  if (!window.THREE) return false;

  const alvos = Array.from(document.querySelectorAll(".appslide-device .device"))
    .map((frame) => ({ frame, img: frame.querySelector(".device-screen img"), wide: frame.classList.contains("device-wide") }))
    .filter((a) => a.img && !a.frame.querySelector(".device-screen.is-ph"));
  if (!alvos.length) return false;

  const canvas = document.createElement("canvas");
  canvas.id = "productScene3D";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed; inset:0; width:100vw; height:100vh; pointer-events:none; z-index:5;";
  document.body.appendChild(canvas);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) { canvas.remove(); return false; }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 10);
  camera.position.z = 4.2;

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));
  const key = new THREE.DirectionalLight(0xcfe8ff, 1.15); key.position.set(2, 3, 4); scene.add(key);
  const rimA = new THREE.PointLight(0x4fe3ff, 3.2, 9); rimA.position.set(-2.4, -1, 2.4); scene.add(rimA);
  const rimB = new THREE.PointLight(0x8f7bff, 2.6, 9); rimB.position.set(2.2, 1.4, 2); scene.add(rimB);

  const loader = new THREE.TextureLoader();
  const items = alvos.map(({ frame, img, wide }, i) => {
    const tex = loader.load(img.currentSrc || img.src, undefined, undefined, () => {});
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;

    const group = new THREE.Group();
    const bodyGeo = wide ? new THREE.BoxGeometry(2.3, 1.44, 0.07) : new THREE.BoxGeometry(1.02, 2.14, 0.1);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: 0.3, metalness: 0.65 });
    group.add(new THREE.Mesh(bodyGeo, bodyMat));

    const screenGeo = wide ? new THREE.PlaneGeometry(2.16, 1.32) : new THREE.PlaneGeometry(0.9, 1.98);
    const screen = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ map: tex }));
    screen.position.z = wide ? 0.037 : 0.052;
    group.add(screen);

    // Aro fino com brilho — lê como "vidro" na borda da tela.
    const rimGeo = wide ? new THREE.PlaneGeometry(2.2, 1.36) : new THREE.PlaneGeometry(0.94, 2.02);
    const rimMesh = new THREE.Mesh(rimGeo, new THREE.MeshBasicMaterial({ color: 0x6ee9ff, transparent: true, opacity: 0.16 }));
    rimMesh.position.z = wide ? 0.034 : 0.049;
    group.add(rimMesh);

    group.visible = false;
    group.userData.phase = i * 1.7;
    scene.add(group);
    return group;
  });

  const pointer = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  let raf = 0, running = false, t = 0;
  const vpBox = new THREE.Vector4();

  const frame = () => {
    if (!running) return;
    t += 1 / 60;
    // Medir a caixa REAL do canvas, nunca window.innerWidth/innerHeight: no
    // celular `100vh` vale a altura com a barra do navegador escondida, que
    // nao e a mesma de innerHeight enquanto a barra aparece. Com o buffer
    // dimensionado por innerHeight e o canvas esticado em 100vh, o recorte
    // saia deslocado e o telefone "voava" por cima dos outros cards.
    const box = canvas.getBoundingClientRect();
    const vw = Math.max(1, Math.round(box.width)), vh = Math.max(1, Math.round(box.height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(vw, vh, false);

    // APAGAR A TELA INTEIRA ANTES DE DESENHAR — e a parte que faltava.
    // `render()` limpa so o que esta dentro do scissor da vez, entao tudo o que
    // foi desenhado fora dele continuava gravado no canvas. Como o canvas e
    // fixed e cobre a tela, o telefone ficava parado no lugar onde foi pintado
    // pela ultima vez enquanto a pagina rolava por baixo: os "fantasmas" que
    // apareciam ate no formulario de contato. No celular e gritante porque o
    // recorte de cada card e pequeno e sobra muito canvas sem nunca ser limpo.
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, vw, vh);
    renderer.clear();
    renderer.setScissorTest(true);
    rimA.intensity = 3.2 + Math.sin(t * 1.1) * 1.4;
    rimB.intensity = 2.6 + Math.cos(t * 0.95) * 1.2;

    alvos.forEach(({ frame: el }, i) => {
      const group = items[i];
      const r = el.getBoundingClientRect();
      const onScreen = r.bottom > box.top && r.top < box.bottom
        && r.right > box.left && r.left < box.right && r.width > 4;
      if (!onScreen) { group.visible = false; return; }

      // Coordenadas relativas ao canvas, nao a janela.
      const x = Math.round(r.left - box.left), yTop = Math.round(r.top - box.top);
      const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      const yBottom = Math.round(vh - yTop - h); // origem do viewport WebGL é embaixo-esquerda
      vpBox.set(x, yBottom, w, h);
      renderer.setScissor(vpBox.x, vpBox.y, vpBox.z, vpBox.w);
      renderer.setViewport(vpBox.x, vpBox.y, vpBox.z, vpBox.w);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const ph = group.userData.phase;
      // Balanço de vitrine — arco bem mais largo/rápido que antes, mas sem girar 360°
      // (a tela precisa continuar visível a maior parte do tempo: é o print real do app).
      group.rotation.y = Math.sin(t * 0.6 + ph) * 0.5 + pointer.x * 0.42;
      group.rotation.x = Math.sin(t * 0.42 + ph * 1.3) * 0.16 - pointer.y * 0.22;
      group.rotation.z = Math.sin(t * 0.28 + ph) * 0.05;
      group.position.y = Math.sin(t * 0.9 + ph) * 0.09;

      // Um telefone por recorte: `render` desenha a cena INTEIRA, entao, sem
      // esconder os outros, o card do PlanejaEdge saia com o print do
      // LicitaEdge empilhado em cima (todos os grupos ficam na origem).
      items.forEach((g, j) => { g.visible = j === i; });

      renderer.render(scene, camera);
    });

    raf = requestAnimationFrame(frame);
  };

  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
  const stop = () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    // Sem isto o ultimo quadro fica congelado na tela depois que a vitrine sai de vista.
    const b = canvas.getBoundingClientRect();
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, Math.max(1, Math.round(b.width)), Math.max(1, Math.round(b.height)));
    renderer.clear();
  };
  const io = new IntersectionObserver((entries) => { entries.some((e) => e.isIntersecting) ? start() : stop(); }, { threshold: 0.05 });
  alvos.forEach(({ frame: el }) => io.observe(el));
  // Redimensionar aqui e redundante (o `frame` ja mede a caixa do canvas a cada
  // quadro), mas mantem o buffer coerente se a janela mudar com a cena parada.
  window.addEventListener("resize", () => {
    const b = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(1, Math.round(b.width)), Math.max(1, Math.round(b.height)), false);
  }, { passive: true });

  // Esmaece o frame CSS plano (em vez de sumir de golpe) — dá tempo das
  // texturas carregarem antes da troca, sem "flash" de vazio no meio.
  setTimeout(() => {
    alvos.forEach(({ frame: el }) => { el.classList.add("is-3d-active"); });
  }, 260);

  return true;
};
