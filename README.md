<p align="center"><img src="assets/logo.png" width="110" /></p>

<h1 align="center">📷 Site Institucional — Agência de Fotografia</h1>

<p align="center">Site institucional moderno e animado da agência de fotografia de <b>Ana Laura</b> e <b>Bruno</b>.<br/>Projeto desenvolvido no <b>SENAI</b> com metodologia <b>Scrum</b>.</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" />
</p>

---

## 📌 Sobre

Site que apresenta a agência: os serviços de fotografia, a equipe, o portfólio e o que os clientes dizem.
Este projeto corresponde à **Tarefa 2** do quadro Scrum.

## 🧩 Seções (requisitos)

| ✔ | Requisito | Onde está |
|---|---|---|
| ✅ | Home | `#home` |
| ✅ | Serviços | `#servicos` (Ensaios, Eventos, Fotos de Produto, Edição) |
| ✅ | Equipe / Quem somos | `#equipe` |
| ✅ | Portfólio | `#portfolio` (inclui a landing page do cliente) |
| ✅ | Depoimentos | `#depoimentos` |
| ✅ | Contatos | `#contatos` + redes sociais no rodapé |

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura semântica das páginas |
| **Tailwind CSS** (CDN) | Layout, responsividade e tema claro/escuro |
| **CSS3** | Efeitos extras (vidro, brilho do cursor, placeholders) |
| **JavaScript** | Tema, menu mobile, formulário e animações |
| **GSAP + ScrollTrigger** | Animações de entrada, parallax, contadores e marquee |
| **Lenis** | Rolagem suave |
| **Lucide Icons** | Ícones em SVG editáveis com as cores da marca |
| **Python + Flask** | Back-end (API) que conversa com o banco |
| **Supabase** | Banco de dados (PostgreSQL) e armazenamento das imagens |

## 🎨 Paleta de cores

| Cor | Hex | Nome no Tailwind |
|---|---|---|
| ![](https://placehold.co/20x20/10288C/10288C.png) | `#10288C` | `royal` |
| ![](https://placehold.co/20x20/1C285A/1C285A.png) | `#1C285A` | `navy` |
| ![](https://placehold.co/20x20/7C93F1/7C93F1.png) | `#7C93F1` | `periwinkle` |
| ![](https://placehold.co/20x20/B5C4FF/B5C4FF.png) | `#B5C4FF` | `mist` |
| ![](https://placehold.co/20x20/E3E9FF/E3E9FF.png) | `#E3E9FF` | `ice` |
| ![](https://placehold.co/20x20/FFFFFF/FFFFFF.png) | `#FFFFFF` | `white` |
| ![](https://placehold.co/20x20/000000/000000.png) | `#000000` | `black` |

## ✨ Funcionalidades

- 🌗 **Tema claro e escuro** — escuro por padrão, a escolha fica salva no navegador
- 📱 **Responsivo** — celular, tablet e desktop, com menu hambúrguer no mobile
- 🎬 **Animações modernas** — elementos surgem ao rolar, parallax, contadores e brilho que segue o mouse
- ✉️ **Formulário funcional** — as mensagens vão para o Supabase e aparecem no painel admin
- 🛠️ **Editável pelo painel admin** — cores, textos, contatos, imagens e listas
- ♿ **Acessibilidade** — `aria-label` nos botões e respeito ao `prefers-reduced-motion`

## 🚀 Como rodar no PC

```bash
pip install flask
python api/index.py
```
Abre em **http://localhost:5002**. Antes, crie o arquivo `.env` nesta pasta a partir do `.env.example` (URL e chave do Supabase).

> O conteúdo (textos, cores, imagens, listas) vem do **Supabase** e é editado no painel admin (outro projeto).
> Se a API estiver fora do ar, o site continua funcionando com o conteúdo padrão escrito no HTML.

## ☁️ Deploy na Vercel

Este site é um **projeto independente** na Vercel:

1. Na Vercel: **Add New → Project** e escolha o repositório
2. Em **Root Directory**, selecione a pasta **`site-agencia`**
3. Em **Environment Variables**, adicione `SUPABASE_URL` e `SUPABASE_KEY`
4. **Deploy** (nome sugerido: `anubra-agencia`)

A Vercel publica o HTML e transforma `api/index.py` numa função Python automaticamente.

## 🔌 API deste site

| Método | Rota | O que faz |
|---|---|---|
| `GET` | `/api/config` | textos, cores, contatos e imagens |
| `GET` | `/api/itens` | listas do site |
| `POST` | `/api/contato` | salva a mensagem do formulário |

## 📁 Estrutura

```
site-agencia/
├── index.html          # Página (elementos editáveis marcados com data-e / data-lista)
├── assets/             # logo, banner, style.css (cores em variáveis) e main.js
├── api/index.py        # API em Python (Flask) → função serverless na Vercel
├── requirements.txt    # dependências Python (flask)
├── .env.example        # modelo das variáveis (o .env real nunca vai pro Git)
├── test_api.py         # teste da API (python test_api.py)
└── README.md
```

## 📝 A fazer

- [ ] Definir o nome oficial da agência (hoje: "Agência")
- [ ] Adicionar fotos da equipe e dos trabalhos no portfólio
- [ ] Trocar os depoimentos de exemplo por depoimentos reais

---

<p align="center">Feito com 💙 por Ana Laura e Bruno · SENAI</p>
