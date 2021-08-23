import { webkit } from 'playwright';
import { verifyEnvVars } from './ynab-sync-lib.js';

if (process.argv.length != 3) {
  console.error('usage: node pay_state_tax.js <amount>');
  process.exit(1);
}

(async () => {
  const envVars = getEnvVars();
  const amount = process.argv[2];
  const firstName = 'Dave';
  const lastName = 'Farinelli';
  const last4Ssn = envVars.SSN.substring(envVars.SSN.length - 4);

  const browser = await webkit.launch();
  const page = await browser.newPage();

  // Page 1
  // Need to submit from first page since it brings in a collection of hidden inputs
  await page.goto(`https://treas-secure.state.mi.us/PayIncomeTax/PayIncomeTax.htm`);
  await page.$eval('form[action="https://www.payconnexion.com/pconWeb/epay.jhtml"]', (form) => form.submit());

  // Page 2
  await page.fill('input#authenticationForm_authenticationInputFields_3__fieldValue', lastName.substring(0, 4));
  await page.fill('input#authenticationForm_authenticationInputFields_4__fieldValue', firstName.substring(0, 4));
  await page.fill('input#authenticationForm_authenticationInputFields_5__fieldValue', envVars.ZIP_CODE);
  // Need to do this directly since the field is hidden
  await page.evaluate((last4Ssn) => {
    document.querySelector('input#authenticationForm_authenticationInputFields_1__fieldValue').value = last4Ssn
    document.querySelector('input#authenticate').click();
  }, last4Ssn);

  await page.waitForTimeout(5000);
  await page.screenshot({ path: `state.png` });


  // Page 3
  await page.fill('input#compressedPaymentForm_enterPaymentInformationForm_displayedNonSummableParamList_1__text', firstName);
  await page.fill('input#compressedPaymentForm_enterPaymentInformationForm_displayedNonSummableParamList_4__text', envVars.SPOUSE_FIRST_NAME);
  // This needs to be dynamic based on the current timeframe
  await page.selectOption('#compressedPaymentForm_enterPaymentInformationForm_displayedNonSummableParamList_5__value', '2021 Estimate 1st quarter');
  //await page.selectOption('#compressedPaymentForm_enterPaymentInformationForm_displayedNonSummableParamList_6__value',  'Yes, e-filed');
  await page.evaluate((envVars) => {
    document.querySelector('input#compressedPaymentForm_enterPaymentInformationForm_displayedNonSummableParamList_3__text').value = envVars.SPOUSE_SSN
    document.querySelector('input#compressedPaymentForm_enterPaymentInformationForm_displayedNonSummableParamList_3__reEnterText').value = envVars.SPOUSE_SSN
    
    //document.querySelector('input#authenticate').click();
  }, envVars);

  await page.waitForTimeout(5000);
  await page.screenshot({ path: `state1.png` });




  // // Step 1
  // await page.selectOption('select#payment\\.selectedBoxOne', 'Estimated Tax');
  // await page.selectOption('#payment\\.selectedBoxTwo', '1040ES (for 1040, 1040A, 1040EZ)');
  // await page.selectOption('#payment\\.selectedTaxYear', new Date().getFullYear().toString());
  // await page.click('button#next');
  // await page.click('button.continue');

  // // Step 2
  // await page.selectOption('select#filingTaxYear', (new Date().getFullYear() - 1).toString());
  // await page.selectOption('select#selectedFilingStatus', '2');  // Married filed jointly
  // await page.fill('#firstName', firstName);
  // await page.fill('#lastName', lastName);
  // await page.fill('#reLastName', lastName);
  // await page.fill('#identitySsn', envVars.SSN);
  // await page.fill('#identityReSsn', envVars.SSN);
  // await page.selectOption('select#birthMonth', envVars.BIRTH_MONTH);
  // await page.selectOption('select#birthDay', envVars.BIRTH_DAY);
  // await page.fill('#birthYear', envVars.BIRTH_YEAR);
  // await page.fill('#address\\.streetAddress', '2258 Holton Ln');
  // await page.fill('#address\\.city', 'West Bloomfield');
  // await page.selectOption('select#address\\.state', 'MI');
  // await page.fill('#address\\.zipCode', '48323');
  // await page.check('#privacyActNotice');
  // await page.click('button#next');

  // // Step 3
  // await page.fill('#payment\\.paymentAmount', amount);
  // await page.fill('#payment\\.rePaymentAmount', amount);
  // await page.fill('#payment\\.account\\.routingNumber', envVars.ROUTING_NUMBER);
  // await page.fill('#payment\\.account\\.accountNumber', envVars.ACCOUNT_NUMBER);
  // await page.fill('#payment\\.account\\.reAccountNumber', envVars.ACCOUNT_NUMBER);
  // await page.check('text=Checking');
  // await page.check('#optedForEmail');
  // await page.fill('#emailAddress', envVars.EMAIL_ADDRESS);
  // await page.fill('#reEmailAddress', envVars.EMAIL_ADDRESS);
  // await page.click('button#next');

  // // Step 4
  // await page.click('button#discAuthModal_agree');
  // await page.fill('#payment\\.sigFirstName', firstName);
  // await page.fill('#payment\\.sigLastName', lastName);
  // await page.fill('#payment\\.sigSsn', ssn);
  // await page.check('#authAgree');
  // await page.click('button#next');

  // // Get the confirmation number and output it
  // const confirmationNumber = await page.evaluate(el => el.innerText, await page.$('#eftID'));

  // console.log(confirmationNumber);

  await browser.close();
})();

function getEnvVars() {
    const envVars = {
      SSN: process.env.SSN,
      ZIP_CODE: process.env.ZIP_CODE,
      SPOUSE_SSN: process.env.SPOUSE_SSN,
      SPOUSE_FIRST_NAME: process.env.SPOUSE_FIRST_NAME
    }
  
    verifyEnvVars(envVars)
  
    return envVars;
}