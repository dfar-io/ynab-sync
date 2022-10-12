import { webkit } from 'playwright';

if (process.argv.length != 3) {
  console.error('usage: node get_home_value.js <url>');
  process.exit(1);
}

(async () => {
  const browser = await webkit.launch();
  const context = await browser.newContext({
    recordVideo: { dir: 'video' }
  })
  const page = await context.newPage();

  const url = process.argv[2];

  try {
    await page.goto(`https://www.trulia.com/p/${url}`);

    const homeValue = await page.evaluate(el => el.innerText, await page.$('.cikoTb'));
    console.log(homeValue.replace('$', '').replace(',', ''));
  } catch (err) {
    await context.close();
    throw err;
  }

  await context.close();
  await browser.close();
})();