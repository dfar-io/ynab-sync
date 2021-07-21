const { webkit } = require('playwright');
const fs = require('fs'); 

if (process.argv.length != 4) {
  console.error('usage: node main.ts <username> <password>');
  process.exit(1);
}

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage();
  await page.goto('https://www.webpmt.com/cgi-bin/customers/clogin.pl');

  // Login
  const username = process.argv[2];
  const password = process.argv[3];
  await page.fill('#loannumber', username);
  await page.fill('#password', password);
  await page.press('#password', 'Enter');

  // Move to My Info page
  try {
    await page.click('text=MY INFO');
  } catch (e) {
    if (e.name === 'TimeoutError') {
      console.error('Unable to progress to \'My Info\' page, credentials may be bad, or stuck on security questions.');
      await page.screenshot({ path: `error.png` });
      const content = await page.content();
      console.log(content);
      process.exit(1);
    }
  }

  // Get loan balance
  const selector = 'td.dcolor';
  await page.waitForSelector(selector);
  var elements = await page.$$(selector);
  const loanBalance = await page.evaluate(el => el.innerText, elements[10]);
  console.log(`Mortgage loan balance is: ${loanBalance}`);

  await browser.close();
})();