import { ThreatScene } from './scene.js';
import { ATTACK_TYPES, HOME, COURSES, CATEGORIES, CERTS, CONFIG } from './data.js';
import { initEnroll } from './enroll.js';
import { scramble } from './fx.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const body = document.body;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOVER = matchMedia('(hover: hover)').matches;

const CAT_COLOR = { base: '#3de0ff', red: '#ff3d6e', blue: '#5dffc0', research: '#b48cff' };
const LVL = ['', 'Boshlang‘ich', 'O‘rta', 'Ilg‘or'];
const fmt = n => n.toLocaleString('ru-RU').replace(/,/g, ' ');
const pad = n => String(n).padStart(2, '0');
const time = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };

/* =========================================================
   Kontent: kurslar, lenta, sertifikatlar, kontaktlar
   ========================================================= */
const grid = $('#courseGrid');
grid.innerHTML = COURSES.map((c, i) => {
  const cat = CATEGORIES.find(k => k.id === c.cat);
  return `<article class="card course tilt" data-cat="${c.cat}" style="--c:${CAT_COLOR[c.cat]};--d:${i % 4};--ry0:${(i % 4 - 1.5) * 8}deg">
    <div class="course__top">
      <span class="course__ic"><svg><use href="#i-${c.icon}"/></svg></span>
      <span class="course__num">${pad(i + 1)}/${COURSES.length}</span>
    </div>
    <p class="course__tag">${cat.label}</p>
    <h3>${c.title}</h3>
    <p>${c.desc}</p>
    <div class="course__foot">
      <span class="lvl" title="${LVL[c.lvl]}">${[1, 2, 3].map(n => `<i class="${n <= c.lvl ? 'on' : ''}"></i>`).join('')}<b>${LVL[c.lvl]}</b></span>
      <a href="#register" class="course__go" data-course="${c.id}" aria-label="${c.title} kursiga yozilish"><span>Yozilish</span><svg><use href="#i-arrow"/></svg></a>
    </div>
  </article>`;
}).join('');

const filters = $('#filters');
filters.innerHTML = CATEGORIES.map((c, i) => {
  const n = c.id === 'all' ? COURSES.length : COURSES.filter(k => k.cat === c.id).length;
  return `<button type="button" role="tab" data-filter="${c.id}" class="${i ? '' : 'is-on'}" aria-selected="${!i}">${c.label}<sup>${n}</sup></button>`;
}).join('');
filters.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  $$('button', filters).forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-selected', x === b); });
  const f = b.dataset.filter;
  $$('.course', grid).forEach(card => {
    const hit = f === 'all' || card.dataset.cat === f;
    card.classList.toggle('is-dim', !hit);
    if (hit) { card.classList.remove('is-pop'); void card.offsetWidth; card.classList.add('is-pop'); }
  });
});

const bandWords = COURSES.map(c => `<span>${c.title}</span>`).join('');
$('#band1').innerHTML = bandWords + bandWords;
$('#band2').innerHTML = ['Buz', 'O‘rgan', 'Himoyala', 'CTF', 'Red team', 'Blue team', 'Lab', 'CRYSEC'].map(w => `<span>${w}</span>`).join('').repeat(4);

$('#certs').innerHTML = CERTS.map((c, i) => `
  <article class="cert" data-i="${i}" style="--h:${c.hue}" tabindex="0" aria-label="${c.code} — ${c.name}">
    <div class="cert__in">
      <p class="cert__issuer"><span>${c.issuer}</span><span>${pad(i + 1)}/${pad(CERTS.length)}</span></p>
      <svg class="cert__seal" viewBox="0 0 64 64" aria-hidden="true">
        <defs><path id="sealp${i}" d="M32 32m-24 0a24 24 0 1 1 48 0a24 24 0 1 1-48 0"/></defs>
        <g><text><textPath href="#sealp${i}">CERTIFIED · CRYSEC MENTOR · CERTIFIED ·</textPath></text></g>
        <circle cx="32" cy="32" r="17"/><path d="m25 32 5 5 9-10"/>
      </svg>
      <div class="cert__code">${c.code}</div>
      <p class="cert__name">${c.name}</p>
      <p class="cert__desc">${c.desc}</p>
      <div class="cert__img" data-src="${c.img}"><span>sertifikat rasmi shu yerda</span></div>
    </div>
    <div class="cert__holo"></div>
  </article>`).join('') +
  `<div class="certs__nav">${CERTS.map((c, i) => `<button type="button" data-go="${i}" style="--h:${c.hue}">${c.code}</button>`).join('')}</div>`;

// sertifikat rasmlari: fayl bo'lsa ko'rsatiladi, bo'lmasa chiroyli joy qoladi
$$('.cert__img').forEach(box => {
  const img = new Image();
  img.alt = 'Sertifikat';
  img.onload = () => { box.innerHTML = ''; box.append(img); box.classList.add('has-img'); };
  img.src = box.dataset.src;
});

const contactHTML = () => `
  <li><a href="${CONFIG.telegramUrl}" target="_blank" rel="noopener"><svg><use href="#i-tg"/></svg><span>${CONFIG.telegram}<small>Telegram</small></span></a></li>
  <li><a href="tel:${CONFIG.phone.replace(/[^\d+]/g, '')}"><svg><use href="#i-call"/></svg><span>${CONFIG.phone}<small>Qo‘ng‘iroq qiling</small></span></a></li>
  <li><span><svg><use href="#i-pin"/></svg><span>${CONFIG.address}${CONFIG.landmark ? `<small>Mo‘ljal: ${CONFIG.landmark}</small>` : '<small>Manzil</small>'}</span></span></li>`;
$('#contactsFoot').innerHTML = contactHTML();
$('#year').textContent = new Date().getFullYear();

/* so'zma-so'z sarlavhalar */
$$('[data-split]').forEach(h => {
  let i = 0;
  h.innerHTML = h.textContent.trim().split(/\s+/).map(w => `<span class="w"><span style="--i:${i++}">${w}</span></span>`).join(' ');
});

/* =========================================================
   Sahna (globus) va jonli oqim
   ========================================================= */
const feed = $('#feed');
const tag = $('#impactTag');
let perMin = [];
const valueFor = t => {
  const v = t.min + Math.random() * (t.max - t.min);
  return t.unit === 'Gbit/s' ? `${v.toFixed(1)} ${t.unit}` : `${fmt(Math.round(v))} ${t.unit}`;
};
let activeSec = 'top';

function onAttack(arc) {
  perMin.push(performance.now());
  if (activeSec !== 'top') return;
  const li = document.createElement('li');
  li.style.setProperty('--c', arc.blocked ? '#5dffc0' : arc.type.css);
  if (arc.to.name === HOME.name) li.classList.add('is-home');
  li.innerHTML = `<i class="sw"></i><span class="route">${arc.from.name}<b>→</b>${arc.to.name}</span>
    <span class="val">${arc.blocked ? 'BLOKLANDI' : valueFor(arc.type)}</span>
    <span class="meta">${time()} · ${arc.blocked ? 'CRYSEC qalqoni' : arc.type.label}</span>`;
  feed.prepend(li);
  while (feed.children.length > 8) feed.lastElementChild.remove();
}
let tagTimer;
function onImpact(arc) {
  if (activeSec !== 'top' || !arc.screen.visible || innerWidth < 900) return;
  if (tag.classList.contains('is-on') && Math.random() < .6 && !arc.blocked) return;
  tag.style.setProperty('--c', arc.blocked ? '#5dffc0' : arc.type.css);
  tag.innerHTML = `<b>${arc.blocked ? 'BLOKLANDI' : arc.type.label.toUpperCase()}</b> → ${arc.to.name} · ${arc.blocked ? 'qalqon' : valueFor(arc.type)}`;
  tag.style.transform = `translate(${arc.screen.x + 28}px, ${arc.screen.y - 14}px)`;
  tag.classList.add('is-on');
  clearTimeout(tagTimer);
  tagTimer = setTimeout(() => tag.classList.remove('is-on'), 1600);
}
$('#legend').innerHTML = ATTACK_TYPES.map(t => `<li style="--c:${t.css}"><i></i>${t.label}</li>`).join('');

const canvas = $('#scene');
const scene = new ThreatScene(canvas, { onAttack, onImpact });

setInterval(() => {
  $('#clock').textContent = time();
  const now = performance.now();
  perMin = perMin.filter(t => now - t < 10_000);
  $('#rate').textContent = `${fmt(perMin.length * 6 * 137)} hujum/daq`;
}, 1000);

/* har bir bo'lim uchun globus "kadri" */
const PRESETS = {
  desktop: {
    top: { shift: .17, r: .36, rw: .22 },
    about: { shift: -.3, r: .28, rw: .17, aux: .1 },
    courses: { shift: 0, r: .62, rw: .5, vy: -.64, aux: .2 },
    roadmap: { shift: .36, r: .16, rw: .1, vy: .26, aux: .4 },
    mentor: { shift: .2, r: .55, rw: .4, vy: -.82, aux: .55 },
    register: { shift: -.24, r: .32, rw: .2, aux: .85 },
  },
  mobile: {
    top: { r: .3, rw: .43, vy: .2 },
    about: { r: .6, rw: .9, vy: -.62, aux: .1 },
    courses: { r: .6, rw: .9, vy: -.62, aux: .2 },
    roadmap: { shift: .3, r: .2, rw: .2, vy: .34, aux: .4 },
    mentor: { r: .6, rw: .8, vy: -.6, aux: .55 },
    register: { r: .2, rw: .3, vy: .3, aux: .85 },
  },
};
const sections = $$('[data-globe]');
function presetFor(id) { return PRESETS[innerWidth < 900 ? 'mobile' : 'desktop'][id] || PRESETS.desktop.top; }

function onScroll() {
  const h = innerHeight, y = scrollY;
  const max = document.documentElement.scrollHeight - h;
  $('#progress').style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  body.classList.toggle('is-scrolled', y > 30);

  let cur = sections[0];
  for (const s of sections) { if (s.getBoundingClientRect().top <= h * .5) cur = s; }
  const id = cur.id;
  if (id !== activeSec) {
    activeSec = id;
    scene.setPreset(presetFor(cur.dataset.globe === 'hero' ? 'top' : id));
    $$('[data-nav]').forEach(a => a.classList.toggle('is-active', a.dataset.nav === id));
    $$('[data-dot]').forEach(a => a.classList.toggle('is-on', a.dataset.dot === id));
    if (id !== 'top') tag.classList.remove('is-on');
  }
  updateRoad();
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { scene.setPreset(presetFor(activeSec)); layoutRoad(); onScroll(); });

/* =========================================================
   O'quv yo'li — scroll bilan chiziladigan chiziq
   ========================================================= */
const road = $('#road');
const roadSvg = $('.road__line', road);
const stages = $$('.stage', road);
function layoutRoad() {
  const h = road.offsetHeight;
  roadSvg.setAttribute('viewBox', `0 0 4 ${h}`);
  $('#roadPath').setAttribute('d', `M2 0V${h}`);
  const lit = $('#roadPathLit');
  lit.setAttribute('d', `M2 0V${h}`);
  lit.style.strokeDasharray = h;
  road.dataset.h = h;
}
function updateRoad() {
  const r = road.getBoundingClientRect();
  const h = +road.dataset.h || r.height;
  const p = Math.min(Math.max((innerHeight * .62 - r.top) / r.height, 0), 1);
  $('#roadPathLit').style.strokeDashoffset = h * (1 - p);
  stages.forEach(s => {
    const n = $('.stage__node', s).getBoundingClientRect();
    s.classList.toggle('is-lit', n.top + n.height / 2 < innerHeight * .62);
  });
}

/* =========================================================
   Ko'rinishga kirganda 3D animatsiyalar
   ========================================================= */
const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    io.unobserve(e.target);
    if (e.target.id === 'certs') startCerts();
    if (e.target.classList.contains('terminal')) typeTerminal();
    if (e.target.classList.contains('register__grid')) {
      $('#enroll').classList.add('in');
      const t = $('.face.is-on .enroll__title');
      scramble(t, t.dataset.text || (t.dataset.text = t.textContent), { duration: 1100 });
    }
  }
}, { threshold: .15, rootMargin: '0px 0px -8% 0px' });
$$('.z3, [data-split], .course, #certs, .register__grid, .terminal').forEach(el => io.observe(el));
$$('.feat__item').forEach(el => el.classList.add('tilt'));

/* 3D egilish (tilt) */
if (HOVER && !REDUCED) {
  document.addEventListener('pointermove', e => {
    const card = e.target.closest?.('.tilt');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--ry', `${(x - .5) * 14}deg`);
    card.style.setProperty('--rx', `${(.5 - y) * 12}deg`);
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
    card.classList.add('is-moving');
  }, { passive: true });
  document.addEventListener('pointerout', e => {
    const card = e.target.closest?.('.tilt');
    if (!card || card.contains(e.relatedTarget)) return;
    card.classList.remove('is-moving');
    card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
  });
}

/* magnit tugmalar */
if (HOVER) {
  $$('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .28}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* footer — katta yozuv kursorga ergashadi */
const giant = $('.foot__giant');
giant.addEventListener('pointermove', e => {
  const r = giant.getBoundingClientRect();
  giant.style.setProperty('--fx', `${((e.clientX - r.left) / r.width) * 100}%`);
});

/* =========================================================
   Sertifikatlar — 3D to'plam
   ========================================================= */
const certEls = $$('.cert');
let front = 0, certTimer, certHover = false;
const SLOTS = [
  { tx: 0, ty: 0, tz: 0, rot: 0, ry: 0 },
  { tx: 90, ty: -26, tz: -140, rot: 7, ry: -16 },
  { tx: -90, ty: 22, tz: -260, rot: -7, ry: 16 },
];
function placeCerts() {
  const k = innerWidth < 600 ? .55 : 1;
  certEls.forEach((el, i) => {
    const slot = SLOTS[(i - front + certEls.length) % certEls.length];
    el.style.setProperty('--tx', `${slot.tx * k}px`);
    el.style.setProperty('--ty', `${slot.ty}px`);
    el.style.setProperty('--tz', `${slot.tz}px`);
    el.style.setProperty('--rot', `${slot.rot}deg`);
    el.style.setProperty('--ry', `${slot.ry}deg`);
    el.style.setProperty('--rx', '0deg');
    el.style.zIndex = 10 - ((i - front + certEls.length) % certEls.length);
    el.classList.toggle('is-front', i === front);
  });
  $$('.certs__nav button').forEach((b, i) => b.classList.toggle('is-on', i === front));
}
function goCert(i) { front = (i + certEls.length) % certEls.length; placeCerts(); }
function startCerts() {
  placeCerts();
  clearInterval(certTimer);
  if (!REDUCED) certTimer = setInterval(() => { if (!certHover && activeSec === 'mentor') goCert(front + 1); }, 4500);
}
placeCerts();
certEls.forEach((el, i) => {
  el.addEventListener('click', () => { if (i !== front) goCert(i); });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goCert(i === front ? i + 1 : i); } });
  el.addEventListener('pointerenter', () => { certHover = true; });
  el.addEventListener('pointerleave', () => {
    certHover = false;
    if (i === front) { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); }
  });
  el.addEventListener('pointermove', e => {
    if (i !== front || !HOVER) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.transition = 'transform .15s linear, box-shadow .6s, filter .6s, opacity .8s';
    el.style.setProperty('--ry', `${(x - .5) * 22}deg`);
    el.style.setProperty('--rx', `${(.5 - y) * 18}deg`);
    el.style.setProperty('--hx', `${x * 100}%`);
    el.style.setProperty('--hy', `${y * 100}%`);
    clearTimeout(el._t); el._t = setTimeout(() => { el.style.transition = ''; }, 200);
  });
});
$('.certs__nav').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) goCert(+b.dataset.go); });

/* =========================================================
   Terminal
   ========================================================= */
const TERM = [
  ['$ ', 'whoami', 'Dovudbek Khusanov — CRYSEC asoschisi'],
  ['$ ', 'cat certifications.txt', CERTS.map(c => `<span class="p">[✓]</span> ${c.issuer.padEnd(13)} ${c.code}`).join('\n')],
  ['$ ', 'nmap -sV lab.crysec.local', '<span class="c">22/tcp</span>  open  ssh     OpenSSH 8.9\n<span class="c">80/tcp</span>  open  http    nginx 1.24\n<span class="c">445/tcp</span> open  smb     Samba 4.15'],
  ['$ ', './yangi_guruh --status', '<span class="o">[+]</span> Yozilish ochiq. Joylar cheklangan.'],
];
let typed = false;
async function typeTerminal() {
  if (typed) return; typed = true;
  const pre = $('#term');
  let html = '';
  for (const [p, cmd, out] of TERM) {
    for (let i = 0; i <= cmd.length; i++) {
      pre.innerHTML = `${html}<span class="p">${p}</span>${cmd.slice(0, i)}<span class="cursor"></span>`;
      await new Promise(r => setTimeout(r, REDUCED ? 0 : 28 + Math.random() * 40));
    }
    html += `<span class="p">${p}</span>${cmd}\n${out}\n`;
    pre.innerHTML = html + '<span class="cursor"></span>';
    await new Promise(r => setTimeout(r, REDUCED ? 0 : 420));
  }
  pre.innerHTML = `${html}<span class="p">$ </span><span class="cursor"></span>`;
}

/* =========================================================
   Yozilish formasi
   ========================================================= */
const enroll = initEnroll({ scene });
$$('[data-course]').forEach(a => a.addEventListener('click', () => enroll.pickCourse(a.dataset.course)));

/* =========================================================
   Yuklanish
   ========================================================= */
let started = false;
function ready() {
  if (started) return; started = true;
  body.classList.remove('is-loading');
  requestAnimationFrame(() => body.classList.add('is-ready'));
  for (let i = 0; i < 8; i++) setTimeout(() => scene.launch(), i * 120);
  // sanoqlar
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count, t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / 1400, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    setTimeout(() => requestAnimationFrame(step), 700);
  });
}
canvas.addEventListener('ready', ready, { once: true });
setTimeout(ready, 6000);
scene.setPreset(presetFor('top'));
layoutRoad();
onScroll();
scene.start();
