// ===== A API fica no mesmo site (pasta api/, função Python na Vercel) =====
const API = '/api';

// ===== Tema claro / escuro =====
const root = document.documentElement;
if (localStorage.getItem('tema') === 'light') root.classList.remove('dark'); else root.classList.add('dark');
document.querySelectorAll('[data-theme-toggle]').forEach(btn => btn.addEventListener('click', () => {
  root.classList.toggle('dark');
  localStorage.setItem('tema', root.classList.contains('dark') ? 'dark' : 'light');
}));

// ===== Menu mobile =====
const menuBtn = document.querySelector('[data-menu-btn]');
const menu = document.querySelector('[data-menu]');
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => menu.classList.toggle('hidden'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.add('hidden')));
}

// ===== Header muda ao rolar =====
const header = document.querySelector('header');
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 40));

document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

// ===== Conteúdo vindo do banco (editado no painel admin) =====
// Se o back-end estiver desligado, o site mostra o conteúdo que já está no HTML.
async function getJSON(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 2500);
  try { const r = await fetch(url, { signal: ctrl.signal }); return r.ok ? await r.json() : null; }
  catch { return null; } finally { clearTimeout(t); }
}

const hexParaRgb = hex => { const n = parseInt(hex.slice(1), 16); return `${n >> 16 & 255} ${n >> 8 & 255} ${n & 255}`; };
const soDigitos = s => (s || '').replace(/\D/g, '');
const LINKS = {
  whatsapp: v => `https://wa.me/55${soDigitos(v)}`,
  telefone: v => `tel:+55${soDigitos(v)}`,
  email: v => `mailto:${v}`,
  instagram: v => `https://instagram.com/${v.replace('@', '')}`,
};

function aplicarConfig(c) {
  for (const [nome, hex] of Object.entries(c.cores || {}))
    if (/^#[0-9a-f]{6}$/i.test(hex)) root.style.setProperty(`--${nome}`, hexParaRgb(hex));
  document.querySelectorAll('[data-e]').forEach(el => { const v = c[el.dataset.e]; if (v) el.textContent = v; });
  document.querySelectorAll('[data-e-src]').forEach(el => { const v = c[el.dataset.eSrc]; if (v) el.src = v; });
  document.querySelectorAll('[data-e-href]').forEach(el => { const v = c[el.dataset.eHref]; if (v) el.href = v; });
  document.querySelectorAll('[data-e-count]').forEach(el => { const v = c[el.dataset.eCount]; if (v) el.dataset.count = v; });
  document.querySelectorAll('[data-link]').forEach(el => { const v = c[el.dataset.link]; if (v) el.href = LINKS[el.dataset.link](v); });
  if (c.nome) document.title = c.titulo_aba || c.nome;
}

function renderLista(box, itens) {
  const tpl = box.querySelector('template');
  [...box.children].forEach(ch => ch !== tpl && ch.remove());
  for (const item of itens) {
    const el = tpl.content.firstElementChild.cloneNode(true);
    el.querySelectorAll('[data-i]').forEach(n => { n.textContent = item[n.dataset.i] || ''; n.hidden = !item[n.dataset.i]; });
    el.querySelectorAll('[data-i-inicial]').forEach(n => n.textContent = (item.titulo || '?')[0].toUpperCase());
    el.querySelectorAll('[data-i-icon]').forEach(n => n.setAttribute('data-lucide', item.icone || 'camera'));
    el.querySelectorAll('[data-i-href]').forEach(n => { if (item.link) n.href = item.link; });
    el.querySelectorAll('[data-i-img]').forEach(n => {
      if (!item.imagem_url) return;
      const img = document.createElement('img');
      img.src = item.imagem_url; img.alt = item.titulo || ''; img.className = n.dataset.iImg;
      n.replaceWith(img);
    });
    box.appendChild(el);
  }
}

async function carregarConteudo() {
  const [config, itens] = await Promise.all([getJSON(`${API}/config`), getJSON(`${API}/itens`)]);
  if (config) aplicarConfig(config);
  if (itens) document.querySelectorAll('[data-lista]').forEach(box => renderLista(box, itens.filter(i => i.tipo === box.dataset.lista)));
}

// ===== Animações (GSAP + ScrollTrigger + Lenis) =====
function animar() {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const alvo = document.querySelector(a.getAttribute('href'));
      if (alvo) { e.preventDefault(); lenis.scrollTo(alvo, { offset: -80 }); }
    }));
  }

  gsap.from('[data-hero] > *', { y: 60, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out' });
  gsap.from('[data-hero-img]', { scale: 1.15, opacity: 0, duration: 1.6, ease: 'power3.out' });
  document.querySelectorAll('[data-parallax]').forEach(el =>
    gsap.to(el, { yPercent: 15, ease: 'none', scrollTrigger: { trigger: el, scrub: true } }));
  gsap.utils.toArray('[data-reveal]').forEach(el =>
    gsap.from(el, { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }));
  gsap.utils.toArray('[data-stagger]').forEach(grp =>
    gsap.from(grp.children, { y: 40, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: grp, start: 'top 85%' } }));
  document.querySelectorAll('[data-count]').forEach(el => {
    const obj = { v: 0 };
    gsap.to(obj, { v: +el.dataset.count, duration: 2, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => el.textContent = Math.round(obj.v) });
  });
  document.querySelectorAll('[data-marquee]').forEach(m => gsap.to(m, { xPercent: -50, duration: 25, ease: 'none', repeat: -1 }));
}

// Primeiro carrega o conteúdo do banco, depois desenha os ícones e anima
carregarConteudo().finally(() => { window.lucide?.createIcons(); animar(); });

// ===== Brilho que segue o mouse (desktop) =====
const glow = document.querySelector('[data-glow]');
if (glow && matchMedia('(pointer:fine)').matches)
  window.addEventListener('mousemove', e => glow.style.transform = `translate(${e.clientX - 200}px, ${e.clientY - 200}px)`);

// ===== Formulário de contato → back-end → Supabase =====
document.querySelectorAll('form[data-contato]').forEach(form => form.addEventListener('submit', async e => {
  e.preventDefault();
  const status = form.querySelector('[data-status]');
  const dados = Object.fromEntries(new FormData(form));
  status.textContent = 'Enviando...';
  try {
    const r = await fetch(`${API}/contato`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
    if (!r.ok) throw new Error();
    status.textContent = 'Mensagem enviada! Entraremos em contato em breve.';
    form.reset();
  } catch {
    status.textContent = 'Não foi possível enviar agora. Tente pelo WhatsApp.';
  }
}));
