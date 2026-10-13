# CRYSEC — kiberxavfsizlik o'quv markazi sayti

Statik sayt + bitta Vercel serverless funksiya. Build talab qilinmaydi.

```bash
python3 -m http.server 8000   # http://localhost:8000 va http://localhost:8000/login.html
```

## Sahifalar
- `index.html` — scroll orqali 3D hikoya: Hero (jonli hujumlar globusi) → Markaz → 16 kurs → O'quv yo'li → Mentor → Yozilish
- `login.html` — talabalar kabinetiga kirish, "Bit" robot maskoti bilan

## Sozlash
- **Kontaktlar, API manzillari:** `assets/js/data.js` → `CONFIG` (telegram, telefon, manzil, `loginEndpoint`)
- **Kurslar, sertifikatlar:** `assets/js/data.js` → `COURSES`, `CERTS`
- **Mentor rasmi:** `assets/mentor/dovudbek.png` (foni olib tashlangan PNG). Yo'q bo'lsa "DK" monogrammasi chiqadi
- **Sertifikat rasmlari:** `assets/certs/cpts.jpg`, `ejpt.jpg`, `cjca.jpg`

## Arizalar Telegram'ga
`api/enroll.js` arizani Telegram botga yuboradi. Vercel → Settings → Environment Variables:
- `BOT_TOKEN` — @BotFather token
- `CHAT_ID` — arizalar keladigan chat ID (botni guruhga qo'shib, ID ni oling)

Sozlanmaguncha forma "yuborilmadi" xabarini va Telegram havolasini ko'rsatadi.

## Kirish sahifasi
Backend ulanmagan: `CONFIG.loginEndpoint` bo'sh bo'lsa namoyish rejimida ishlaydi (animatsiyalar to'liq, lekin haqiqiy kabinet yo'q).

Teksturalar: NASA Blue Marble / Black Marble (public domain).
