const axios = require("axios").default;
const tough = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");

const jar = new tough.CookieJar();
const client = wrapper(axios.create({ jar, withCredentials: true }));

const USERNAME = 'Yusdia';
const PASSWORD = '010892gw_E';

async function login() {
  try {
    const getLoginPage = await client.get('https://firefaucet.win/login');
    const csrfMatch = getLoginPage.data.match(/name="csrf_token" value="(.*?)"/);
    const csrf_token = csrfMatch ? csrfMatch[1] : '';

    const payload = new URLSearchParams({
      username: USERNAME,
      password: PASSWORD,
      csrf_token,
      submit: 'Login'
    });

    const res = await client.post('https://firefaucet.win/login', payload.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      maxRedirects: 0,
      validateStatus: status => status === 302
    });

    console.log('[✓] Login berhasil');
  } catch (err) {
    console.error('[✗] Login gagal:', err.response?.status || err.message);
    process.exit(1);
  }
}

async function startAutoFaucet() {
  try {
    const startPage = await client.get('https://firefaucet.win/start');
    const startToken = startPage.data.match(/data-token="(.*?)"/);
    const token = startToken ? startToken[1] : '';

    if (!token) {
      console.log('[!] Gagal menemukan token tombol Start Auto Faucet.');
      return;
    }

    const res = await client.post('https://firefaucet.win/startAutoFaucet', {
      token
    });

    if (res.data && res.data.success) {
      console.log('[✓] Auto Faucet dimulai.');
    } else {
      console.log('[✗] Gagal memulai Auto Faucet:', res.data.message || 'Unknown');
    }
  } catch (err) {
    console.error('[✗] Error:', err.message);
  }
}

async function main() {
  await login();
  await startAutoFaucet();
  console.log('[⏳] Auto faucet berjalan setiap 60 detik secara otomatis oleh sistem situs.');
}

main();
