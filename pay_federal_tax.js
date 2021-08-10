import { webkit } from 'playwright';

if (process.argv.length != 3) {
  console.error('usage: node pay_federal_tax.js <amount>');
  process.exit(1);
}

(async () => {
  const envVars = getEnvVars();
  const amount = process.argv[2];
  const firstName = 'Dave';
  const lastName = 'Farinelli';

  const browser = await webkit.launch();
  const page = await browser.newPage();

  await page.goto(`https://directpay.irs.gov/directpay/payment`);

  // Step 1
  await page.selectOption('select#payment\\.selectedBoxOne', 'Estimated Tax');
  await page.selectOption('#payment\\.selectedBoxTwo', '1040ES (for 1040, 1040A, 1040EZ)');
  await page.selectOption('#payment\\.selectedTaxYear', new Date().getFullYear().toString());
  await page.click('button#next');
  await page.click('button.continue');

  // Step 2
  await page.selectOption('select#filingTaxYear', (new Date().getFullYear() - 1).toString());
  await page.selectOption('select#selectedFilingStatus', '2');  // Married filed jointly
  await page.fill('#firstName', firstName);
  await page.fill('#lastName', lastName);
  await page.fill('#reLastName', lastName);
  await page.fill('#identitySsn', envVars.SSN);
  await page.fill('#identityReSsn', envVars.SSN);
  await page.selectOption('select#birthMonth', envVars.BIRTH_MONTH);
  await page.selectOption('select#birthDay', envVars.BIRTH_DAY);
  await page.fill('#birthYear', envVars.BIRTH_YEAR);
  await page.fill('#address\\.streetAddress', '2258 Holton Ln');
  await page.fill('#address\\.city', 'West Bloomfield');
  await page.selectOption('select#address\\.state', 'MI');
  await page.fill('#address\\.zipCode', '48323');
  await page.check('#privacyActNotice');
  await page.click('button#next');

  // Step 3
  await page.fill('#payment\\.paymentAmount', amount);
  await page.fill('#payment\\.rePaymentAmount', amount);
  await page.fill('#payment\\.account\\.routingNumber', envVars.ROUTING_NUMBER);
  await page.fill('#payment\\.account\\.accountNumber', envVars.ACCOUNT_NUMBER);
  await page.fill('#payment\\.account\\.reAccountNumber', envVars.ACCOUNT_NUMBER);
  await page.check('text=Checking');
  await page.check('#optedForEmail');
  await page.fill('#emailAddress', envVars.EMAIL_ADDRESS);
  await page.fill('#reEmailAddress', envVars.EMAIL_ADDRESS);
  await page.click('button#next');

  // Step 4
  await page.click('button#discAuthModal_agree');
  await page.fill('#payment\\.sigFirstName', firstName);
  await page.fill('#payment\\.sigLastName', lastName);
  await page.fill('#payment\\.sigSsn', ssn);
  await page.check('#authAgree');
  await page.click('button#next');

  // Get the confirmation number and output it
  const confirmationNumber = await page.evaluate(el => el.innerText, await page.$('#eftID'));

  console.log(confirmationNumber);

  await browser.close();
})();

function getEnvVars() {
    const envVars = {
      SSN: process.env.SSN,
      ROUTING_NUMBER: process.env.ROUTING_NUMBER,
      ACCOUNT_NUMBER: process.env.ACCOUNT_NUMBER,
      EMAIL_ADDRESS: process.env.EMAIL_ADDRESS,
      BIRTH_YEAR: process.env.BIRTH_YEAR,
      BIRTH_MONTH: process.env.BIRTH_MONTH,
      BIRTH_DAY: process.env.BIRTH_DAY,
      STREET_ADDRESS: process.env.STREET_ADDRESS,
      CITY: process.env.CITY,
      STATE_ABBV: process.env.STATE_ABBV,
      ZIP_CODE: process.env.ZIP_CODE,
    }
  
    for (const property in envVars) {
      if (envVars[property] === undefined) {
        console.error(`Environment variable ${property} not defined.`)
        process.exit(1);
      }
    }
  
    return envVars;
}