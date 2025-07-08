const axios = require("axios").default;
const tough = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");

const jar = new tough.CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

const USERNAME = 'USERNAME_ANDA';
const PASSWORD = 'PASSWORD_ANDA';

async function login() {
  try {
    const getLoginPage = await client.get('https://www.firefaucet.win/login');
    const csrfMatch = getLoginPage.data.match(/name="csrf_token"\s+value="(.*?)"/);
    const csrf_token = csrfMatch ? csrfMatch[1] : '';

    const payload = new URLSearchParams({
      username: USERNAME,
      password: PASSWORD,
      csrf_token,
      submit: 'Login'
    });

    const res = await client.post('https://www.firefaucet.win/login', payload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      maxRedirects: 5
    });

    console.log('[✓] Login berhasil!');
  } catch (err) {
    console.error('[✗] Login gagal:', err.response?.status || err.message);
    process.exit(1);
  }
}

async function openStartPage() {
  try {
    const res = await client.get('https://www.firefaucet.win/start');
    if (res.status === 200 && res.data.includes("Auto Faucet")) {
      console.log('[✓] Halaman Auto Faucet berhasil dibuka.');
    } else {
      console.log('[✗] Gagal membuka halaman Auto Faucet.');
    }
  } catch (err) {
    console.error('[✗] Gagal akses halaman start:', err.message);
  }
}

async function main() {
  await login();
  await openStartPage();
  console.log('[⏳] Auto faucet akan berjalan otomatis dari situs.');
}

main();
