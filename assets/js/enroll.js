import { scramble, wait } from './fx.js';
import { COURSES, CONFIG } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* +998 (90) 123-45-67 ko'rinishidagi niqob */
function formatPhone(v) {
  let d = v.replace(/\D/g, '');
  if (d.startsWith('998')) d = d.slice(3);
  d = d.slice(0, 9);
  let out = '+998';
  if (d.length) out += ` (${d.slice(0, 2)}`;
  if (d.length >= 2) out += ')';
  if (d.length > 2) out += ` ${d.slice(2, 5)}`;
  if (d.length > 5) out += `-${d.slice(5, 7)}`;
  if (d.length > 7) out += `-${d.slice(7, 9)}`;
  return out;
}

export function initEnroll({ scene }) {
  const card = $('#enroll');
  const form = $('#enrollForm');
  const faces = $$('.face', form);
  const done = $('#done');
  const log = $('#termLog');
  const stepLbls = $$('.enroll__steps span', card);
  let step = 1;

  // spamga qarshi yashirin maydon + xato joyi
  form.insertAdjacentHTML('beforeend', '<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">');
  const formErr = document.createElement('p');
  formErr.className = 'form-err';
  formErr.setAttribute('role', 'alert');
  $('.enroll__actions', form).after(formErr);

  /* ---------- bosqichlar (3D kub) ---------- */
  function go(n) {
    step = n;
    card.dataset.step = n;
    faces.forEach(f => f.classList.toggle('is-on', +f.dataset.step === n));
    stepLbls.forEach((s, i) => s.classList.toggle('is-on', i < n));
    const t = $(`.face[data-step="${n}"] .enroll__title`, form);
    scramble(t, t.dataset.text || (t.dataset.text = t.textContent), { duration: 900 });
    setTimeout(() => {
      const first = $(`.face[data-step="${n}"] input:not([type=hidden]):not([type=radio]), .face[data-step="${n}"] .select__btn`, form);
      if (matchMedia('(hover: hover)').matches) first?.focus({ preventScroll: true });
    }, 650);
  }
  card.dataset.step = 1;

  /* ---------- maydonlar ---------- */
  const phone = form.elements.namedItem('phone');
  phone.addEventListener('focus', () => { if (!phone.value) phone.value = '+998 '; });
  phone.addEventListener('blur', () => { if (phone.value.replace(/\D/g, '').length <= 3) phone.value = ''; });
  phone.addEventListener('input', () => { phone.value = formatPhone(phone.value); });

  function setErr(el, msg) {
    const f = el.closest('.field');
    f.classList.toggle('is-error', !!msg);
    f.classList.toggle('is-ok', !msg);
    $('.field__err', f).textContent = msg || '';
    if (msg) { f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); }
    return !msg;
  }
  $$('.field input', form).forEach(inp => inp.addEventListener('input', () => {
    if (inp.closest('.field').classList.contains('is-error')) setErr(inp, '');
  }));

  function validateStep1() {
    const name = form.elements.namedItem('name');
    const tg = form.elements.namedItem('telegram');
    const digits = phone.value.replace(/\D/g, '');
    let ok = true;
    ok = setErr(name, name.value.trim().length < 2 ? 'Ismingizni kiriting' : '') && ok;
    ok = setErr(phone, digits.length !== 12 ? 'Raqamni to‘liq kiriting: +998 (90) 123-45-67' : '') && ok;
    const t = tg.value.trim();
    ok = setErr(tg, t && !/^@?[A-Za-z0-9_]{5,32}$/.test(t) ? 'Username 5–32 ta lotin harf/raqamdan iborat' : '') && ok;
    if (!t) tg.closest('.field').classList.remove('is-ok');
    return ok;
  }

  $('[data-next]', form).addEventListener('click', () => { if (validateStep1()) go(2); });
  $('[data-prev]', form).addEventListener('click', () => go(1));
  // 1-bosqichda Enter bosilsa — keyingisiga o'tish
  $('.face[data-step="1"]', form).addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); if (validateStep1()) go(2); }
  });

  /* ---------- kurs tanlash (maxsus select) ---------- */
  const sel = $('#courseSelect');
  const btn = $('.select__btn', sel);
  const list = $('.select__list', sel);
  const hidden = form.elements.namedItem('course');
  list.innerHTML = COURSES.map(c => `<li role="option" data-id="${c.id}" aria-selected="false">${c.title}<small>${String(COURSES.indexOf(c) + 1).padStart(2, '0')}</small></li>`).join('');
  const opts = $$('li', list);
  let active = -1;
  const open = v => {
    sel.classList.toggle('is-open', v);
    btn.setAttribute('aria-expanded', v);
    if (v) { active = Math.max(opts.findIndex(o => o.dataset.id === hidden.value), 0); mark(); }
  };
  const mark = () => {
    opts.forEach((o, i) => o.classList.toggle('is-active', i === active));
    opts[active]?.scrollIntoView({ block: 'nearest' });
  };
  function pick(id) {
    const c = COURSES.find(k => k.id === id);
    if (!c) return;
    hidden.value = c.title;
    $('.select__val', sel).textContent = c.title;
    sel.classList.add('has-val');
    opts.forEach(o => o.setAttribute('aria-selected', o.dataset.id === id));
    setErr(btn, '');
  }
  btn.addEventListener('click', () => open(!sel.classList.contains('is-open')));
  list.addEventListener('click', e => { const li = e.target.closest('li'); if (li) { pick(li.dataset.id); open(false); btn.focus(); } });
  btn.addEventListener('keydown', e => {
    const isOpen = sel.classList.contains('is-open');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) return open(true);
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length; mark();
    } else if ((e.key === 'Enter' || e.key === ' ') && isOpen) {
      e.preventDefault(); pick(opts[active].dataset.id); open(false);
    } else if (e.key === 'Escape') open(false);
  });
  document.addEventListener('click', e => { if (!sel.contains(e.target)) open(false); });

  /* ---------- yuborish ---------- */
  let busy = false;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (busy) return;
    if (step === 1) { if (validateStep1()) go(2); return; }
    if (!hidden.value) { setErr(btn, 'Kursni tanlang'); return; }
    formErr.textContent = '';
    busy = true;
    const submit = $('.submit', form);
    submit.classList.add('is-busy');

    const data = Object.fromEntries(new FormData(form));
    data.telegram = data.telegram ? '@' + data.telegram.replace(/^@/, '') : '';
    let ok = false;
    try {
      const [res] = await Promise.all([
        fetch(CONFIG.enrollEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
        wait(900),
      ]);
      ok = res.ok;
    } catch { ok = false; }

    if (!ok) {
      submit.classList.remove('is-busy');
      busy = false;
      formErr.innerHTML = `Ariza yuborilmadi. Iltimos, qayta urinib ko‘ring yoki Telegram orqali yozing: <a href="${CONFIG.telegramUrl}" target="_blank" rel="noopener">${CONFIG.telegram}</a>`;
      return;
    }

    // muvaffaqiyat ekrani tugmadan "portlab" ochiladi
    const r = submit.getBoundingClientRect(), c = card.getBoundingClientRect();
    card.style.setProperty('--cx', `${r.left + r.width / 2 - c.left}px`);
    card.style.setProperty('--cy', `${r.top + r.height / 2 - c.top}px`);
    log.innerHTML = ''; $('#doneTitle').textContent = ''; $('#doneSub').textContent = '';
    done.classList.remove('is-ok');
    card.classList.add('is-done');
    await wait(700);

    const steps = ['Ariza shifrlandi', 'CRYSEC administratoriga yuborildi', 'Laboratoriya kaliti tayyorlanmoqda'];
    for (let i = 0; i < steps.length; i++) {
      const li = document.createElement('li');
      li.innerHTML = `<span>› ${steps[i]}…</span><b class="wait">···</b>`;
      log.append(li);
      if (i === steps.length - 1) scene.activateShield();
      await wait(520 + Math.random() * 240);
      const b = $('b', li); b.className = ''; b.textContent = 'OK';
    }
    done.classList.add('is-ok');
    const first = data.name.trim().split(/\s+/)[0];
    await scramble($('#doneTitle'), `Rahmat, ${first}!`, { duration: 900 });
    $('#doneSub').textContent = `“${data.course}” kursiga arizangiz qabul qilindi. Administrator tez orada ${data.phone} raqamiga bog‘lanadi.`;
    submit.classList.remove('is-busy');
    busy = false;
  });

  $('#doneAgain').addEventListener('click', () => {
    card.classList.remove('is-done'); done.classList.remove('is-ok');
    form.reset();
    sel.classList.remove('has-val'); $('.select__val', sel).textContent = 'Kursni tanlang'; hidden.value = '';
    $$('.field', form).forEach(f => f.classList.remove('is-ok', 'is-error'));
    go(1);
  });

  return {
    pickCourse(id) { pick(id); if (step === 2) return; },
  };
}
