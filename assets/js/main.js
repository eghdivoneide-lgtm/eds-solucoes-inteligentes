/* ===================================================================
   EDS Soluções Inteligentes — Script principal
   =================================================================== */

/* >>> CONFIGURE AQUI <<<
   Número do WhatsApp no formato internacional, somente dígitos.
   Ex.: Brasil (DDI 55) + DDD 11 + número  ->  "5511999999999"          */
const WHATSAPP_NUMERO = "5587991500600";

document.addEventListener("DOMContentLoaded", () => {
  const wppBase = `https://wa.me/${WHATSAPP_NUMERO}`;

  /* ---- Ano do rodapé ---- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Links de WhatsApp estáticos ---- */
  const msgPadrao = encodeURIComponent(
    "Olá! Vim pelo site da EDS Soluções Inteligentes e gostaria de mais informações."
  );
  ["whatsLink", "whatsCta", "whatsFloat"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = `${wppBase}?text=${msgPadrao}`;
  });

  /* ---- Header com sombra ao rolar ---- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Menu mobile ---- */
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("nav");
  const closeMenu = () => {
    nav.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  /* ---- Formulário -> WhatsApp ---- */
  const form = document.getElementById("contactForm");
  const hint = document.getElementById("formHint");

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
      `*Serviço:* ${assunto}`,
      "",
      `*Mensagem:*`,
      mensagem,
    ].filter(Boolean);

    const url = `${wppBase}?text=${encodeURIComponent(linhas.join("\n"))}`;
    window.open(url, "_blank", "noopener");

    hint.textContent = "Abrindo o WhatsApp... se não abrir, verifique o bloqueador de pop-ups.";
    hint.classList.add("ok");
    form.reset();
  });
});
