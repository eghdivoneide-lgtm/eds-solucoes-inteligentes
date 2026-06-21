/* ===================================================================
   EDS Soluções Inteligentes — Script principal
   Sem dependências. Menu, header, revelações e formulário → WhatsApp.
   =================================================================== */

/* >>> CONFIGURE AQUI <<<
   Número do WhatsApp em formato internacional, somente dígitos:
   DDI (55) + DDD + número. Ex.: "5587991500600"                       */
const WHATSAPP_NUMERO = "5587991500600";

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
      '3 plataformas no ar: <b>LicitaEdge</b>, <b>PlanejaEdge</b> e <b>Monitor</b>.',
      'Quer testar? Os apps têm <b>teste grátis, sem cartão</b>. 🎁',
      'Precisa de um sistema sob medida? <b>Fale com a EDS</b>. 💬',
      'Bateu uma dúvida? Dá uma olhada no nosso <b>FAQ</b>. ✅'
    ],
    i = 0, off = false;
  var m = document.getElementById('mascot'), b = document.getElementById('m-bubble');
  if (!m || !b) return;
  function say(t) { b.innerHTML = t; b.classList.add('show'); clearTimeout(say._t); say._t = setTimeout(function () { b.classList.remove('show'); }, 5600); }
  function step() { if (off) return; m.style.left = spots[i % spots.length]; say(tips[i % tips.length]); i++; }
  window.mascotPoke = function () { if (off) return; say(tips[i % tips.length]); i++; };
  window.mascotDismiss = function (e) { e.stopPropagation(); off = true; m.style.display = 'none'; };
  setTimeout(function () { say(tips[0]); i = 1; }, 1600);
  setInterval(step, 9000);
})();
