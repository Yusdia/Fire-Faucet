const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // ganti true jika headless aktif di Termux Anda
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.goto('https://firefaucet.win/login', { waitUntil: 'networkidle2' });

  // Isi login
  await page.type('input[name="username"]', 'USERNAME_ANDA');
  await page.type('input[name="password"]', 'PASSWORD_ANDA');
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  console.log('[✓] Login berhasil.');

  // Buka halaman /start
  await page.goto('https://firefaucet.win/start', { waitUntil: 'networkidle2' });

  console.log('[✓] Masuk halaman Auto Faucet.');

  // Klik tombol "Start Auto Faucet"
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(el =>
      el.textContent.toLowerCase().includes('start auto')
    );
    if (btn) btn.click();
  });

  console.log('[✓] Auto Faucet dimulai.');

  // Looping pemantauan laporan setiap 60 detik
  while (true) {
    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText.trim() : 'N/A';
      };

      return {
        currency: getText('.currency-select') || 'DOGE',
        next: getText('.countdown') || '60 seconds',
        claims: getText('div:has-text("Auto Claims Remaining")'),
        timeLeft: getText('div:has-text("Time until Faucet Stops")'),
        boost: getText('div:has-text("Payout Boost")'),
      };
    });

    const now = new Date().toLocaleString();
    console.clear();
    console.log(`
=============================================
         🔥 FIREFAUCET AUTO REPORT 🔥
=============================================
Currency Selected        : ${data.currency}
Next Payout In           : ${data.next}
Auto Claims Remaining    : ${data.claims}
Time Until Faucet Stops  : ${data.timeLeft}
Payout Boost             : ${data.boost}
Status                   : ✅ Auto Payout Running

Updated At               : ${now}
=============================================
    `);

    await page.waitForTimeout(60000); // tunggu 60 detik
  }

  // Tidak ditutup karena auto faucet berjalan terus
})();
