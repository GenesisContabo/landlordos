const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const metadata = await page.evaluate(() => {
    return {
      title: document.title,
      html: document.documentElement.outerHTML.substring(0, 2000),
      lang: document.documentElement.lang,
      metaTags: Array.from(document.querySelectorAll('meta')).map(m => ({
        name: m.name || m.getAttribute('property'),
        content: m.content
      }))
    };
  });

  console.log('Title:', metadata.title);
  console.log('Lang:', metadata.lang);
  console.log('\nMeta Tags:', metadata.metaTags);
  console.log('\nHTML Start:', metadata.html);

  await browser.close();
})();
