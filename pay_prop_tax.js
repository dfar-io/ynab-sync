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
    await page.click('button#cart-contents-main-button');

    // Payment screen
    await page.click('div#radio_wrapper_echeck');

    await page.fill('#payment_method_first_name', firstName);
    await page.fill('#payment_method_last_name', lastName);

    await page.click('div.desktop-select');
    await page.click('li#personal_checking_option');

    await page.fill('#payment_method_routing_number', envVars.ROUTING_NUMBER);
    await page.fill('#payment_method_account_number', envVars.ACCOUNT_NUMBER);
    await page.fill('#account_number_confirmation', envVars.ACCOUNT_NUMBER);

    await page.fill('#payment_method_street_address', envVars.STREET_ADDRESS);
    await page.click('div#payment_method_state_select');
    await page.click('li#MI_option');
    await page.fill('#payment_method_city', envVars.CITY);
    await page.fill('#payment_method_zip', envVars.ZIP_CODE);
    await page.fill('#payment_method_email', envVars.EMAIL);
    // Click continue button
    await page.click('input#payment-method-submit.btn-primary.tw-btn.tw-w-full');

    // Confirmation
    // Click agree (won't work with Playwright for some reason)
    await page.waitForTimeout(5000);
    await page.evaluate(() => {
      document.querySelector('input#agree').click();
    });
    await page.click('button.btn-primary');
    // Takes a long time to confirm the order
    await page.waitForTimeout(30000);

    const confirmationText = await page.$$("text='Delete'");
    if (confirmationText.length == 0) {
      throw new Error('unable to get confirmation.');
    }
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