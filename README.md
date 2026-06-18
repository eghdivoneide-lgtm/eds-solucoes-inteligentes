# EDS Soluções Inteligentes — Site institucional

Landing page institucional em **HTML + CSS + JavaScript puro** (sem build, sem dependências).
Abre direto no navegador e pode ser hospedada gratuitamente em Vercel, Netlify ou GitHub Pages.

## 📁 Estrutura

```
SIte EDS/
├── index.html              ← página principal
├── assets/
│   ├── css/style.css       ← estilos
│   └── js/main.js          ← interações (menu, animações, formulário)
└── README.md
```

## ▶️ Como ver localmente

Basta abrir o arquivo `index.html` com dois cliques no navegador.
(Opcional) para um servidor local, dentro da pasta rode:

```bash
# Python
python -m http.server 5500
# ou Node
npx serve
```

E acesse `http://localhost:5500`.

## ⚙️ Personalização (importante)

| O quê | Onde | Detalhe |
|-------|------|---------|
| **Número do WhatsApp** | `assets/js/main.js`, linha `WHATSAPP_NUMERO` | Formato internacional só com dígitos: `55` + DDD + número. Ex.: `5511999999999`. **Troque o valor de exemplo!** |
| E-mail de contato | `index.html` (`mailLink`) e no rodapé | Substitua `contato@edssolucoes.com.br` |
| Textos / serviços | `index.html` | Seções `#servicos`, `#diferenciais`, etc. |
| Cores da marca | `assets/css/style.css` (`:root`) | Variáveis `--brand`, `--brand-2`, `--grad` |
| Horário de atendimento | `index.html` (bloco "Atendimento") | — |

## 📨 Como funciona o formulário

O site é estático (sem servidor), então o formulário **monta a mensagem e abre o WhatsApp**
da empresa já preenchido com os dados do cliente. É a forma mais simples e direta para
um negócio captar contatos sem custo de backend.

> Se no futuro você quiser receber por e-mail/banco de dados, dá para integrar com
> serviços como Formspree, Netlify Forms ou um backend próprio. É só pedir. 😉

## 🚀 Publicar

- **Netlify / Vercel:** arraste a pasta ou conecte o repositório — deploy automático.
- **GitHub Pages:** suba os arquivos e ative o Pages nas configurações do repositório.

---
Feito com ⚡ para a **EDS Soluções Inteligentes**.
