// Gera assets/tailwind.css (rode de novo sempre que mudar classes no HTML/JS):
//   npx tailwindcss@3 -i assets/tailwind.src.css -o assets/tailwind.css --minify
const cor = v => `rgb(var(--${v}) / <alpha-value>)`;  // as cores vêm das variáveis CSS para o painel admin poder trocar
module.exports = {
  content: ['index.html', 'assets/main.js'],
  darkMode: 'class',
  theme: { extend: { colors: { royal: cor('royal'), navy: cor('navy'), periwinkle: cor('periwinkle'), mist: cor('mist'), ice: cor('ice') } } },
};
