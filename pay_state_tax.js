import { webkit } from 'playwright';
import { getEnvVars, getYear } from './ynab-sync-lib.js';

if (process.argv.length != 3) {
  console.error('usage: node pay_state_tax.js <amount>');
  process.exit(1);
}

(async () => {
  const amount = process.argv[2];
  if (amount < 1.00) {
    console.error('Amount must be 1.00 or greater.');
    process.exit(1);
  }

  const envVars = getEnvVars();
  const firstName = 'Dave';
  const lastName = 'Farinelli';
  const last4Ssn = envVars.SSN.substring(envVars.SSN.length - 4);

  const browser = await webkit.launch();
  const context = await browser.newContext({
    recordVideo: { dir: 'video' },
    viewport: { height: 2000, width: 2000 }
  })
  const page = await context.newPage();

  try {
    // Page 1
    // Need to submit from first page since it brings in a collection of hidden inputs
    await page.goto(`https://treas-secure.state.mi.us/PayIncomeTax/PayIncomeTax.htm`);
    await page.$eval('form[action="https://www.payconnexion.com/pconWeb/epay.jhtml"]', (form) => form.submit());

    // Page 2
    await waitThenFillAsync(page, 'input#authenticationForm_authenticationInputFields_3__fieldValue', lastName.substring(0, 4));
    await waitThenFillAsync(page, 'input#authenticationForm_authenticationInputFields_4__fieldValue', firstName.substring(0, 4));
    await waitThenFillAsync(page, 'input#authenticationForm_authenticationInputFields_5__fieldValue', envVars.ZIP_CODE);
    // Need to do this directly since the field is hidden
    await page.evaluate((last4Ssn) => {
      document.querySelector('input#authenticationForm_authenticationInputFields_1__fieldValue').value = last4Ssn
      document.querySelector('input#authenticate').click();
    }, last4Ssn);

    // Page 3
    await waitThenFillAsync(page, 'input#compressedPaymentForm_enterPaymentInformationForm_displayedNonSummableParamList_1__text', firstName);
    // spouse first name no longer needed as of 2023.09.10
    await page.selectOption('#compressedPaymentForm_enterPaymentInformationForm_displayedNonSummableParamList_5__value', getPaymentType());
    await page.selectOption('#compressedPaymentForm_enterPaymentInformationForm_displayedNonSummableParamList_6__value',  ' Yes, e-filed');
    await waitThenFillAsync(page, 'input#compressedPaymentForm_enterPaymentInformationForm_singlePaymentAmount', amount);
    await waitThenFillAsync(page, 'input#bankRTNnumber', envVars.ROUTING_NUMBER);
    await page.check('#compressedPaymentForm_enterPaymentDetailsForm_paymentBankAccountForm_accountTypeC');
    await page.check('#compressedPaymentForm_enterPaymentDetailsForm_paymentBankAccountForm_accountCategoryC');
    await waitThenFillAsync(page, 'input#firstNameACH', firstName);
    await waitThenFillAsync(page, 'input#lastNameACH', lastName);
    await page.selectOption('select#stateACH', envVars.STATE_ABBV);

    // Populate hidden values and click
    await page.evaluate(({envVars, firstName, lastName}) => {
      document.querySelector('input#compressedPaymentForm_enterPaymentInformationForm_displayedNonSummableParamList_3__text').value = envVars.SPOUSE_SSN;
      document.querySelector('input#compressedPaymentForm_enterPaymentInformationForm_displayedNonSummableParamList_3__reEnterText').value = envVars.SPOUSE_SSN;
      document.querySelector('input#bankAccountNumber').value = envVars.ACCOUNT_NUMBER;
      document.querySelector('input#bankAccountNumberConfirm').value = envVars.ACCOUNT_NUMBER;
      document.querySelector('input#payorProfileForm_firstName').value = firstName;
      document.querySelector('input#payorProfileForm_lastName').value = lastName;
      document.querySelector('input#payorProfileForm_phoneField_areaCode').value = envVars.PHONE_NUMBER.substring(0, 3);
      document.querySelector('input#payorProfileForm_phoneField_prefix').value  = envVars.PHONE_NUMBER.substring(3, 6);
      document.querySelector('input#payorProfileForm_phoneField_suffix').value = envVars.PHONE_NUMBER.substring(6, 10);
      document.querySelector('input#payorProfileForm_email').value = envVars.EMAIL;
      document.querySelector('input#payorProfileForm_addressForm_street1').value = envVars.STREET_ADDRESS;
      document.querySelector('input#payorProfileForm_addressForm_city').value = envVars.CITY;
      document.querySelector('input#payorProfileForm_addressForm_zipField_zip5').value = envVars.ZIP_CODE;
      
      document.querySelector('input#formSubmitComp').click();
    }, {envVars, firstName, lastName});

    // Page 4
    await page.check('#verifyPaymentForm_acceptDebitAuthorization');
    await page.click('input#confirmBtn');

    // Get the confirmation number and output it
    await page.waitForTimeout(10000);
    var elements = await page.$$('.boldy');
    const confirmationNumber = await page.evaluate(el => el.innerText, elements[1]);
    console.log(confirmationNumber);
  } catch (err) {
    await context.close();
    throw err;
  }

  await context.close();
  await browser.close();
})();

function getPaymentType() {
  const currentMonth = new Date().getMonth();
  const year = getYear();
  
  var iteration = getIteration(currentMonth);

  return `${year.toString()} Estimate ${iteration} quarter`;
}

function getIteration(currentMonth) {
  switch (currentMonth) {
    case 0:   // January
      return '4th';
    case 3:   // April
      return '1st';
    case 5:   // June
      return '2nd';
    case 8:   // September
      return '3rd';
    default:
      throw new Error(`Invalid month provided to get iteration: ${currentMonth}`);
  }
}

async function waitThenFillAsync(page, selector, value) {
  await page.waitForSelector(selector);
  await page.fill(selector, value);
}