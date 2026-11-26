/* ===================================================================
   EDS — Atendimento humano: ponte entre o chat do site e o WhatsApp
   -------------------------------------------------------------------
   Esta função é só um porteiro. Ela guarda o token da ponte no servidor
   (o navegador nunca o vê) e repassa três coisas:

     POST {acao:"mensagem", conversa?, nome?, texto}  -> cai no WhatsApp
     GET  ?conversa=A3F2&desde=0                      -> respostas humanas
     POST {acao:"aviso", titulo, corpo}               -> aviso de mão única

   TODA mensagem do visitante é repassada, mesmo quando a IA responde
   sozinha: o Mestre quis ver a conversa inteira em tempo real.

   Variáveis (Netlify → Environment variables):
     PONTE_URL     ex.: https://ponte-whatsapp-production-xxxx.up.railway.app
     PONTE_TOKEN   o mesmo segredo configurado na ponte

   Sem as duas, devolve 503 e o site segue funcionando só com a IA.
   =================================================================== */
const URL_PONTE = (process.env.PONTE_URL || "").replace(/\/+$/, "");
const TOKEN = process.env.PONTE_TOKEN || "";
const TEMPO = 8000;   // a ponte pode estar reconectando; não prender o visitante

const json = (status, body) => ({
  statusCode: status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  body: JSON.stringify(body),
});

async function chamar(caminho, opcoes = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TEMPO);
  try {
    const r = await fetch(`${URL_PONTE}${caminho}`, {
      ...opcoes,
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", "x-ponte-token": TOKEN, ...(opcoes.headers || {}) },
    });
    const dados = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, dados };
  } finally {
    clearTimeout(t);
  }
}

exports.handler = async (event) => {
  if (!URL_PONTE || !TOKEN) return json(503, { erro: "ponte não configurada", desligada: true });

  try {
    if (event.httpMethod === "GET") {
      const q = event.queryStringParameters || {};
      const conversa = String(q.conversa || "").slice(0, 8);
      if (!conversa) return json(400, { erro: "sem conversa" });
      const desde = Number(q.desde || 0) || 0;
      const r = await chamar(`/respostas?conversa=${encodeURIComponent(conversa)}&desde=${desde}`);
      return json(r.ok ? 200 : 502, r.dados);
    }

    if (event.httpMethod !== "POST") return json(405, { erro: "método não permitido" });

    let p;
    try { p = JSON.parse(event.body || "{}"); } catch { return json(400, { erro: "JSON inválido" }); }

    if (p.acao === "aviso") {
      const r = await chamar("/aviso", {
        method: "POST",
        body: JSON.stringify({ titulo: String(p.titulo || "Contato pelo site").slice(0, 120),
                               corpo: String(p.corpo || "").slice(0, 3000) }),
      });
      return json(r.ok ? 200 : 502, r.dados);
    }

    const texto = String(p.texto || "").trim();
    if (texto.length < 2) return json(400, { erro: "texto curto" });
    const r = await chamar("/mensagem", {
      method: "POST",
      body: JSON.stringify({
        conversa: String(p.conversa || "").slice(0, 8),
        nome: p.nome ? String(p.nome).slice(0, 80) : null,
        origem: "site",
        texto: texto.slice(0, 2000),
      }),
    });
    return json(r.ok ? 200 : 502, r.dados);
  } catch (e) {
    // Nunca derrubar o chat por causa da ponte.
    return json(502, { erro: "ponte fora do ar", detalhe: String(e.message || e).slice(0, 120) });
  }
};
