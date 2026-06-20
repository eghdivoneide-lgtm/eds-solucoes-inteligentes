# EDS Soluções Inteligentes — Site institucional

Site institucional premium em **HTML + CSS + JavaScript puro** — sem build, sem
dependências, sem framework. Abre direto no navegador e publica em qualquer host
estático (Netlify, Vercel, GitHub Pages).

## 📁 Estrutura

```
.
├── index.html              ← página única (todas as seções)
├── netlify.toml            ← configuração de publicação na Netlify
├── assets/
│   ├── css/style.css       ← design system + estilos
│   └── js/main.js          ← menu, header, revelações, formulário → WhatsApp
└── README.md
```

## ▶️ Rodar localmente (VS Code)

A forma mais simples é a extensão **Live Server** do VS Code: clique com o botão
direito em `index.html` → **Open with Live Server**.

Ou por linha de comando, dentro da pasta do projeto:

```bash
# Python
python -m http.server 5500
# ou Node
npx serve
```

E acesse `http://localhost:5500`.

## 🎨 Design system (resumo)

Tudo é controlado por variáveis em `assets/css/style.css` (`:root`):

| Token | O que controla |
|-------|----------------|
| `--accent` | Cor de destaque única (índigo `#6e8bff`) |
| `--ink`, `--surface` | Base near-black e superfícies elevadas |
| `--font-display` | Títulos — **Fraunces** (serifada editorial) |
| `--font-sans` | Corpo e UI — **Manrope** |
| `--font-mono` | Labels técnicos — **Space Mono** |
| `--space-section`, `--radius`, `--shadow` | Ritmo, formas e profundidade |

Trocar a identidade visual = alterar essas variáveis. Sem caça a valores soltos.

## ⚙️ Personalização rápida

| O quê | Onde |
|-------|------|
| **WhatsApp** | `assets/js/main.js` → `WHATSAPP_NUMERO` (só dígitos: `55` + DDD + número) |
| E-mail | `index.html` (`mailLink` e rodapé) |
| Produtos / links | `index.html` → seção `#produtos` |
| Textos das seções | `index.html` |
| Depoimentos | `index.html` → seção `#prova` (há um bloco-modelo comentado pronto) |
| Cores / fontes | `assets/css/style.css` (`:root`) |

## 📨 Formulário de contato

O site é estático (sem servidor): o formulário **monta uma mensagem organizada e
abre o WhatsApp** da empresa já preenchido. É a forma mais direta de captar contato
sem custo de backend. Para receber por e-mail no futuro, dá para integrar com
Netlify Forms ou Formspree.

## 🚀 Publicar na Netlify

1. **Via interface:** arraste a pasta do projeto em `app.netlify.com/drop`, ou
   conecte o repositório do GitHub.
2. Configurações de build (já cobertas pelo `netlify.toml`):
   - **Build command:** *(vazio)*
   - **Publish directory:** `.`
3. Deploy automático a cada `push` no branch conectado.

> GitHub Pages / Vercel também funcionam: é um site estático puro.

---
Feito com engenharia própria para a **EDS Soluções Inteligentes**.
