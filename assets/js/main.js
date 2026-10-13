import { ThreatScene } from './scene.js';
import { ATTACK_TYPES, TICKER, HOME } from './data.js';
import { initAuth } from './auth.js';
import { scramble } from './fx.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const body = document.body;

/* ---------- monitor ma'lumotlari ---------- */
const feed = $('#feed');
const tag = $('#impactTag');
const counts = new Map();
let today = 1_284_000 + Math.floor(Math.random() * 40_000);
let perMin = [];

const fmt = n => n.toLocaleString('ru-RU').replace(/,/g, ' ');
const pad = n => String(n).padStart(2, '0');
const time = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
const valueFor = type => {
  const v = type.min + Math.random() * (type.max - type.min);
  return type.unit === 'Gbit/s' ? `${v.toFixed(1)} ${type.unit}` : `${fmt(Math.round(v))} ${type.unit}`;
};
const randIp = () => `${(Math.random() * 223 + 1) | 0}.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}`;

function onAttack(arc) {
  today += 7 + ((Math.random() * 30) | 0);
  perMin.push(performance.now());
  const key = arc.to.name;
  counts.set(key, (counts.get(key) || 0) + 1);

  const li = document.createElement('li');
  const color = arc.blocked ? '#5dffc0' : arc.type.css;
  li.style.setProperty('--c', color);
  if (arc.to.name === HOME.name) li.classList.add('is-home');
  li.innerHTML = `<i class="sw"></i><span class="route">${arc.from.name}<b>→</b>${arc.to.name}</span>
    <span class="val">${arc.blocked ? 'BLOKLANDI' : valueFor(arc.type)}</span>
    <span class="meta">${time()} · ${arc.blocked ? 'Qalqon' : arc.type.label} · ${randIp()}</span>`;
  feed.prepend(li);
  while (feed.children.length > 9) feed.lastElementChild.remove();
}

let tagTimer;
function onImpact(arc) {
  if (body.classList.contains('mode-auth')) return;
  if (!arc.screen.visible || innerWidth < 900) return;
  // juda tez-tez almashmasin
  if (tag.classList.contains('is-on') && Math.random() < .6 && !arc.blocked) return;
  const color = arc.blocked ? '#5dffc0' : arc.type.css;
  tag.style.setProperty('--c', color);
  tag.innerHTML = `<b>${arc.blocked ? 'BLOKLANDI' : arc.type.label.toUpperCase()}</b> → ${arc.to.name} · ${arc.blocked ? 'qalqon' : valueFor(arc.type)}`;
  tag.style.transform = `translate(${arc.screen.x + 28}px, ${arc.screen.y - 14}px)`;
  tag.classList.add('is-on');
  clearTimeout(tagTimer);
  tagTimer = setTimeout(() => tag.classList.remove('is-on'), 1600);
}

function renderBars() {
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = top[0]?.[1] || 1;
  $('#bars').innerHTML = top.map(([n, v]) =>
    `<li><span class="n">${n}</span><span class="b"><i style="width:${(v / max * 100).toFixed(0)}%"></i></span><span class="v">${v}</span></li>`).join('');
}
$('#legend').innerHTML = ATTACK_TYPES.map(t => `<li style="--c:${t.css}"><i></i>${t.label}</li>`).join('');
$('#ticker').innerHTML = [...TICKER, ...TICKER].map(s => `<span>${s}</span>`).join('');

/* ---------- sahna ---------- */
const canvas = $('#scene');
const scene = new ThreatScene(canvas, { onAttack, onImpact });
window.__scene = scene;

/* sanoq va soat */
const elToday = $('#statToday'), elRate = $('#rate'), elClock = $('#clock'), elBlocked = $('#statBlocked'), elNodes = $('#statNodes');
let shown = today - 2400;
function tickStats() {
  shown += (today - shown) * .08;
  elToday.textContent = fmt(Math.round(shown));
  requestAnimationFrame(tickStats);
}
setInterval(() => {
  elClock.textContent = time();
  const now = performance.now();
  perMin = perMin.filter(t => now - t < 10_000);
  elRate.textContent = `${fmt(perMin.length * 6 * 137)} hujum/daq`;
  elBlocked.textContent = (99 + Math.random() * .8).toFixed(1);
  elNodes.textContent = 126 + ((Math.random() * 4) | 0);
  renderBars();
}, 1000);

/* ---------- marshrutlash: #register | #login | bosh ---------- */
const auth = initAuth({ scene });

function route() {
  const h = location.hash.replace('#', '');
  const isAuth = h === 'register' || h === 'login';
  body.classList.toggle('mode-auth', isAuth);
  body.classList.toggle('mode-home', !isAuth);
  scene.setMode(isAuth ? 'auth' : 'home');
  $$('.navlink').forEach(a => a.classList.toggle('is-active', isAuth ? a.getAttribute('href') === `#${h}` : a.dataset.route === 'home'));
  if (isAuth) auth.show(h);
  else auth.hide();
  if (!isAuth) window.scrollTo({ top: 0, behavior: 'smooth' });
}
addEventListener('hashchange', route);
$$('[data-route="home"]').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  history.pushState('', document.title, location.pathname + location.search);
  route();
}));

/* ---------- magnit tugmalar ---------- */
if (matchMedia('(hover: hover)').matches) {
  $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * .18}px, ${y * .28}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ---------- yuklanish ---------- */
scramble($('.loader__txt'), 'SUN\'IY YO\'LDOSHLAR ULANMOQDA');
let started = false;
function ready() {
  if (started) return; started = true;
  body.classList.remove('is-loading');
  route();
  requestAnimationFrame(() => body.classList.add('is-ready'));
  // boshlang'ich hujumlar to'lqini
  for (let i = 0; i < 8; i++) setTimeout(() => scene.launch(), i * 120);
}
canvas.addEventListener('ready', ready, { once: true });
setTimeout(ready, 6000); // tekstura sekin bo'lsa ham kutib qolmaslik
scene.setMode(/register|login/.test(location.hash) ? 'auth' : 'home');
scene.start();
tickStats();
