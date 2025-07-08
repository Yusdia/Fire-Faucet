const axios = require("axios").default;
const tough = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");

const jar = new tough.CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

const USERNAME = 'yusdia';
const PASSWORD = '010892gw_E';

async function login() {
  const getLoginPage = await client.get('https://www.firefaucet.win/login');
  const csrfMatch = getLoginPage.data.match(/name="csrf_token"\s+value="(.*?)"/);
  const csrf_token = csrfMatch ? csrfMatch[1] : '';

  const payload = new URLSearchParams({
    username: USERNAME,
    password: PASSWORD,
    csrf_token,
    submit: 'Login'
  });

  await client.post('https://www.firefaucet.win/login', payload.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    maxRedirects: 5
  });

  console.log('[✓] Login berhasil!');
}

async function fetchAutoFaucetStatus() {
  const res = await client.get('https://www.firefaucet.win/start');
  const html = res.data;

  const get = (regex, fallback = '-') => {
    const match = html.match(regex);
    return match ? match[1].trim() : fallback;
  };

  return {
    currency: get(/Currencies Selected<\/h5>\s*<p[^>]*>(.*?)<\/p>/),
    nextPayout: get(/Next Payout in<\/h5>\s*<p[^>]*>(.*?)<\/p>/),
    claimsRemaining: get(/Auto Claims Remaining<\/h5>\s*<p[^>]*>(.*?)<\/p>/),
    timeLeft: get(/Time until Faucet Stops<\/h5>\s*<p[^>]*>(.*?)<\/p>/),
    boost: get(/Payout Boost<\/h5>\s*<p[^>]*>(.*?)<\/p>/)
  };
}

async function main() {
  await login();

  while (true) {
    try {
      const status = await fetchAutoFaucetStatus();
      const now = new Date().toLocaleString();

      console.log(`
========================
[CLAIM REPORT - ${now}]
Currency       : ${status.currency}
Next Payout In : ${status.nextPayout}
Claims Left    : ${status.claimsRemaining}
Time Left      : ${status.timeLeft}
Payout Boost   : ${status.boost}
========================
      `);

      await new Promise(r => setTimeout(r, 60 * 1000)); // tunggu 60 detik
    } catch (err) {
      console.error('[✗] Gagal ambil data:', err.message);
      break;
    }
  }
}

main();
