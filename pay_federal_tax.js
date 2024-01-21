import { webkit } from 'playwright';
import { getEnvVars, getYear } from './ynab-sync-lib.js';

if (process.argv.length != 3) {
  console.error('usage: node pay_federal_tax.js <amount>');
  process.exit(1);
}

(async () => {
  const envVars = getEnvVars();
  const amount = process.argv[2];
  const firstName = 'Dave';
  const lastName = 'Farinelli';
  const year = getYear()

  // More info: https://stackoverflow.com/a/16233919
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  const formattedAmount = formatter.format(amount);

  const browser = await webkit.launch();
  const context = await browser.newContext({
    recordVideo: { dir: 'video' }
  })
  const page = await context.newPage();

  try {
    await page.goto(`https://directpay.irs.gov/directpay/payment`);

    // Step 1
    await page.selectOption('select#payment\\.selectedBoxOne', 'Estimated Tax');
    await page.selectOption('#payment\\.selectedBoxTwo', '1040ES (for 1040, 1040A, 1040EZ)');
    await page.selectOption('#payment\\.selectedTaxYear', year.toString());
    await page.click('button#next');
    await page.click('button.continue');

    // Step 2
    await page.selectOption('select#filingTaxYear', '2020'); // Hardcoded for now, hopefully this will work for a while
    await page.selectOption('select#selectedFilingStatus', '2');  // Married filed jointly
    await page.fill('#firstName', firstName);
    await page.fill('#lastName', lastName);
    await page.fill('#reLastName', lastName);
    await page.fill('#identitySsn', envVars.SSN);
    await page.fill('#identityReSsn', envVars.SSN);
    await page.selectOption('select#birthMonth', envVars.BIRTH_MONTH);
    await page.selectOption('select#birthDay', envVars.BIRTH_DAY);
    await page.fill('#birthYear', envVars.BIRTH_YEAR);
    await page.fill('#address\\.streetAddress', envVars.STREET_ADDRESS);
    await page.fill('#address\\.city', envVars.CITY);
    await page.selectOption('select#address\\.state', envVars.STATE_ABBV);
    await page.fill('#address\\.zipCode', envVars.ZIP_CODE);
    await page.check('#privacyActNotice');
    await page.click('button#next');

    // Step 3
    
    await page.fill('#payment\\.paymentAmount', formattedAmount);
    await page.fill('#payment\\.rePaymentAmount', formattedAmount);
    await page.fill('#payment\\.account\\.routingNumber', envVars.ROUTING_NUMBER);
    await page.fill('#payment\\.account\\.accountNumber', envVars.ACCOUNT_NUMBER);
    await page.fill('#payment\\.account\\.reAccountNumber', envVars.ACCOUNT_NUMBER);
    await page.check('text=Checking');
    await page.check('#optedForEmail');
    await page.fill('#emailAddress', envVars.EMAIL);
    await page.fill('#reEmailAddress', envVars.EMAIL);
    await page.click('button#next');

    // Step 4
    await page.click('button#discAuthModal_agree');
    await page.fill('#payment\\.sigFirstName', firstName);
    await page.fill('#payment\\.sigLastName', lastName);
    await page.fill('#payment\\.sigSsn', envVars.SSN);
    await page.check('#authAgree');
    await page.click('button#next');

    // Get the confirmation number and output it
    const confirmationNumber = await page.evaluate(el => el.innerText, await page.$('#eftID'));
    console.log(confirmationNumber);
  } catch (err) {
    await context.close();
    throw err;
  }

  await context.close();
  await browser.close();
})();
