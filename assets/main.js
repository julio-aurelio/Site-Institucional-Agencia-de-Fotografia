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
  const t = setTimeout(() => ctrl.abort(), 8000);
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
  document.querySelectorAll('[data-e]').forEach(el => { const v = c[el.dataset.e]; if (v) { el.textContent = v; el.hidden = false; } });
  document.querySelectorAll('[data-e-src]').forEach(el => { const v = c[el.dataset.eSrc]; if (v) el.src = v; });
  document.querySelectorAll('[data-e-href]').forEach(el => { const v = c[el.dataset.eHref]; if (v) el.href = v; });
  document.querySelectorAll('[data-e-count]').forEach(el => { const v = c[el.dataset.eCount]; if (v) el.dataset.count = v; });
  document.querySelectorAll('[data-link]').forEach(el => { const v = c[el.dataset.link]; if (v) el.href = LINKS[el.dataset.link](v); });
  if (c.nome) document.title = c.titulo_aba || c.nome;
}

// O painel guarda a posição escolhida no fim do link da imagem: "...jpg#pos=50,30" (x%, y%)
const urlImagem = url => (url || '').split('#pos=')[0];
const posicaoImagem = url => {
  const [x, y] = ((url || '').split('#pos=')[1] || '').split(',').map(n => Math.min(100, Math.max(0, parseFloat(n))));
  return `${isNaN(x) ? 50 : x}% ${isNaN(y) ? 50 : y}%`;
};

function renderLista(box, itens) {
  const tpl = box.querySelector('template');
  [...box.children].forEach(ch => ch !== tpl && ch.remove());
  for (const item of itens) {
    const el = tpl.content.firstElementChild.cloneNode(true);
    el.dataset.id = item.id;
    el.querySelectorAll('[data-i]').forEach(n => { n.textContent = item[n.dataset.i] || ''; n.hidden = !item[n.dataset.i]; });
    el.querySelectorAll('[data-i-inicial]').forEach(n => n.textContent = (item.titulo || '?')[0].toUpperCase());
    el.querySelectorAll('[data-i-icon]').forEach(n => n.setAttribute('data-lucide', item.icone || 'camera'));
    el.querySelectorAll('[data-i-href]').forEach(n => { if (item.link) n.href = item.link; });
    el.querySelectorAll('[data-i-img]').forEach(n => {
      if (!item.imagem_url) return;
      const img = document.createElement('img');
      img.src = urlImagem(item.imagem_url); img.alt = item.titulo || ''; img.className = n.dataset.iImg;
      img.loading = 'lazy'; img.style.objectPosition = posicaoImagem(item.imagem_url);
      n.replaceWith(img);
    });
    box.appendChild(el);
  }
}

async function carregarConteudo() {
  const [config, itens] = await Promise.all([getJSON(`${API}/config`), getJSON(`${API}/itens`)]);
  if (config) aplicarConfig(config);
  if (itens) document.querySelectorAll('[data-lista]').forEach(box => renderLista(box, itens.filter(i => i.tipo === box.dataset.lista)));
  if (itens) ligarGalerias(itens, config?.galerias || {});
}

// ===== Animações (GSAP + ScrollTrigger + Lenis) =====
let lenis = null;
function animar() {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.1 });
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

// ===== Mural de fotos do portfólio =====
// Opcional: só os projetos com fotos na galeria (painel admin) ganham o mural; os outros continuam como antes.
const mural = document.querySelector('#mural');
const zoom = mural?.querySelector('[data-mural-zoom]');
const zoomImg = mural?.querySelector('[data-zoom-img]');
const semAnimacao = () => !window.gsap || matchMedia('(prefers-reduced-motion: reduce)').matches;
let fotosMural = [], fotoAtual = 0;

function ligarGalerias(itens, galerias) {
  if (!mural) return;
  document.querySelectorAll('[data-lista="portfolio"] > [data-id]').forEach(card => {
    const item = itens.find(i => String(i.id) === card.dataset.id);
    const fotos = (galerias[card.dataset.id] || []).filter(u => /^https?:\/\//i.test(u));
    if (!item || !fotos.length) return;
    const selo = document.createElement('span');
    selo.className = 'absolute top-5 right-5 z-[1] inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur text-white text-xs font-semibold opacity-90 group-hover:opacity-100 group-hover:scale-105 transition';
    selo.innerHTML = '<i data-lucide="images" class="w-4 h-4"></i>';
    selo.append(`${fotos.length} ${fotos.length === 1 ? 'foto' : 'fotos'}`);
    card.append(selo);
    card.setAttribute('aria-haspopup', 'dialog');
    card.addEventListener('click', e => { e.preventDefault(); abrirMural(item, fotos); });
  });
}

function abrirMural(item, fotos) {
  fotosMural = fotos;
  mural.querySelector('[data-mural-sub]').textContent = item.subtitulo || '';
  mural.querySelector('[data-mural-titulo]').textContent = item.titulo || '';
  mural.querySelector('[data-mural-total]').textContent = `${fotos.length} ${fotos.length === 1 ? 'foto' : 'fotos'}`;
  const link = mural.querySelector('[data-mural-link]');
  link.classList.toggle('sm:inline-flex', !!item.link);
  if (item.link) link.href = item.link;
  const grade = mural.querySelector('[data-mural-fotos]');
  grade.replaceChildren(...fotos.map((url, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'polaroid';
    b.style.setProperty('--giro', `${(Math.random() * 10 - 5).toFixed(1)}deg`);
    b.setAttribute('aria-label', `Ampliar foto ${i + 1} de ${fotos.length}`);
    const img = new Image();
    img.src = url; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
    const n = document.createElement('span');
    n.textContent = String(i + 1).padStart(2, '0');
    b.append(img, n);
    b.addEventListener('click', () => abrirZoom(i));
    return b;
  }));
  zoom.hidden = true;
  mural.scrollTop = 0;
  mural.showModal();
  lenis?.stop();
  document.documentElement.style.overflow = 'hidden';
  if (semAnimacao()) return;
  gsap.fromTo(mural.querySelector('.mural-grade'), { y: 80, opacity: 0, scale: .96 }, { y: 0, opacity: 1, scale: 1, duration: .8, ease: 'power3.out' });
  // cada polaroid "cai" e balança presa no prendedor
  gsap.fromTo(grade.children, { y: -160, opacity: 0, rotation: () => gsap.utils.random(-28, 28) },
    { y: 0, opacity: 1, rotation: 0, duration: 1.3, ease: 'elastic.out(1, .45)', stagger: { each: .07, from: 'random' }, delay: .25, clearProps: 'transform,opacity' });
}

function fecharMural() {
  const fim = () => { mural.close(); lenis?.start(); document.documentElement.style.overflow = ''; };
  if (semAnimacao()) return fim();
  gsap.to(mural.querySelector('.mural-quadro'), { y: 50, opacity: 0, duration: .35, ease: 'power2.in',
    onComplete: () => { fim(); gsap.set('.mural-quadro', { clearProps: 'all' }); } });
}

function abrirZoom(i) {
  const total = fotosMural.length;
  const passo = i - fotoAtual;
  fotoAtual = (i + total) % total;
  zoomImg.src = fotosMural[fotoAtual];
  zoomImg.alt = `Foto ${fotoAtual + 1} de ${total}`;
  mural.querySelector('[data-zoom-contador]').textContent = `${String(fotoAtual + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  const abrindo = zoom.hidden;
  zoom.hidden = false;
  if (abrindo) zoom.querySelector('[data-zoom-fechar]').focus();
  if (semAnimacao()) return;
  if (abrindo) gsap.fromTo(zoomImg, { scale: .7, opacity: 0, rotation: -6 }, { scale: 1, opacity: 1, rotation: 0, duration: .6, ease: 'back.out(1.4)' });
  else gsap.fromTo(zoomImg, { x: Math.sign(passo) * 80, opacity: 0 }, { x: 0, opacity: 1, duration: .4, ease: 'power3.out' });
}

function fecharZoom() {
  const fim = () => { zoom.hidden = true; mural.querySelectorAll('.polaroid')[fotoAtual]?.focus(); };
  if (semAnimacao()) return fim();
  gsap.to(zoomImg, { scale: .8, opacity: 0, duration: .25, ease: 'power2.in', onComplete: fim });
}

if (mural) {
  mural.querySelector('[data-mural-fechar]').addEventListener('click', fecharMural);
  mural.querySelector('[data-zoom-fechar]').addEventListener('click', fecharZoom);
  mural.querySelectorAll('[data-zoom-passo]').forEach(b => b.addEventListener('click', () => abrirZoom(fotoAtual + +b.dataset.zoomPasso)));
  mural.addEventListener('cancel', e => { e.preventDefault(); zoom.hidden ? fecharMural() : fecharZoom(); });  // tecla Esc
  mural.addEventListener('click', e => { if (e.target === mural || e.target.classList.contains('mural-quadro')) fecharMural(); });
  zoom.addEventListener('click', e => { if (e.target === zoom) fecharZoom(); });
  mural.addEventListener('keydown', e => {
    if (zoom.hidden) return;
    if (e.key === 'ArrowRight') abrirZoom(fotoAtual + 1);
    if (e.key === 'ArrowLeft') abrirZoom(fotoAtual - 1);
  });
  // deslizar o dedo para trocar de foto no celular
  let inicioX = null;
  zoomImg.addEventListener('pointerdown', e => inicioX = e.clientX);
  zoomImg.addEventListener('pointerup', e => {
    const dx = e.clientX - (inicioX ?? e.clientX); inicioX = null;
    if (Math.abs(dx) > 50) abrirZoom(fotoAtual + (dx < 0 ? 1 : -1));
  });
}
