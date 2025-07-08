const axios = require("axios").default;
const tough = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");

const jar = new tough.CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

const USERNAME = 'yusdia';
const PASSWORD = '010892gw_E';

async function login() {
  const res = await client.get('https://www.firefaucet.win/login');
  const csrf = res.data.match(/name="csrf_token"\s+value="(.*?)"/)?.[1];
  if (!csrf) throw new Error("CSRF token tidak ditemukan!");

  const payload = new URLSearchParams({
    username: USERNAME,
    password: PASSWORD,
    csrf_token: csrf,
    submit: 'Login'
  });

  await client.post('https://www.firefaucet.win/login', payload.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    maxRedirects: 5
  });

  console.log('[✓] Login berhasil!');
}

async function startAutoFaucet() {
  const res = await client.get('https://www.firefaucet.win/start');
  const tokenMatch = res.data.match(/data-token="(.*?)"/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) {
    console.log('[!] Gagal menemukan token start faucet. Mungkin sudah berjalan.');
    return;
  }

  const resp = await client.post('https://www.firefaucet.win/startAutoFaucet', { token });
  if (resp.data && resp.data.success) {
    console.log('[✓] Auto Faucet dimulai!');
  } else {
    console.log('[!] Gagal menekan tombol Start:', resp.data.message || 'Tidak diketahui');
  }
}

async function fetchStatus() {
  const res = await client.get('https://www.firefaucet.win/start');
  const html = res.data;

  const extract = (label) => {
    const regex = new RegExp(`${label}.*?<p[^>]*>(.*?)<\\/p>`, 'i');
    return html.match(regex)?.[1].trim() || '-';
  };

  return {
    currency: extract('Currencies Selected'),
    next: extract('Next Payout in'),
    remaining: extract('Auto Claims Remaining'),
    timeLeft: extract('Time until Faucet Stops'),
    boost: extract('Payout Boost'),
  };
}

async function loopReport() {
  while (true) {
    try {
      const status = await fetchStatus();
      const now = new Date().toLocaleString();

      console.log(`
[🪙 CLAIM REPORT - ${now}]
Currency       : ${status.currency}
Next Payout In : ${status.next}
Claims Left    : ${status.remaining}
Time Left      : ${status.timeLeft}
Payout Boost   : ${status.boost}
---------------------------------
      `);

      await new Promise(r => setTimeout(r, 60_000)); // tunggu 60 detik
    } catch (e) {
      console.log('[✗] Error:', e.message);
      break;
    }
  }
}

(async () => {
  try {
    await login();
    await startAutoFaucet();
    await loopReport();
  } catch (err) {
    console.error('[FATAL] Terjadi kesalahan:', err.message);
  }
})(
