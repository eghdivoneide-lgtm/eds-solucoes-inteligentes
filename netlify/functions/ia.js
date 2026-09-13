/* ===================================================================
   EDS — Função serverless de IA (Netlify Functions, Node 18+)
   -------------------------------------------------------------------
   Dois modos, ambos via Anthropic Messages API:
     • "edital"   → resume um trecho de edital em 3 pontos (demo do hero)
     • "chat"     → assistente que responde sobre a EDS e seus produtos

   Configuração (Netlify → Site configuration → Environment variables):
     ANTHROPIC_API_KEY   obrigatório
     EDS_IA_MODEL        opcional (padrão: claude-sonnet-4-5)

   Sem a chave, a função devolve 503 e o front cai no "modo demonstração"
   (exemplo pré-calculado), então o site nunca quebra.
   =================================================================== */

const MODEL = process.env.EDS_IA_MODEL || "claude-sonnet-4-5";
const MAX_INPUT = 4000;     // caracteres aceitos por requisição
const MAX_TOKENS = 450;     // resposta curta = custo baixo e UX rápida

const FATOS_EDS = `
Você é o assistente do site da EDS Soluções Inteligentes (Araripina-PE, CNPJ 65.648.474/0001-90),
empresa brasileira de software, automação e IA aplicada, fundada por Egnaldo Dias da Silva.
Produtos em produção:
- LicitaEdge Pro: análise de editais com IA, geração de documentos jurídicos, pipeline de licitações
  (Lei 14.133). Teste grátis de 7 dias com 50 créditos, sem cartão. https://eds-licitaedg-pro.netlify.app/landing/
- EDS PlanejaEdge: planejador pedagógico com IA, planos de aula e avaliações alinhados à BNCC.
  100 créditos gratuitos sem cartão. https://planejaedge-eds.netlify.app/landing
- EDS Visual: estúdio de imagem com IA (restauração de fotos, retratos profissionais, ensaios).
  https://eds-visual-production.up.railway.app/landing.html
Em desenvolvimento: Analista Fiscal EDS (recuperação tributária) e Smarte Arquiteto.
Serviços: software sob medida, automação de processos, IA aplicada, dados e dashboards,
estruturação digital, consultoria. Todos os apps são PWAs. LGPD, isolamento de dados por usuário,
credenciais de IA nunca expostas no navegador.
Contato: WhatsApp +55 87 99150-0600, contato@edssi.com.br, seg–sex 8h–18h.
Regras: responda em português do Brasil, de forma curta (até 120 palavras), útil e honesta.
Não invente preços, prazos ou funcionalidades que não estão acima. Se não souber, diga que
a equipe responde pelo WhatsApp. Não fale de outros assuntos além da EDS e tecnologia aplicada.
`.trim();

const PROMPT_EDITAL = `
Você é o motor de análise do LicitaEdge Pro. O usuário vai colar um trecho de edital de licitação
(ou um texto parecido). Responda SOMENTE em JSON válido, sem markdown, neste formato:
{"objeto":"...", "pontos":["...","...","..."], "alerta":"..."}
- "objeto": o que está sendo licitado, em uma frase.
- "pontos": exatamente 3 itens curtos e práticos (prazos, requisitos de habilitação, critério de
  julgamento, valores, riscos) encontrados no texto. Se o texto não tiver a informação, diga
  "não informado no trecho".
- "alerta": o ponto que mais merece atenção do licitante, em uma frase.
Se o texto não parecer um edital, responda {"erro":"O texto não parece um edital. Cole um trecho de edital para análise."}.
`.trim();

const json = (status, body) => ({
  statusCode: status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { erro: "Método não permitido." });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json(503, { erro: "IA não configurada.", demo: true });

  let payload;
  try { payload = JSON.parse(event.body || "{}"); } catch { return json(400, { erro: "JSON inválido." }); }

  const modo = payload.modo === "chat" ? "chat" : "edital";
  const texto = String(payload.texto || "").trim().slice(0, MAX_INPUT);
  if (texto.length < 12) return json(400, { erro: "Texto muito curto." });

  // Histórico opcional do chat (só os últimos 6 turnos, já limitados em tamanho)
  const historico = Array.isArray(payload.historico)
    ? payload.historico.slice(-6).map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || "").slice(0, 1500),
      }))
    : [];

  const system = modo === "chat" ? FATOS_EDS : PROMPT_EDITAL;
  const messages = modo === "chat"
    ? [...historico, { role: "user", content: texto }]
    : [{ role: "user", content: `Trecho do edital:\n"""\n${texto}\n"""` }];

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system, messages }),
    });

    if (!r.ok) {
      const detalhe = await r.text().catch(() => "");
      console.error("Anthropic API", r.status, detalhe.slice(0, 300));
      return json(502, { erro: "A IA não respondeu agora. Tente de novo em instantes." });
    }

    const data = await r.json();
    const conteudo = (data.content || []).map((c) => c.text || "").join("").trim();

    if (modo === "chat") return json(200, { resposta: conteudo });

    // Modo edital: garantir JSON limpo para o front
    const m = conteudo.match(/\{[\s\S]*\}/);
    if (!m) return json(200, { erro: "Não consegui estruturar a análise. Tente outro trecho." });
    try { return json(200, JSON.parse(m[0])); }
    catch { return json(200, { erro: "Não consegui estruturar a análise. Tente outro trecho." }); }
  } catch (e) {
    console.error(e);
    return json(500, { erro: "Falha interna. Tente novamente." });
  }
};
