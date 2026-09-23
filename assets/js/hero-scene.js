/* ===================================================================
   EDS Soluções Inteligentes — Cena 3D do Hero (corredor + núcleo)
   -------------------------------------------------------------------
   Inspirado em walkthroughs de "sala de servidor" (referência: site
   EDOLUS). Geometria 100% procedural — nenhum modelo 3D externo, então
   nenhuma dúvida de licença/autoria sobre o que aparece na tela.

   Desempenho: câmera fica PARADA; quem "anda" é o corredor, reciclado
   por módulo (poucas instâncias, InstancedMesh = 1 draw call pros
   racks). Só é chamado pelo main.js em telas largas — em celular o
   custo de bateria de WebGL constante não vale o ganho visual.

   Exposto como window.EDS_initHeroScene3D(canvas) → true se a cena
   iniciou, false se o navegador não tem WebGL (o chamador decide o
   fallback). Nunca lança: qualquer falha aqui é silenciosa, e quem
   chama volta pro canvas 2D.
   =================================================================== */
window.EDS_initHeroScene3D = function (canvas) {
  if (!window.THREE) return false;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (e) { return false; }
  if (!renderer) return false;

  const scene = new THREE.Scene();
  const bg = new THREE.Color(0x04060b);
  scene.background = bg;
  scene.fog = new THREE.FogExp2(0x04060b, 0.052);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 60);
  camera.position.set(0, 0.35, 6.5);

  /* ---- luzes ---- */
  scene.add(new THREE.AmbientLight(0x1a2340, 1.1));
  const coreLight = new THREE.PointLight(0x6ee9ff, 14, 22, 2);
  coreLight.position.set(0, 0.6, -16);
  scene.add(coreLight);
  const rimA = new THREE.PointLight(0x8f7bff, 4, 10, 2);
  rimA.position.set(-2.4, 1, 2);
  scene.add(rimA);
  const rimB = new THREE.PointLight(0x4fe3ff, 4, 10, 2);
  rimB.position.set(2.4, 1, 2);
  scene.add(rimB);

  /* ---- piso e teto (planos simples, só pra fechar a leitura de corredor) ---- */
  const planeMat = new THREE.MeshStandardMaterial({ color: 0x070a12, roughness: .85, metalness: .15 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 60), planeMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -1.4, -14);
  scene.add(floor);
  const ceil = floor.clone();
  ceil.position.y = 2.3;
  ceil.rotation.x = Math.PI / 2;
  scene.add(ceil);

  /* ---- racks: caixas emissivas em duas colunas, recicladas por módulo ---- */
  const RACKS_PER_SIDE = 16;
  const SPACING = 2.4;
  const DEPTH = RACKS_PER_SIDE * SPACING; // comprimento do "loop" do corredor
  const rackGeo = new THREE.BoxGeometry(0.9, 2.1, 1.5);
  const rackMat = new THREE.MeshStandardMaterial({
    color: 0x0b1220, roughness: .55, metalness: .35,
    emissive: 0x1a2c55, emissiveIntensity: .6,
  });
  const rackMesh = new THREE.InstancedMesh(rackGeo, rackMat, RACKS_PER_SIDE * 2);
  rackMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(RACKS_PER_SIDE * 2 * 3), 3);
  scene.add(rackMesh);

  /* Luzinhas de painel: pequenas faixas emissivas no rosto de cada rack,
     cor alternando ciano/violeta — dá o "brilho de LED de servidor". */
  const ledGeo = new THREE.PlaneGeometry(0.62, 1.7);
  const ledMatCyan = new THREE.MeshBasicMaterial({ color: 0x4fe3ff, transparent: true, opacity: .85 });
  const ledMatViolet = new THREE.MeshBasicMaterial({ color: 0x8f7bff, transparent: true, opacity: .85 });
  const ledMesh = new THREE.InstancedMesh(ledGeo, ledMatCyan, RACKS_PER_SIDE);
  const ledMeshV = new THREE.InstancedMesh(ledGeo, ledMatViolet, RACKS_PER_SIDE);
  scene.add(ledMesh, ledMeshV);

  const dummy = new THREE.Object3D();
  const rackData = [];
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < RACKS_PER_SIDE; i++) {
      rackData.push({ side: side === 0 ? -1 : 1, z0: -(i * SPACING) });
    }
  }

  /* ---- núcleo: objeto pulsante no fim do corredor ---- */
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 1),
    new THREE.MeshStandardMaterial({ color: 0x081018, emissive: 0x6ee9ff, emissiveIntensity: 1.4, roughness: .3, metalness: .4, wireframe: false })
  );
  core.position.set(0, 0.55, -16);
  scene.add(core);
  const coreWire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.34, 1),
    new THREE.MeshBasicMaterial({ color: 0x9ad9ff, wireframe: true, transparent: true, opacity: .22 })
  );
  coreWire.position.copy(core.position);
  scene.add(coreWire);

  /* ---- responsivo ---- */
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* ---- ponteiro: leve parallax de câmera (olhar ao redor) ---- */
  const pointer = { x: 0, y: 0 };
  const heroEl = canvas.closest(".hero");
  heroEl.addEventListener("pointermove", (e) => {
    const r = heroEl.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  }, { passive: true });

  /* ---- loop ---- */
  let raf = 0, running = false, speed = 2.6, t = 0;
  const tmpColor = new THREE.Color();

  const frame = () => {
    if (!running) return;
    t += 1 / 60;

    rackData.forEach((d, i) => {
      // z avança em direção à câmera e recicla no fim do loop
      let z = ((d.z0 - t * speed) % DEPTH + DEPTH) % DEPTH;
      z = -z + 4; // desloca a janela visível pra frente da câmera
      const fade = Math.min(1, Math.max(0, (6 - z) / 3)); // dissolve perto da câmera
      dummy.position.set(d.side * 2.15, -0.35, z);
      dummy.scale.setScalar(0.001 + fade * 0.999);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      rackMesh.setMatrixAt(i, dummy.matrix);

      const isCyan = i % 2 === 0;
      const target = isCyan ? ledMesh : ledMeshV;
      const idx = Math.floor(i / 2);
      dummy.position.set(d.side * (2.15 + 0.47 * -d.side), -0.35, z + 0.76);
      dummy.rotation.y = d.side > 0 ? -Math.PI / 2 : Math.PI / 2;
      dummy.updateMatrix();
      target.setMatrixAt(idx < RACKS_PER_SIDE ? idx : 0, dummy.matrix);
    });
    rackMesh.instanceMatrix.needsUpdate = true;
    ledMesh.instanceMatrix.needsUpdate = true;
    ledMeshV.instanceMatrix.needsUpdate = true;

    // Racks "respirando" e LEDs cintilando — corredor de servidor vivo, não cenário parado
    rackMat.emissiveIntensity = 0.55 + Math.sin(t * 1.1) * 0.25;
    ledMatCyan.opacity = 0.7 + Math.max(0, Math.sin(t * 6.5)) * 0.3;
    ledMatViolet.opacity = 0.7 + Math.max(0, Math.sin(t * 6.5 + 1.7)) * 0.3;
    rimA.intensity = 3.2 + Math.sin(t * 0.9) * 1.6;
    rimB.intensity = 3.2 + Math.cos(t * 0.75) * 1.6;

    core.rotation.y += 0.014;
    core.rotation.x += 0.006;
    coreWire.rotation.y -= 0.009;
    coreWire.rotation.x += 0.004;
    const pulse = 1 + Math.sin(t * 1.8) * 0.14;
    core.scale.setScalar(pulse);
    coreWire.scale.setScalar(pulse * 1.05);
    coreLight.intensity = 11 + Math.sin(t * 1.8) * 6 + Math.sin(t * 5.3) * 2;

    // Balanço autônomo da câmera (viva mesmo sem o mouse em cima) + parallax do ponteiro por cima
    const sway = Math.sin(t * 0.35) * 0.28;
    camera.position.x += (pointer.x * 0.6 + sway - camera.position.x) * 0.05;
    camera.position.y += (0.35 - pointer.y * 0.34 + Math.cos(t * 0.28) * 0.1 - camera.position.y) * 0.05;
    camera.lookAt(0, 0.4, -6);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  };

  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; };

  const io = new IntersectionObserver(([e]) => { e.isIntersecting ? start() : stop(); });
  io.observe(canvas);

  return true;
};
