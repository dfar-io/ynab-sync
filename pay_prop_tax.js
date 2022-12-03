import { webkit } from 'playwright';
import { verifyEnvVars } from './ynab-sync-lib.js';

(async () => {
  const browser = await webkit.launch();
  const context = await browser.newContext({
    recordVideo: { dir: 'video' },
    // allows for max screen
    viewport: null
  })
  const page = await context.newPage();

  const envVars = getEnvVars();
  const firstName = 'Dave';
  const lastName = 'Farinelli';

  try {
    await page.goto(`https://bsaonline.com/OnlinePayment/OnlinePaymentSearch/?PaymentApplicationType=4&uid=652`);

    // Search
    await page.fill('#Name', lastName);
    await page.click('input#search');

    // Search results
    await page.click('input[id^=\'submit\']');

    // Checkout
    await page.click('a#cart-contents-main-button');

    // Payment screen
    // stuck here so far, need another way to click
    await page.check('input#echeck');

    await page.fill('#payment_method_first_name', firstName);
    await page.fill('#payment_method_last_name', lastName);
    // How do I get the account type?
    await page.click('p#personal_checking_option');
    await page.fill('#payment_method_routing_number', envVars.ROUTING_NUMBER);
    await page.fill('#payment_method_account_number', envVars.ACCOUNT_NUMBER);
    await page.fill('#account_number_confirmation', envVars.ACCOUNT_NUMBER);

    await page.fill('#payment_method_street_address', envVars.STREET_ADDRESS);
    // How do I get the state?
    await page.fill('#payment_method_city', envVars.CITY);
    await page.fill('#payment_method_zip', envVars.ZIP_CODE);
    await page.fill('#payment_method_email', envVars.EMAIL);

    // Step 4

    // Get the confirmation number and output it
    // const confirmationNumber = await page.evaluate(el => el.innerText, await page.$('#eftID'));
    // console.log(confirmationNumber);
  } catch (err) {
    await context.close();
    throw err;
  }

  await context.close();
  await browser.close();
})();

function getEnvVars() {
  const envVars = {
    ROUTING_NUMBER: process.env.ROUTING_NUMBER,
    ACCOUNT_NUMBER: process.env.ACCOUNT_NUMBER,
    STREET_ADDRESS: process.env.STREET_ADDRESS,
    CITY: process.env.CITY,
    ZIP_CODE: process.env.ZIP_CODE,
    EMAIL: process.env.EMAIL
  }

  verifyEnvVars(envVars);

  return envVars;
}