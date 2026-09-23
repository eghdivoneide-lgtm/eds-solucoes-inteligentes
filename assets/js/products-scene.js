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
    const vw = window.innerWidth, vh = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(vw, vh, false);
    renderer.setScissorTest(true);
    rimA.intensity = 3.2 + Math.sin(t * 1.1) * 1.4;
    rimB.intensity = 2.6 + Math.cos(t * 0.95) * 1.2;

    alvos.forEach(({ frame: el }, i) => {
      const group = items[i];
      const r = el.getBoundingClientRect();
      const onScreen = r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw && r.width > 4;
      group.visible = onScreen;
      if (!onScreen) return;

      const x = Math.round(r.left), yTop = Math.round(r.top);
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

      renderer.render(scene, camera);
    });

    raf = requestAnimationFrame(frame);
  };

  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };
  const io = new IntersectionObserver((entries) => { entries.some((e) => e.isIntersecting) ? start() : stop(); }, { threshold: 0.05 });
  alvos.forEach(({ frame: el }) => io.observe(el));
  window.addEventListener("resize", () => { renderer.setSize(window.innerWidth, window.innerHeight, false); }, { passive: true });

  // Esmaece o frame CSS plano (em vez de sumir de golpe) — dá tempo das
  // texturas carregarem antes da troca, sem "flash" de vazio no meio.
  setTimeout(() => {
    alvos.forEach(({ frame: el }) => { el.classList.add("is-3d-active"); });
  }, 260);

  return true;
};
