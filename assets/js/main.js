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

  /* ---- Malha de gradiente animada (canvas leve, sem libs) ---- */
  const canvas = document.getElementById("heroMesh");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    const blobs = [
      { x: .72, y: .35, r: .42, c: "rgba(71, 78, 208, .55)",  dx: .00012, dy: .00009 },
      { x: .35, y: .70, r: .38, c: "rgba(110, 231, 200, .22)", dx: -.0001, dy: .00011 },
      { x: .85, y: .85, r: .30, c: "rgba(143, 153, 255, .35)", dx: -.00008, dy: -.0001 },
    ];
    let w, h, raf, t0 = performance.now();
    const resize = () => { const r = canvas.getBoundingClientRect(); w = canvas.width = Math.round(r.width * .5); h = canvas.height = Math.round(r.height * .5); };
    const draw = (now) => {
      const t = now - t0;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      blobs.forEach((b, i) => {
        const x = (b.x + Math.sin(t * b.dx + i) * .08) * w;
        const y = (b.y + Math.cos(t * b.dy + i * 2) * .08) * h;
        const r = b.r * Math.max(w, h);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, b.c); g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
      raf = requestAnimationFrame(draw);
    };
    resize(); window.addEventListener("resize", resize, { passive: true });
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(draw); } else { cancelAnimationFrame(raf); raf = 0; } });
    io.observe(canvas);
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
