// Uses Redfin to get home value

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
  //const url = process.env.HOME_URL;
  const url = 'https://www.redfin.com/MI/West-Bloomfield/2258-Holton-Ln-48323/home/93862019';

  try {
    await page.goto(url);

    const homeValue = await page.evaluate(el => el.innerText, await page.$('div.statsValue > span'));
    console.log(homeValue.replace('$', '').replace(',', ''));
  } catch (err) {
    await context.close();
    throw err;
  }

  await context.close();
  await browser.close();
})();