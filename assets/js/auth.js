import { scramble, wait } from './fx.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initAuth({ scene }) {
  const card = $('#authCard');
  const slider = $('.slider', card);
  const done = $('#done');
  const term = $('#term');
  let mode = card.dataset.mode;

  // har bir pane elementiga ketma-ketlik indeksi (stagger)
  $$('.pane__inner').forEach(p => [...p.children].forEach((c, i) => c.style.setProperty('--i', i)));

  function setMode(next, { push = true } = {}) {
    if (next === mode) return;
    mode = next;
    card.dataset.mode = next;
    slider.classList.remove('is-moving'); void slider.offsetWidth; slider.classList.add('is-moving');
    const title = $(`.pane--${next} .pane__title`, card);
    scramble(title, title.dataset.text || (title.dataset.text = title.textContent), { duration: 1100 });
    if (push && location.hash !== `#${next}`) history.replaceState(null, '', `#${next}`);
    $$('.navlink').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${next}`));
  }

  $$('[data-switch]', card).forEach(b => b.addEventListener('click', () => setMode(b.dataset.switch)));

  /* parolni ko'rsatish */
  $$('.field__eye', card).forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    const inp = b.parentElement.querySelector('input');
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    b.classList.toggle('is-on', show);
    b.setAttribute('aria-label', show ? 'Parolni yashirish' : 'Parolni ko‘rsatish');
  }));

  /* parol kuchi */
  const strength = $('#strength');
  const lbls = ['—', 'Zaif', 'O‘rtacha', 'Yaxshi', 'Juda kuchli'];
  $('#registerForm [name=password]').addEventListener('input', e => {
    const v = e.target.value;
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\d/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v) && v.length >= 10) s++;
    if (!v) s = 0; else s = Math.max(s, 1);
    strength.dataset.score = s;
    $('.strength__lbl', strength).textContent = `Parol kuchi: ${lbls[s]}`;
  });

  /* validatsiya */
  function setErr(input, msg) {
    const f = input.closest('.field');
    if (!f) return;
    f.classList.toggle('is-error', !!msg);
    f.classList.toggle('is-ok', !msg && !!input.value);
    $('.field__err', f).textContent = msg || '';
  }
  function validate(form) {
    let ok = true;
    for (const inp of $$('input', form)) {
      let msg = '';
      const v = inp.value.trim();
      if (inp.name === 'name' && v.length < 2) msg = 'Ismingizni kiriting';
      if (inp.name === 'email' && !EMAIL.test(v)) msg = v ? 'Email noto‘g‘ri ko‘rinadi' : 'Email manzilni kiriting';
      if (inp.name === 'password' && inp.value.length < 8) msg = 'Kamida 8 ta belgi bo‘lsin';
      if (inp.name === 'terms') {
        const c = inp.closest('.check');
        c.classList.toggle('is-error', !inp.checked);
        if (!inp.checked) { ok = false; shake(c); }
        continue;
      }
      if (inp.type === 'checkbox') continue;
      setErr(inp, msg);
      if (msg) { ok = false; shake(inp.closest('.field')); }
    }
    return ok;
  }
  function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  $$('.field input', card).forEach(inp => inp.addEventListener('input', () => {
    if (inp.closest('.field').classList.contains('is-error')) setErr(inp, '');
  }));
  $('[name=terms]', card).addEventListener('change', e => e.target.closest('.check').classList.remove('is-error'));

  /* yuborish */
  let busy = false;
  async function submit(form, kind) {
    if (busy) return;
    if (!validate(form)) return;
    busy = true;
    const btn = $('.submit', form);
    btn.classList.add('is-busy');
    await wait(1100);

    // muvaffaqiyat ekrani tugmadan "portlab" chiqadi
    const r = btn.getBoundingClientRect(), c = card.getBoundingClientRect();
    card.style.setProperty('--cx', `${r.left + r.width / 2 - c.left}px`);
    card.style.setProperty('--cy', `${r.top + r.height / 2 - c.top}px`);
    term.innerHTML = ''; $('#doneTitle').textContent = ''; $('#doneSub').textContent = '';
    done.classList.remove('is-ok');
    card.classList.add('is-done');
    await wait(700);

    const name = (form.elements.namedItem('name')?.value || form.elements.namedItem('email').value.split('@')[0]).trim().split(/\s+/)[0];
    const steps = kind === 'register'
      ? ['Kriptografik kalitlar yaratilmoqda', 'Toshkent-01 tuguniga ulanmoqda', 'Qalqon faollashtirilmoqda']
      : ['Sessiya kaliti tekshirilmoqda', 'Monitor kanali ochilmoqda'];
    for (let i = 0; i < steps.length; i++) {
      const li = document.createElement('li');
      li.innerHTML = `<span>› ${steps[i]}…</span><b class="wait">···</b>`;
      term.append(li);
      if (i === steps.length - 1 && kind === 'register') scene.activateShield();
      await wait(560 + Math.random() * 260);
      const b = $('b', li); b.className = ''; b.textContent = 'OK';
    }
    if (kind !== 'register') scene.activateShield();
    done.classList.add('is-ok');
    await scramble($('#doneTitle'), kind === 'register' ? `Xush kelibsiz, ${name}!` : `Salom, ${name}!`, { duration: 900 });
    $('#doneSub').textContent = kind === 'register'
      ? 'Tarmog‘ingiz endi Qalqon ostida. Globusda qanday himoyalanayotganini kuzating.'
      : 'Barcha tugunlar onlayn. So‘nggi tashrifdan beri 1 284 ta hujum bloklandi.';
    btn.classList.remove('is-busy');
    busy = false;
  }
  $('#registerForm').addEventListener('submit', e => { e.preventDefault(); submit(e.currentTarget, 'register'); });
  $('#loginForm').addEventListener('submit', e => { e.preventDefault(); submit(e.currentTarget, 'login'); });

  return {
    show(next) {
      if (card.classList.contains('is-done')) {
        card.classList.remove('is-done'); done.classList.remove('is-ok');
        $$('form', card).forEach(f => f.reset());
        strength.dataset.score = 0; $('.strength__lbl', strength).textContent = 'Parol kuchi: —';
        $$('.field', card).forEach(f => f.classList.remove('is-ok', 'is-error'));
      }
      if (next !== mode) setMode(next, { push: false });
      else {
        const title = $(`.pane--${next} .pane__title`, card);
        setTimeout(() => scramble(title, title.dataset.text || (title.dataset.text = title.textContent), { duration: 1100 }), 450);
      }
      setTimeout(() => {
        if (matchMedia('(hover: hover)').matches) $(`.pane--${mode} input`, card)?.focus({ preventScroll: true });
      }, 1100);
    },
    hide() { document.activeElement?.blur?.(); },
  };
}
