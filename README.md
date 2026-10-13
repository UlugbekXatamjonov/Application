# QALQON — kiber tahdidlar monitori

Statik sayt (build kerak emas). Vercel'ga to'g'ridan-to'g'ri deploy qilinadi.

Lokal ishga tushirish (ES modullar uchun server kerak):

```bash
python3 -m http.server 8000   # keyin http://localhost:8000 , http://localhost:8000/#register
```

- `assets/js/scene.js` — Three.js sahna: topografik fon shaderi, NASA xaritasi asosidagi ko'k globus, hujum yoylari, qalqon effekti
- `assets/js/auth.js` — kirish / ro'yxatdan o'tish animatsiyalari va validatsiya (backend ulanmagan, faqat front)
- `assets/js/data.js` — shaharlar, hujum turlari (simulyatsiya)
- Teksturalar: NASA Blue Marble / Black Marble (public domain), three-globe paketidan
