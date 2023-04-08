// Uses Trulia to get home value

import { webkit } from 'playwright';

if (process.argv.length != 2) {
  console.error('usage: node get_home_value.js');
  process.exit(1);
}

(async () => {
  const browser = await webkit.launch();
  const context = await browser.newContext({
    recordVideo: { dir: 'video' }
  })
  const page = await context.newPage();
  const url = process.env.HOME_URL;

  try {
    await page.goto(url);

    const homeValue = await page.evaluate(el => el.innerText, await page.$('.jrMHya'));
    console.log(homeValue.replace('$', '').replace(',', ''));
  } catch (err) {
    await context.close();
    throw err;
  }

  await context.close();
  await browser.close();
})();