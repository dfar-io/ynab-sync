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
  const url = 'https://www.realtor.com/realestateandhomes-detail/2258-Holton-Ln_West-Bloomfield_MI_48323_M36292-77663';

  try {
    await page.goto(url);

    const homeValue = await page.evaluate(el => el.innerText, await page.$('.Pricestyles__StyledPrice-rui__btk3ge-0.bvgLFe'));
    console.log(homeValue.replace('$', '').replace(',', ''));
  } catch (err) {
    await context.close();
    throw err;
  }

  await context.close();
  await browser.close();
})();