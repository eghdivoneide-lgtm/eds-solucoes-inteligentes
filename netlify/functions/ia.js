/* ===================================================================
   EDS — Função serverless de IA (Netlify Functions, Node 18+)
   -------------------------------------------------------------------
   Dois modos, ambos via Anthropic Messages API:
     • "edital"   → resume um trecho de edital em 3 pontos (demo do hero)
     • "chat"     → assistente que responde sobre a EDS e seus produtos

   Configuração (Netlify → Site configuration → Environment variables):
     ANTHROPIC_API_KEY   obrigatório
     EDS_IA_MODEL        opcional (padrão: claude-opus-5)
     EDS_IA_ESFORCO      opcional (low | medium | high; padrão: medium)

   Sem a chave, a função devolve 503 e o front cai no "modo demonstração"
   (exemplo pré-calculado), então o site nunca quebra.
   =================================================================== */

// Opus 5 e o modelo mais capaz da familia atual. Para gastar menos, basta
// definir EDS_IA_MODEL=claude-sonnet-5 na Netlify (mesma API, ~2,5x mais barato).
const MODEL = process.env.EDS_IA_MODEL || "claude-opus-5";
const ESFORCO = process.env.EDS_IA_ESFORCO || "medium";  // low | medium | high
const MAX_INPUT = 4000;     // caracteres aceitos por requisição
// Precisa caber raciocinio + resposta: com teto curto a resposta sai cortada.
const MAX_TOKENS = 4000;

const FATOS_EDS = `
Você é o atendimento do site da EDS Soluções Inteligentes (Araripina-PE, CNPJ 65.648.474/0001-90),
empresa brasileira de software, automação e IA aplicada, fundada por Egnaldo Dias da Silva.

PRODUTOS EM PRODUÇÃO
- LicitaEdge Pro: análise de editais com IA, geração de documentos jurídicos e pipeline de
  licitações (Lei 14.133), da publicação do edital até o contrato. Teste grátis de 7 dias com
  50 créditos, sem cartão. https://eds-licitaedg-pro.netlify.app/landing/
  Para quem: empresas que vendem para o poder público e setores de licitação de prefeituras.
- EDS PlanejaEdge: planejador pedagógico com IA — planos de aula, avaliações e materiais
  alinhados à BNCC. 100 créditos gratuitos, sem cartão. https://planejaedge-eds.netlify.app/landing
  Para quem: professores, coordenadores e escolas.
- EDS Visual: estúdio de imagem com IA — restauração e colorização de fotos antigas, retratos
  profissionais, ensaios temáticos, troca de cenário e pet art.
  https://eds-visual-production.up.railway.app/landing.html
- EDS TeacherDeck: a rotina avaliativa do professor num lugar só — monta a prova nominal por
  aluno com apoio de IA, corrige pela foto do cartão-resposta e lança a nota no diário.
  60 créditos grátis ao criar conta, sem cartão. https://teacherdeck.edssi.com.br/landing.html
  Está PUBLICADO NA GOOGLE PLAY desde outubro de 2026 (lançado em seis países):
  https://play.google.com/store/apps/details?id=br.com.edssi.teacherdeck
  Para quem: professores, coordenadores e escolas.
- ObraEdge: controladoria financeira de obras — custo real de cada imóvel, orçado contra
  realizado e margem de lucro com fidelidade. Demonstração sem cadastro em
  https://obraedge-vitrine.netlify.app e acesso com conta em https://obra-edge.netlify.app
  Para quem: construtoras, incorporadoras e quem toca obra por conta própria.
Em desenvolvimento: Analista Fiscal EDS (recuperação tributária) e Smarte Arquiteto
(fluxo do arquiteto, do projeto à entrega). Ainda sem data de lançamento.
Ao todo: CINCO plataformas em produção e duas em desenvolvimento.

SERVIÇOS SOB MEDIDA
Software e sistemas sob medida; automação de processos; IA aplicada a um problema definido;
dados, análise e dashboards; estruturação digital de operações; consultoria de eficiência
(diagnóstico, roadmap, arquitetura e priorização antes de construir).

CONTEÚDO EDUCACIONAL E MÍDIA
A EDS não para no software: também ajuda a produzir o conteúdo, do roteiro à peça pronta para
publicar — videoaulas e cursos completos, livros digitais (inclusive publicação em loja como a
Amazon), podcasts, narração e locução, e vídeos de produto e de apresentação. Serve a quem dá
aula, a quem vende curso, a quem quer lançar um livro e a empresa que precisa explicar o que
faz. É uma frente de serviço, orçada caso a caso como qualquer projeto sob medida.

COMO A EDS TRABALHA
Atende todo o Brasil, 100% remoto. Todos os apps são PWAs e rodam em qualquer aparelho com
navegador, sem instalar nada — e podem ser instalados na tela inicial direto pelo navegador.
Quando o projeto pede loja de aplicativos, a EDS empacota, assina e publica na Google Play, e
cuida das atualizações; o TeacherDeck é a prova disso, publicado desde outubro de 2026. Ou
seja: a EDS não entrega "só um site" — entrega o aplicativo na loja, com alcance internacional. Segurança desde o início: LGPD (Lei 13.709/2018), isolamento de
dados por usuário, autenticação segura e credenciais de IA nunca expostas no navegador.
Cada produto nasce de uma dor real — a EDS não vende promessa, vende o que já está no ar.

CONTATO
Formulário de contato no próprio site (seção "Contato") e suporte@edssi.com.br.
Atendimento de segunda a sexta, das 8h às 18h. Para projetos sob medida o suporte é acordado
em contrato. NÃO divulgue telefone nem WhatsApp: esses canais estão temporariamente fora.

COMO RESPONDER
- Português do Brasil, direto e útil, no máximo 180 palavras. Use lista curta quando ajudar
  a entender; fora isso, escreva em texto corrido. Nada de enrolação nem de jargão.
- Honestidade acima de tudo: NUNCA invente preço, prazo, número ou funcionalidade que não
  esteja acima. Se não souber, diga que não sabe e ofereça encaminhar para a equipe.
- Quando a pessoa descrever um caso concreto (um problema do negócio dela, um orçamento, uma
  ideia de sistema), faça no máximo duas perguntas objetivas para entender o contexto e, em
  seguida, convide-a a deixar nome e e-mail no formulário de contato do site, ou a escrever
  para suporte@edssi.com.br, para a equipe responder com uma proposta.
- Se pedir para falar com uma pessoa, diga que é só deixar nome, e-mail e a mensagem no
  formulário de contato do site que a equipe responde em horário comercial.
- Fale só sobre a EDS e tecnologia aplicada ao negócio de quem pergunta. Para qualquer outro
  assunto, diga gentilmente que ali você só trata dos assuntos da EDS.
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
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        // "effort" controla a profundidade do raciocínio e, com ela, o custo.
        output_config: { effort: ESFORCO },
        system,
        messages,
      }),
    });

    if (!r.ok) {
      const detalhe = await r.text().catch(() => "");
      console.error("Anthropic API", r.status, detalhe.slice(0, 300));
      return json(502, { erro: "A IA não respondeu agora. Tente de novo em instantes." });
    }

    const data = await r.json();

    // Os modelos atuais podem recusar um pedido devolvendo HTTP 200 com
    // stop_reason "refusal" — sem isto, o visitante veria uma resposta vazia.
    if (data.stop_reason === "refusal") {
      return json(200, { resposta: "Não consigo tratar esse assunto por aqui. Se for sobre a EDS ou sobre tecnologia aplicada ao seu negócio, me pergunte de outro jeito — ou escreva para suporte@edssi.com.br." });
    }

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
