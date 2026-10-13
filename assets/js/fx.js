// Matnni "shifrdan ochish" effekti
const CHARS = '!<>-_\\/[]{}—=+*^?#01ABCDEF';

export function scramble(el, text, { duration = 900 } = {}) {
  if (!el) return Promise.resolve();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; return Promise.resolve(); }
  cancelAnimationFrame(el.__scr);
  const from = el.textContent;
  const len = Math.max(from.length, text.length);
  const q = [];
  for (let i = 0; i < len; i++) {
    const start = Math.random() * duration * .4;
    const end = start + duration * .3 + Math.random() * duration * .3;
    q.push({ from: from[i] || '', to: text[i] || '', start, end });
  }
  const t0 = performance.now();
  return new Promise(resolve => {
    const step = now => {
      const t = now - t0;
      let out = '', done = 0;
      for (const c of q) {
        if (t >= c.end) { done++; out += c.to; }
        else if (t >= c.start) out += `<span style="color:var(--cyan);opacity:.7">${CHARS[(Math.random() * CHARS.length) | 0]}</span>`;
        else out += c.from;
      }
      el.innerHTML = out;
      if (done === q.length) { el.textContent = text; resolve(); }
      else el.__scr = requestAnimationFrame(step);
    };
    el.__scr = requestAnimationFrame(step);
  });
}

export const wait = ms => new Promise(r => setTimeout(r, ms));
