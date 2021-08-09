import { webkit } from 'playwright';

if (process.argv.length != 3) {
  console.error('usage: node get_home_value.ts <url>');
  process.exit(1);
}

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage();

  const url = process.argv[2];
  await page.goto(`https://www.trulia.com/p/${url}`);

  const homeValue = await page.evaluate(el => el.innerText, await page.$('.nBoMt'));
  console.log(homeValue.replace('$', '').replace(',', ''));

  await browser.close();
})();