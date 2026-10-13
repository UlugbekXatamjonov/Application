// Vercel serverless funksiyasi: saytdagi arizani Telegram botga yuboradi.
// Vercel → Project → Settings → Environment Variables:
//   BOT_TOKEN — @BotFather bergan token
//   CHAT_ID   — arizalar keladigan chat/guruh/kanal ID si (masalan -1001234567890)

const MAX = 120;
const clean = v => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, MAX);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ ok: false, error: 'bad_json' }); }
  }

  // bot-tuzoq: odam ko'rmaydigan maydon to'ldirilgan bo'lsa — jim qabul qilamiz
  if (body.website) return res.status(200).json({ ok: true });

  const d = {
    name: clean(body.name),
    phone: clean(body.phone),
    telegram: clean(body.telegram),
    course: clean(body.course),
    level: clean(body.level),
    time: clean(body.time),
  };
  if (d.name.length < 2 || d.phone.replace(/\D/g, '').length !== 12 || !d.course) {
    return res.status(422).json({ ok: false, error: 'invalid' });
  }

  const { BOT_TOKEN, CHAT_ID } = process.env;
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('BOT_TOKEN yoki CHAT_ID sozlanmagan');
    return res.status(500).json({ ok: false, error: 'not_configured' });
  }

  const text = [
    '🆕 Yangi ariza — CRYSEC',
    '',
    `👤 ${d.name}`,
    `📞 ${d.phone}`,
    d.telegram ? `✈️ ${d.telegram}` : null,
    `📚 ${d.course}`,
    `📈 Daraja: ${d.level || '—'}`,
    `🕒 Vaqt: ${d.time || '—'}`,
  ].filter(Boolean).join('\n');

  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, disable_web_page_preview: true }),
    });
    if (!r.ok) throw new Error(`telegram ${r.status}`);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, error: 'telegram_failed' });
  }
};
