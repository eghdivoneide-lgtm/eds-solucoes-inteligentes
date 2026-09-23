/* ===================================================================
   EDS Soluções Inteligentes — Script principal
   Sem dependências. Menu, header, revelações e formulário → WhatsApp.
   =================================================================== */

/* >>> CONFIGURE AQUI <<<
   Número do WhatsApp em formato internacional, somente dígitos:
   DDI (55) + DDD + número. Ex.: "5587991500600"                       */
const WHATSAPP_NUMERO = "5587991500600";

/* Mascote "Smartcoach": desligado por padrão no layout v2 (distrai do
   conteúdo e pesa na percepção profissional). Para reativar: true. */
const EDS_MASCOTE = false;

/* Endpoint da IA (Netlify Function). Sem ANTHROPIC_API_KEY configurada na
   Netlify, o site usa o "modo demonstração" com um exemplo pré-calculado. */
const EDS_IA_ENDPOINT = "/.netlify/functions/ia";

document.addEventListener("DOMContentLoaded", () => {
  const wppBase = `https://wa.me/${WHATSAPP_NUMERO}`;

  /* ---- Ano do rodapé ---- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Links de WhatsApp estáticos ---- */
  const msgPadrao = encodeURIComponent(
    "Olá! Vim pelo site da EDS Soluções Inteligentes e gostaria de conversar sobre um projeto."
  );
  ["whatsLink", "whatsCta", "whatsFloat"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = `${wppBase}?text=${msgPadrao}`;
  });

  /* ---- Header com fundo ao rolar ---- */
  const header = document.getElementById("header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Menu mobile ---- */
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  if (toggle && nav) {
    const setMenu = (open) => {
      nav.classList.toggle("open", open);
      toggle.classList.toggle("open", open);
      // Com o menu aberto a barra vira papel, para topo e painel formarem
      // uma superfície só mesmo quando o hero escuro está atrás.
      if (header) header.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
  }

  /* ---- Revelação on-scroll (com stagger por grupo) ---- */
  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach((el) => {
    const group = Array.from(el.parentElement.children).filter((c) => c.classList.contains("reveal"));
    el.style.setProperty("--reveal-i", Math.min(group.indexOf(el), 6));
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* ---- Formulário → WhatsApp ---- */
  const form = document.getElementById("contactForm");
  const hint = document.getElementById("formHint");
  if (form && hint) {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      hint.className = "form-hint";

      const nome = form.nome.value.trim();
      const email = form.email.value.trim();
      const telefone = form.telefone.value.trim();
      const assunto = form.assunto.value;
      const mensagem = form.mensagem.value.trim();

      if (!nome || !mensagem) {
        hint.textContent = "Por favor, preencha pelo menos o nome e a mensagem.";
        hint.classList.add("err");
        (!nome ? form.nome : form.mensagem).focus();
        return;
      }

      const linhas = [
        "*Novo contato pelo site — EDS Soluções Inteligentes*",
        "",
        `*Nome:* ${nome}`,
        email ? `*E-mail:* ${email}` : null,
        telefone ? `*Telefone:* ${telefone}` : null,
        `*Assunto:* ${assunto}`,
        "",
        "*Mensagem:*",
        mensagem,
      ].filter(Boolean);

      window.open(`${wppBase}?text=${encodeURIComponent(linhas.join("\n"))}`, "_blank", "noopener");

      hint.textContent = "Abrindo o WhatsApp… se não abrir, verifique o bloqueador de pop-ups.";
      hint.classList.add("ok");
      form.reset();
    });
  }
});

/* ---- Smartcoach — guia que passeia pelo site principal e dá dicas ---- */
(function () {
  var spots = ['4%', '42%', '70%', '26%', '58%'],
    tips = [
      'Oi! 👋 Sou o <b>Smartcoach</b> da EDS. Posso te mostrar o que fazemos?',
      'A EDS cria <b>software sob medida</b>, automação e <b>IA aplicada</b>.',
      'Temos <b>LicitaEdge</b> e <b>PlanejaEdge</b> no ar, com usuários reais.',
      'Quer testar? Os apps têm <b>teste grátis, sem cartão</b>. 🎁',
      'Precisa de um sistema sob medida? <b>Fale com a EDS</b>. 💬',
      'Bateu uma dúvida? Dá uma olhada no nosso <b>FAQ</b>. ✅'
    ],
    i = 0, off = false;
  var m = document.getElementById('mascot'), b = document.getElementById('m-bubble');
  if (!m || !b || !EDS_MASCOTE) return;
  m.hidden = false;
  function say(t) { b.innerHTML = t; b.classList.add('show'); clearTimeout(say._t); say._t = setTimeout(function () { b.classList.remove('show'); }, 5600); }
  function step() { if (off) return; m.style.left = spots[i % spots.length]; say(tips[i % tips.length]); i++; }
  window.mascotPoke = function () { if (off) return; say(tips[i % tips.length]); i++; };
  window.mascotDismiss = function (e) { e.stopPropagation(); off = true; m.style.display = 'none'; };
  setTimeout(function () { say(tips[0]); i = 1; }, 1600);
  setInterval(step, 9000);
})();

/* ===================================================================
   v2 — Hero com malha animada, contadores, vídeos, demo de IA e assistente
   =================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Cena do hero: 3D (Three.js) em telas largas, partículas 2D no resto ----
     A cena 3D custa bateria e só compensa em tela grande, onde dá pra ver o
     corredor de verdade. Em celular (a maioria do tráfego real) fica no
     canvas 2D, bem mais barato. Qualquer falha no WebGL (driver, navegador
     antigo, THREE que não carregou) cai automaticamente pro 2D também. */
  const canvas3D = document.getElementById("heroScene3D");
  const canvas = document.getElementById("heroMesh");
  let usou3D = false;
  if (canvas3D && !reduced && window.innerWidth >= 900 && window.EDS_initHeroScene3D) {
    // Precisa estar visível ANTES de iniciar: a cena mede o tamanho real do
    // canvas pra configurar o renderer, e um <canvas hidden> mede 0×0.
    canvas3D.hidden = false;
    canvas.hidden = true;
    try { usou3D = window.EDS_initHeroScene3D(canvas3D); } catch (e) { usou3D = false; }
    if (!usou3D) { canvas3D.hidden = true; canvas.hidden = false; }
    // rAF duplo = pelo menos um quadro já desenhado antes de aparecer —
    // sem isso dava pra ver o canvas "piscar" vazio um instante ao carregar.
    else requestAnimationFrame(() => requestAnimationFrame(() => canvas3D.classList.add("is-ready")));
  }
  if (canvas && !reduced && !usou3D) {
    const ctx = canvas.getContext("2d");
    const heroSection = canvas.closest(".hero");
    const CORES = ["79, 227, 255", "143, 123, 255", "110, 233, 255"];
    let w, h, dpr, raf, particles = [];
    const pointer = { x: .5, y: .42, active: false };

    const N = () => (w < 640 ? 60 : w < 1100 ? 100 : 150);

    const seed = () => {
      const n = N();
      particles = Array.from({ length: n }, () => {
        const z = Math.random(); // 0 = fundo, 1 = frente
        return {
          x: Math.random(), y: Math.random(), z,
          vx: (Math.random() - .5) * .00018,
          vy: (Math.random() - .5) * .00018,
          r: .6 + z * 1.8,
          c: CORES[(Math.random() * CORES.length) | 0],
          tw: Math.random() * Math.PI * 2, // fase do cintilar
        };
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      w = canvas.width = Math.round(rect.width * dpr);
      h = canvas.height = Math.round(rect.height * dpr);
      seed();
    };

    const onMove = (clientX, clientY) => {
      const rect = heroSection.getBoundingClientRect();
      pointer.x = (clientX - rect.left) / rect.width;
      pointer.y = (clientY - rect.top) / rect.height;
      pointer.active = pointer.x >= 0 && pointer.x <= 1 && pointer.y >= 0 && pointer.y <= 1;
    };
    heroSection.addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY), { passive: true });
    heroSection.addEventListener("pointerleave", () => { pointer.active = false; }, { passive: true });

    let t = 0;
    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, w, h);

      /* Linhas de constelação entre partículas próximas e "na frente" */
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (a.z < .35) continue;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (b.z < .35) continue;
          const dx = (a.x - b.x) * w, dy = (a.y - b.y) * h;
          const d = Math.hypot(dx, dy);
          const max = 90 * dpr;
          if (d < max) {
            ctx.strokeStyle = `rgba(${a.c}, ${.09 * (1 - d / max) * a.z})`;
            ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.stroke();
          }
        }
      }

      /* Partículas: deriva lenta + repulsão suave ao redor do ponteiro */
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -.05) p.x = 1.05; if (p.x > 1.05) p.x = -.05;
        if (p.y < -.05) p.y = 1.05; if (p.y > 1.05) p.y = -.05;

        let px = p.x, py = p.y;
        if (pointer.active) {
          const dx = p.x - pointer.x, dy = (p.y - pointer.y) * (h / w);
          const dist = Math.hypot(dx, dy);
          const reach = .16 * (.4 + p.z);
          if (dist < reach) {
            const force = (1 - dist / reach) * .05 * p.z;
            px += (dx / (dist || 1)) * force;
            py += (dy / (dist || 1)) * force;
          }
        }

        const glow = .55 + Math.sin(t * .02 + p.tw) * .25;
        const rad = p.r * dpr * (1.4 + p.z);
        const g = ctx.createRadialGradient(px * w, py * h, 0, px * w, py * h, rad * 3.2);
        g.addColorStop(0, `rgba(${p.c}, ${glow * (.35 + p.z * .45)})`);
        g.addColorStop(1, `rgba(${p.c}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(px * w, py * h, rad * 3.2, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = `rgba(${p.c}, ${Math.min(1, glow + .25)})`;
        ctx.beginPath(); ctx.arc(px * w, py * h, rad, 0, Math.PI * 2); ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    resize(); window.addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(() => requestAnimationFrame(() => canvas.classList.add("is-ready")));
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(draw); } else { cancelAnimationFrame(raf); raf = 0; } });
    io.observe(canvas);
  }

  /* ---- Mockups 3D dos apps na vitrine ----
     Ao contrário da cena do Hero (corredor + neblina + várias luzes, bem
     mais pesada), essa cena é 3 malhas simples com um único contexto WebGL
     — cabe tranquilamente em celular. Regra bem mais permissiva: qualquer
     tela a partir de ~380px (ou seja, praticamente todo celular moderno),
     só respeitando "reduzir movimento" e a existência de WebGL de verdade. */
  if (!reduced && window.innerWidth >= 340 && window.EDS_initProductScene3D) {
    try { window.EDS_initProductScene3D(); } catch (e) { /* mantém os cards planos */ }
  }

  /* ---- Contadores (sobem quando entram na tela) ---- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const run = (el) => {
      const end = Number(el.dataset.count), dur = 1100, start = performance.now();
      const step = (now) => { const p = Math.min(1, (now - start) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
      reduced ? (el.textContent = end) : requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .5 });
    counters.forEach((c) => io.observe(c));
  }

  /* ---- Vídeos de produto: só carregam se o arquivo existir ---- */
  document.querySelectorAll(".device-video[data-src]").forEach((v) => {
    const src = v.dataset.src;
    fetch(src, { method: "HEAD" }).then((r) => {
      if (!r.ok || !/video/.test(r.headers.get("content-type") || "")) return;
      v.src = src; v.closest(".device-screen").classList.add("has-video");
      v.play().catch(() => {});
    }).catch(() => {});
  });

  /* ---- Demo: análise de edital ---- */
  const dIn = document.getElementById("demoInput"), dOut = document.getElementById("demoOut"),
        dRun = document.getElementById("demoRun"), dSample = document.getElementById("demoSample"),
        dTag = document.getElementById("demoTag");
  const EXEMPLO = `PREGÃO ELETRÔNICO Nº 12/2026 — Prefeitura Municipal. Objeto: aquisição de 40 (quarenta) notebooks para as unidades escolares, conforme especificações do Termo de Referência. Critério de julgamento: menor preço por item. Valor estimado: R$ 184.000,00. Habilitação: regularidade fiscal federal, estadual e municipal; certidão negativa trabalhista; atestado de capacidade técnica compatível. Prazo de entrega: 30 (trinta) dias a contar da ordem de fornecimento. Garantia mínima: 12 meses on-site. Abertura das propostas: 15/09/2026 às 9h.`;
  const EXEMPLO_RESULT = { objeto: "Aquisição de 40 notebooks para unidades escolares da Prefeitura, via pregão eletrônico.",
    pontos: ["Julgamento por menor preço por item; valor estimado de R$ 184.000,00.", "Habilitação exige regularidade fiscal nas três esferas, CNDT e atestado de capacidade técnica compatível.", "Entrega em 30 dias após a ordem de fornecimento, com garantia mínima de 12 meses on-site."],
    alerta: "Abertura em 15/09/2026 às 9h — confira o atestado de capacidade técnica e as certidões com antecedência." };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const render = (r) => {
    if (r.erro) { dOut.innerHTML = `<p class="demo-err">${esc(r.erro)}</p>`; return; }
    dOut.innerHTML = `<div class="demo-result"><h4>${esc(r.objeto || "")}</h4><ul>${(r.pontos || []).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>${r.alerta ? `<p class="demo-alert">${esc(r.alerta)}</p>` : ""}</div>`;
  };
  if (dIn && dOut && dRun) {
    dSample?.addEventListener("click", () => { dIn.value = EXEMPLO; dIn.focus(); });
    dRun.addEventListener("click", async () => {
      const texto = dIn.value.trim();
      if (texto.length < 12) { dOut.innerHTML = `<p class="demo-err">Cole um trecho de edital (ou clique em "Usar um exemplo").</p>`; return; }
      dRun.disabled = true;
      dOut.innerHTML = `<div class="demo-loading"><i></i><i></i><i></i> lendo o edital…</div>`;
      try {
        const r = await fetch(EDS_IA_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ modo: "edital", texto }) });
        const data = await r.json().catch(() => ({}));
        const semIA = r.status === 503 || r.status === 404 || (!data.objeto && !data.erro);
        if (semIA) {
          // Sem IA configurada: modo demonstração com resultado do exemplo
          dTag.textContent = "demonstração"; dTag.classList.add("is-demo");
          await new Promise((res) => setTimeout(res, 900));
          render(texto === EXEMPLO ? EXEMPLO_RESULT : { erro: "A análise ao vivo ainda não está ativa neste ambiente. Clique em \"Usar um exemplo\" para ver o formato do resultado." });
        } else render(data.erro && !r.ok ? { erro: data.erro } : data);
      } catch { render({ erro: "Não consegui falar com a IA agora. Tente novamente." }); }
      dRun.disabled = false;
    });
  }

  /* ---- Assistente ---- */
  const aT = document.getElementById("assistToggle"), aP = document.getElementById("assistPanel"),
        aC = document.getElementById("assistClose"), aL = document.getElementById("assistLog"),
        aF = document.getElementById("assistForm"), aI = document.getElementById("assistInput"),
        aChips = document.getElementById("assistChips");
  if (aT && aP) {
    const historico = [];
    const open = (o) => { aP.hidden = !o; aT.setAttribute("aria-expanded", String(o)); aT.style.display = o ? "none" : ""; if (o) aI?.focus(); };
    aT.addEventListener("click", () => open(true));
    aC?.addEventListener("click", () => open(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !aP.hidden) open(false); });
    const add = (cls, txt) => { const d = document.createElement("div"); d.className = `msg ${cls}`; d.textContent = txt; aL.appendChild(d); aL.scrollTop = aL.scrollHeight; return d; };
    const ask = async (q) => {
      add("msg-user", q); historico.push({ role: "user", content: q });
      const wait = add("msg-ai msg-wait", "pensando…");
      try {
        const r = await fetch(EDS_IA_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ modo: "chat", texto: q, historico: historico.slice(0, -1) }) });
        const data = await r.json().catch(() => ({}));
        let resp = data.resposta;
        if (r.status === 503 || r.status === 404 || (!data.resposta && !data.erro)) resp = "O assistente ao vivo ainda não está ativo neste ambiente. Fale com a equipe pelo WhatsApp: +55 87 99150-0600.";
        if (!resp) resp = data.erro || "Não consegui responder agora. Tente de novo ou chame no WhatsApp.";
        wait.className = "msg msg-ai"; wait.textContent = resp; historico.push({ role: "assistant", content: resp });
      } catch { wait.className = "msg msg-ai"; wait.textContent = "Falha de conexão. Tente novamente."; }
      aL.scrollTop = aL.scrollHeight;
    };
    aF?.addEventListener("submit", (e) => { e.preventDefault(); const q = aI.value.trim(); if (q.length < 2) return; aI.value = ""; ask(q); });
    aChips?.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { aChips.remove(); ask(b.textContent); } });
  }
});
