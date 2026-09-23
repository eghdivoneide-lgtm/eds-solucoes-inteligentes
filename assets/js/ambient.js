/* ===================================================================
   EDS Soluções Inteligentes — Vida no resto do site
   -------------------------------------------------------------------
   O hero e a vitrine de produtos têm Three.js; o resto do site (Soluções,
   Método, Prova, FAQ, faixas escuras...) ficava 100% parado fora do
   hover. Duas coisas leves, sem WebGL, resolvem isso:

   1) Tilt 3D nos cards — inclina de verdade (perspective + rotateX/Y)
      seguindo o ponteiro, com uma "luz" de brilho que acompanha.
   2) Glow ambiente animado por CSS puro nas faixas escuras (proofbar,
      CTA, rodapé) — anima sozinho, não depende do mouse.
   =================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  /* ---- Tilt 3D nos cards (Soluções, Notas de engenharia, Prova, Diferenciais, FAQ) ---- */
  const TILT_SELECTOR = ".solution, .note, .proof-card, .diffs li, .faq-item, .stat";
  const cards = document.querySelectorAll(TILT_SELECTOR);
  const MAX_DEG = 7;
  cards.forEach((card) => {
    card.classList.add("tilt");
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;   // 0..1
        const y = (e.clientY - r.top) / r.height;   // 0..1
        const rx = (0.5 - y) * MAX_DEG * 2;
        const ry = (x - 0.5) * MAX_DEG * 2;
        card.style.transform = `perspective(760px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`;
        card.style.setProperty("--tilt-x", `${(x * 100).toFixed(1)}%`);
        card.style.setProperty("--tilt-y", `${(y * 100).toFixed(1)}%`);
      });
    };
    const onLeave = () => {
      card.style.transform = "";
    };
    card.addEventListener("pointermove", onMove, { passive: true });
    card.addEventListener("pointerleave", onLeave, { passive: true });
  });

  /* ---- Glow ambiente nas faixas escuras sem cena 3D própria ---- */
  document.querySelectorAll(".proofbar, .cta-band, .site-footer").forEach((el) => {
    el.classList.add("ambient-glow");
  });
});
