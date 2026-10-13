// Kirish sahifasi: fon sahnasi + "Bit" maskotining xatti-harakati
import { ThreatScene } from './scene.js';
import { CONFIG } from './data.js';
import { scramble, wait } from './fx.js';

const $ = s => document.querySelector(s);
const body = document.body;
const mascot = $('#mascot');
const bot = $('#bot');
const bubble = $('#bubble');
const bubbleTxt = $('#bubbleTxt');
const email = $('#email');
const pass = $('#password');
const peekBtn = $('#peek');
const form = $('#loginForm');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- fon ---------- */
const canvas = $('#scene');
const scene = new ThreatScene(canvas, {});
const preset = () => innerWidth < 900
  ? { r: .5, rw: .95, vy: -.66, aux: .6 }
  : { r: .78, rw: .62, vy: -1.02, aux: .6 };
scene.setPreset(preset());
addEventListener('resize', () => scene.setPreset(preset()));
scene.start();
let started = false;
const ready = () => {
  if (started) return; started = true;
  body.classList.remove('is-loading');
  setTimeout(() => { setMood('wave', 'Salom! Men Bit — CRYSEC qo‘riqchisiman 🤖', 2200); }, 900);
};
canvas.addEventListener('ready', ready, { once: true });
setTimeout(ready, 5000);

/* ---------- og'iz shakllari ---------- */
const MOUTH = {
  smile: 'M136 156q14 10 28 0',
  grin: 'M132 152q18 22 36 0z',
  o: 'M142 160a8 9 0 1 0 16 0a8 9 0 1 0 -16 0',
  flat: 'M138 160h24',
  sad: 'M136 164q14 -12 28 0',
  smirk: 'M136 160q14 4 28 -8',
  wavy: 'M130 160q4 -6 8 0t8 0t8 0t8 0t8 0',
  sleep: 'M142 160q8 4 16 0',
};
const MOOD_MOUTH = { idle: 'smile', look: 'smile', wave: 'grin', shy: 'wavy', peek: 'o', error: 'sad', shock: 'o',
  smirk: 'smirk', happy: 'grin', tickle: 'grin', shrug: 'flat', think: 'flat', sleep: 'sleep', wake: 'o' };
const mouth = $('#mouth');
function setMouth(k) {
  const d = MOUTH[k];
  mouth.style.d = `path("${d}")`;
  mouth.setAttribute('d', d);
  mouth.style.fill = k === 'grin' ? 'rgba(61,224,255,.25)' : 'none';
}

/* ---------- kayfiyat boshqaruvi ---------- */
let mood = 'idle', baseMood = 'idle', moodTimer, tempUntil = 0;
function say(text) {
  if (!text || bubbleTxt.textContent === text) return;
  bubbleTxt.textContent = text;
  bubble.classList.remove('is-pop'); void bubble.offsetWidth; bubble.classList.add('is-pop');
}
function apply(m) {
  mood = m;
  mascot.dataset.mood = m;
  setMouth(MOOD_MOUTH[m] || 'smile');
}
// vaqtinchalik kayfiyat (ms dan keyin asosiyga qaytadi)
function setMood(m, text, ms) {
  clearTimeout(moodTimer);
  apply(m);
  say(text);
  tempUntil = ms ? Date.now() + ms : 0;
  if (ms) moodTimer = setTimeout(() => apply(baseMood), ms);
}
function setBase(m, text) {
  baseMood = m;
  clearTimeout(moodTimer);
  apply(m);
  if (text) say(text);
}

/* ---------- ko'z bilan kuzatish ---------- */
const look = (x, y) => {
  // x,y: -1..1
  bot.style.setProperty('--px', `${(x * 7).toFixed(2)}px`);
  bot.style.setProperty('--py', `${(y * 6).toFixed(2)}px`);
  bot.style.setProperty('--fx', `${(x * 6).toFixed(2)}px`);
  bot.style.setProperty('--fy', `${(y * 4).toFixed(2)}px`);
  bot.style.setProperty('--tilt', `${(x * 6).toFixed(2)}deg`);
};
addEventListener('pointermove', e => {
  wakeUp();
  if (document.activeElement === email || ['shy', 'peek', 'think', 'sleep'].includes(mood)) return;
  const r = bot.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height * .36;
  const dx = e.clientX - cx, dy = e.clientY - cy;
  const d = Math.max(Math.hypot(dx, dy), 1);
  const k = Math.min(d / 300, 1);
  look(dx / d * k, dy / d * k);
}, { passive: true });

// email yozilayotganda — matn bo'ylab ko'z yuguradi
function followCaret() {
  const len = email.value.length;
  look(Math.min(len / 28, 1) * 1.6 - .8, .75);
}

/* ---------- miltillash ---------- */
(function blink() {
  setTimeout(() => {
    if (!['sleep', 'happy', 'tickle', 'shy'].includes(mood)) {
      bot.classList.add('is-blink');
      setTimeout(() => bot.classList.remove('is-blink'), 130);
    }
    blink();
  }, 2200 + Math.random() * 3000);
})();

/* ---------- uxlab qolish ---------- */
let idleT;
function resetIdle() {
  clearTimeout(idleT);
  idleT = setTimeout(() => {
    if (document.activeElement === pass) return;
    setBase('sleep', 'Zzz… kimdir parol kiritarmikan… 😴');
  }, 14000);
}
function wakeUp() {
  if (mood === 'sleep') {
    baseMood = 'idle';
    setMood('wake', 'A?! Uxlamayotgan edim! Shunchaki… loglarni ko‘rayotgandim 😳', 2200);
  }
  resetIdle();
}
['keydown', 'pointerdown', 'focusin'].forEach(ev => addEventListener(ev, wakeUp));
resetIdle();

/* ---------- forma hodisalari ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SQLI = /('|--|;|\bor\b\s*1\s*=\s*1|<script|union\s+select|drop\s+table)/i;
const SQLI_STRONG = /(\bor\b\s*'?1'?\s*=\s*'?1|<script|union\s+select|drop\s+table)/i;
const WEAK = ['123456', '12345678', '123456789', 'password', 'qwerty', '111111', 'admin', 'parol', '000000', 'abc123', 'qwerty123', 'iloveyou'];

email.addEventListener('focus', () => { setBase('look', 'Hmm, kim ekansiz? Yozing-chi… 👀'); followCaret(); });
email.addEventListener('input', () => {
  followCaret();
  const v = email.value;
  if (SQLI.test(v)) setMood('smirk', 'Ooo, SQL injection?! 😏 Yaxshi urinish. Buni kursda o‘rgatamiz.', 0);
  else if (EMAIL_RE.test(v)) say('Aha, tanish email! 😊');
  else if (v.length > 3 && v.includes('@')) say('Davom eting, davom eting…');
  else if (v.length === 0) say('Hmm, kim ekansiz? Yozing-chi… 👀');
  if (!SQLI.test(v) && mood === 'smirk') apply('look');
});
email.addEventListener('blur', () => { if (document.activeElement !== pass && Date.now() >= tempUntil) setBase('idle'); look(0, 0); });

pass.addEventListener('focus', () => {
  look(0, 0);
  setBase(pass.type === 'text' ? 'peek' : 'shy', pass.type === 'text' ? 'Ko‘rinib turibdi-ku! Men… hech narsa ko‘rmadim 🙈' : 'Ko‘zimni yumdim! Hech narsa ko‘rmayapman 🙈');
});
pass.addEventListener('input', () => {
  const v = pass.value;
  if (WEAK.includes(v.toLowerCase())) say('Ha-ha… shu parolmi? 🤭');
  else if (v.length >= 12) say('Uzun parol — hurmat! 💪');
});
pass.addEventListener('blur', () => setTimeout(() => {
  if (document.activeElement === email || document.activeElement === pass || busy) return;
  if (Date.now() < tempUntil) { baseMood = 'idle'; return; }
  setBase('idle', 'Tayyor bo‘lsangiz — “Kirish”ni bosing ✨');
}, 50));

peekBtn.addEventListener('click', () => {
  const show = pass.type === 'password';
  pass.type = show ? 'text' : 'password';
  peekBtn.classList.toggle('is-on', show);
  peekBtn.setAttribute('aria-label', show ? 'Parolni yashirish' : 'Parolni ko‘rsatish');
  setBase(show ? 'peek' : 'shy', show ? 'Barmoqlar orasidan… faqat bir oz… 🫣' : 'Bo‘ldi, yana ko‘zimni yumdim 🙈');
  pass.focus();
});

$('#forgot').addEventListener('click', e => {
  e.preventDefault();
  setMood('shrug', `Men ham doim unutaman 🤷 Administratorga yozing: ${CONFIG.telegram}`, 3200);
});

/* qitiqlash */
let tickles = 0;
const TICKLE = ['Hi-hi! Qitiqlamang! 😆', 'Voy-voy, bas! 🤣', 'Men xavfsizlik robotiman, o‘yinchoq emas! 😤', 'Mayli, yana bir marta… 😅', 'Easter egg topdingiz! 🥚 Siz haqiqiy xakersiz.'];
bot.addEventListener('click', () => {
  setMood('tickle', TICKLE[Math.min(tickles++, TICKLE.length - 1)], 1300);
  burst(6);
});

/* 0/1 konfetti */
function burst(n = 26) {
  if (REDUCED) return;
  const box = $('#bits');
  const colors = ['#3de0ff', '#5dffc0', '#b48cff', '#ffb547'];
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span');
    s.textContent = Math.random() < .5 ? '0' : '1';
    const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 180;
    s.style.setProperty('--x', `${Math.cos(a) * d}px`);
    s.style.setProperty('--y', `${Math.sin(a) * d - 60}px`);
    s.style.setProperty('--r', `${(Math.random() - .5) * 720}deg`);
    s.style.setProperty('--c', colors[i % colors.length]);
    s.style.animationDelay = `${Math.random() * 120}ms`;
    box.append(s);
    setTimeout(() => s.remove(), 1900);
  }
}

/* ---------- yuborish ---------- */
function setErr(el, msg) {
  const f = el.closest('.field');
  f.classList.toggle('is-error', !!msg);
  f.querySelector('.field__err').textContent = msg || '';
  if (msg) { f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); }
}
[email, pass].forEach(i => i.addEventListener('input', () => setErr(i, '')));

let busy = false;
form.addEventListener('submit', async e => {
  e.preventDefault();
  if (busy) return;
  const ev = email.value.trim(), pv = pass.value;
  document.activeElement?.blur();

  if (SQLI.test(ev) || SQLI_STRONG.test(pv)) {
    setErr(email, 'Injection aniqlandi 🛡️');
    setMood('smirk', 'Ha-ha! Meni SQL injection bilan aldab bo‘lmaydi 😎 Lekin qiziqishingiz yoqdi — kursga keling!', 4200);
    return;
  }
  if (!ev) { setErr(email, 'Email yoki loginni kiriting'); setMood('error', 'Bo‘sh joy bilan kirib bo‘lmaydi-ku 🙃', 2600); return; }
  if (ev.includes('@') && !EMAIL_RE.test(ev)) { setErr(email, 'Email noto‘g‘ri ko‘rinadi'); setMood('error', 'Bu email emas-ku 🤨 Yana bir qarang.', 2600); return; }
  if (!pv) { setErr(pass, 'Parolni kiriting'); setMood('error', 'Parolsiz? Men shunchalik soddamanmi? 😅', 2600); return; }
  if (WEAK.includes(pv.toLowerCase())) {
    setErr(pass, 'Juda kuchsiz parol');
    setMood('shock', `“${pv}”?! 😱 Bunday parolni men 0.2 soniyada buzaman! Kuchliroq parol o‘ylang.`, 4200);
    return;
  }
  if (pv.length < 8) { setErr(pass, 'Kamida 8 ta belgi'); setMood('error', 'Qisqa parol — xakerlar uchun sovg‘a 🎁', 2800); return; }

  busy = true;
  const btn = form.querySelector('.submit');
  btn.classList.add('is-busy');
  setBase('think', 'Tekshirilmoqda… shifr, xesh, tuz… 🧂');

  let ok = false, demo = !CONFIG.loginEndpoint;
  try {
    if (demo) { await wait(1600); ok = true; }
    else {
      const [r] = await Promise.all([
        fetch(CONFIG.loginEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: ev, password: pv }), credentials: 'include' }),
        wait(1200),
      ]);
      ok = r.ok;
    }
  } catch { ok = false; }
  btn.classList.remove('is-busy');
  busy = false;

  if (!ok) {
    setBase('idle');
    setErr(pass, 'Login yoki parol noto‘g‘ri');
    setMood('error', 'Kirish rad etildi! ⛔ Login yoki parolni tekshiring.', 3200);
    return;
  }
  setBase('happy');
  say(demo ? 'Parol a’lo! 🎉 Talabalar kabineti tez orada ochiladi.' : 'Xush kelibsiz! 🎉 Eshiklar ochildi!');
  burst(34);
  setTimeout(() => burst(20), 500);
  scene.activateShield();
  scramble($('#loginTitle'), 'Xush kelibsiz!', { duration: 900 });
  if (!demo && CONFIG.loginRedirect) setTimeout(() => { location.href = CONFIG.loginRedirect; }, 2600);
  else setTimeout(() => setBase('idle'), 4200);
});

/* magnit tugma */
if (matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .28}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}
setMouth('smile');
