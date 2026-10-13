// Shaharlar va hujum turlari (namoyish uchun simulyatsiya qilingan ma'lumot)
export const HOME = { name: 'Toshkent' };

export const CITIES = [
  { name: 'Toshkent', cc: 'UZ', lat: 41.31, lon: 69.24 },
  { name: 'Samarqand', cc: 'UZ', lat: 39.65, lon: 66.96 },
  { name: 'Moskva', cc: 'RU', lat: 55.75, lon: 37.62 },
  { name: 'Sankt-Peterburg', cc: 'RU', lat: 59.93, lon: 30.36 },
  { name: 'Novosibirsk', cc: 'RU', lat: 55.03, lon: 82.92 },
  { name: 'Pekin', cc: 'CN', lat: 39.9, lon: 116.4 },
  { name: 'Shanxay', cc: 'CN', lat: 31.23, lon: 121.47 },
  { name: 'Shenchjen', cc: 'CN', lat: 22.54, lon: 114.06 },
  { name: 'Pxenyan', cc: 'KP', lat: 39.04, lon: 125.76 },
  { name: 'Seul', cc: 'KR', lat: 37.57, lon: 126.98 },
  { name: 'Tokio', cc: 'JP', lat: 35.68, lon: 139.69 },
  { name: 'Tehron', cc: 'IR', lat: 35.69, lon: 51.39 },
  { name: 'Istanbul', cc: 'TR', lat: 41.01, lon: 28.98 },
  { name: 'Dubay', cc: 'AE', lat: 25.2, lon: 55.27 },
  { name: 'Mumbay', cc: 'IN', lat: 19.08, lon: 72.88 },
  { name: 'Bangalor', cc: 'IN', lat: 12.97, lon: 77.59 },
  { name: 'Singapur', cc: 'SG', lat: 1.35, lon: 103.82 },
  { name: 'Jakarta', cc: 'ID', lat: -6.2, lon: 106.85 },
  { name: 'Sidney', cc: 'AU', lat: -33.87, lon: 151.21 },
  { name: 'Frankfurt', cc: 'DE', lat: 50.11, lon: 8.68 },
  { name: 'Berlin', cc: 'DE', lat: 52.52, lon: 13.4 },
  { name: 'Amsterdam', cc: 'NL', lat: 52.37, lon: 4.9 },
  { name: 'London', cc: 'GB', lat: 51.51, lon: -0.13 },
  { name: 'Parij', cc: 'FR', lat: 48.86, lon: 2.35 },
  { name: 'Madrid', cc: 'ES', lat: 40.42, lon: -3.7 },
  { name: 'Stokgolm', cc: 'SE', lat: 59.33, lon: 18.07 },
  { name: 'Varshava', cc: 'PL', lat: 52.23, lon: 21.01 },
  { name: 'Kiyev', cc: 'UA', lat: 50.45, lon: 30.52 },
  { name: 'Qohira', cc: 'EG', lat: 30.04, lon: 31.24 },
  { name: 'Lagos', cc: 'NG', lat: 6.52, lon: 3.38 },
  { name: 'Yoxannesburg', cc: 'ZA', lat: -26.2, lon: 28.05 },
  { name: 'Nayrobi', cc: 'KE', lat: -1.29, lon: 36.82 },
  { name: 'Nyu-York', cc: 'US', lat: 40.71, lon: -74.01 },
  { name: 'Vashington', cc: 'US', lat: 38.9, lon: -77.04 },
  { name: 'Chikago', cc: 'US', lat: 41.88, lon: -87.63 },
  { name: 'San-Fransisko', cc: 'US', lat: 37.77, lon: -122.42 },
  { name: 'Los-Anjeles', cc: 'US', lat: 34.05, lon: -118.24 },
  { name: 'Toronto', cc: 'CA', lat: 43.65, lon: -79.38 },
  { name: 'Mexiko', cc: 'MX', lat: 19.43, lon: -99.13 },
  { name: 'San-Paulu', cc: 'BR', lat: -23.55, lon: -46.63 },
  { name: 'Buenos-Ayres', cc: 'AR', lat: -34.6, lon: -58.38 },
  { name: 'Bogota', cc: 'CO', lat: 4.71, lon: -74.07 },
  { name: 'Almati', cc: 'KZ', lat: 43.24, lon: 76.89 },
  { name: 'Bishkek', cc: 'KG', lat: 42.87, lon: 74.59 },
];

export const ATTACK_TYPES = [
  { id: 'ddos', label: 'DDoS', color: 0xff3d6e, css: '#ff3d6e', unit: 'Gbit/s', min: 0.4, max: 9.8 },
  { id: 'malware', label: 'Zararli dastur', color: 0xffb547, css: '#ffb547', unit: 'fayl', min: 1, max: 40 },
  { id: 'phishing', label: 'Fishing', color: 0xb48cff, css: '#b48cff', unit: 'xat', min: 20, max: 900 },
  { id: 'scan', label: 'Port skaner', color: 0x3de0ff, css: '#3de0ff', unit: 'port', min: 100, max: 65535 },
  { id: 'brute', label: 'Brute-force', color: 0xff7ad9, css: '#ff7ad9', unit: 'urinish', min: 50, max: 9000 },
];

export const TICKER = [
  'CVE-2026-31337 · OpenSSH 10.x da masofaviy kod bajarish — yamoq chiqarildi',
  'Botnet “Kumush Tuman” 42 000 IoT qurilmani egalladi',
  'Markaziy Osiyo bank sektoriga fishing to‘lqini: +312% haftalik',
  'Ransomware guruhi LockSpire infratuzilmasi bloklandi',
  'DNS amplification hujumlari 1.8 Tbit/s cho‘qqisiga yetdi',
  'CRYSEC CTF: yangi haftalik topshiriqlar e’lon qilindi',
];

/* =========================================================
   CRYSEC — markaz ma'lumotlari. Kontaktlarni shu yerda o'zgartiring.
   ========================================================= */
export const CONFIG = {
  brand: 'CRYSEC',
  telegram: '@crysec_uz',            // TODO: haqiqiy Telegram kanal/admin
  telegramUrl: 'https://t.me/crysec_uz',
  phone: '+998 (__) ___-__-__',      // TODO: telefon raqam
  address: 'Manzil kiritilmagan',    // TODO: markaz manzili
  landmark: '',                      // TODO: mo'ljal
  enrollEndpoint: '/api/enroll',   // Vercel funksiyasi -> Telegram bot (api/enroll.js)
  // Talabalar kabineti API si. Bo'sh bo'lsa — login sahifasi namoyish rejimida ishlaydi.
  loginEndpoint: '',
  loginRedirect: '',               // muvaffaqiyatli kirishdan keyin o'tiladigan sahifa
};

export const CATEGORIES = [
  { id: 'all', label: 'Barchasi' },
  { id: 'base', label: 'Poydevor' },
  { id: 'red', label: 'Hujum · Red team' },
  { id: 'blue', label: 'Himoya · Blue team' },
  { id: 'research', label: 'Tadqiqot' },
];

export const COURSES = [
  { id: 'cyber', cat: 'base', title: 'Kiberxavfsizlik', desc: 'Tahdidlar, zaifliklar, himoya qatlamlari — butun sohaning xaritasi.', lvl: 1, icon: 'shield' },
  { id: 'linux', cat: 'base', title: 'Linux administratorligi', desc: 'Terminal, foydalanuvchilar, xizmatlar va server xavfsizligi.', lvl: 1, icon: 'term' },
  { id: 'crypto', cat: 'base', title: 'Kriptografiya', desc: 'Shifrlash, xesh, PKI va ularni buzish usullari amalda.', lvl: 2, icon: 'key' },
  { id: 'ethical', cat: 'red', title: 'Axloqiy xakerlik', desc: 'Hujumchi kabi fikrlash: razvedkadan eksploitgacha.', lvl: 1, icon: 'mask' },
  { id: 'pentest', cat: 'red', title: 'Pentesting', desc: 'Web-ilovalarni to‘liq sinovdan o‘tkazish va hisobot yozish.', lvl: 2, icon: 'target' },
  { id: 'netpentest', cat: 'red', title: 'Network pentesting', desc: 'Active Directory, ichki tarmoq, pivoting va lateral harakat.', lvl: 3, icon: 'net' },
  { id: 'bug', cat: 'red', title: 'Bug hunting', desc: 'Bug bounty platformalarida real zaifliklarni topib, mukofot olish.', lvl: 2, icon: 'bug' },
  { id: 'mobile', cat: 'red', title: 'Mobile app security', desc: 'Android/iOS ilovalarni tahlil qilish va buzish.', lvl: 3, icon: 'phone' },
  { id: 'ctf', cat: 'red', title: 'CTF laboratoriyalar', desc: 'Haftalik musobaqalar: web, pwn, crypto, forensics topshiriqlari.', lvl: 1, icon: 'flag' },
  { id: 'soc', cat: 'blue', title: 'SOC Analyst', desc: 'SIEM, loglar, hodisalarga javob — himoya markazi ichida ishlash.', lvl: 2, icon: 'radar' },
  { id: 'forensics', cat: 'blue', title: 'Kiberkriminalistika', desc: 'Raqamli dalillarni yig‘ish, xotira va disk tahlili.', lvl: 3, icon: 'search' },
  { id: 'risk', cat: 'blue', title: 'Risk management', desc: 'Xavflarni baholash, siyosatlar va standartlar (ISO 27001).', lvl: 2, icon: 'chart' },
  { id: 'malware', cat: 'research', title: 'Virusologiya', desc: 'Zararli dasturlarni xavfsiz muhitda ochib, xatti-harakatini o‘rganish.', lvl: 3, icon: 'virus' },
  { id: 'reverse', cat: 'research', title: 'Reverse engineering', desc: 'Assembler, debugger va dizassembler bilan binar fayllarni tahlil qilish.', lvl: 3, icon: 'chip' },
  { id: 'osint', cat: 'research', title: 'OSINT', desc: 'Ochiq manbalardan razvedka: odamlar, domenlar, infratuzilma.', lvl: 1, icon: 'eye' },
  { id: 'intel', cat: 'research', title: 'Cyber intelligence', desc: 'Tahdid razvedkasi: APT guruhlar, IOC va hujum kampaniyalari.', lvl: 2, icon: 'globe' },
];

export const CERTS = [
  { id: 'cpts', code: 'CPTS', name: 'Certified Penetration Testing Specialist', issuer: 'Hack The Box',
    desc: 'Eng og‘ir amaliy pentest imtihonlaridan biri: 10 kunlik real tarmoqni buzish va professional hisobot.', img: 'assets/certs/cpts.jpg', hue: '#9fef00' },
  { id: 'ejpt', code: 'eJPT', name: 'eLearnSecurity Junior Penetration Tester', issuer: 'INE Security',
    desc: 'Pentest asoslari bo‘yicha amaliy imtihon: razvedka, ekspluatatsiya va pivoting.', img: 'assets/certs/ejpt.jpg', hue: '#ff6a3d' },
  { id: 'cjca', code: 'CJCA', name: 'Certified Junior Cybersecurity Associate', issuer: 'Hack The Box',
    desc: 'Kiberxavfsizlikning hujum va himoya tomonlarini qamrab olgan boshlang‘ich amaliy sertifikat.', img: 'assets/certs/cjca.jpg', hue: '#3de0ff' },
];
