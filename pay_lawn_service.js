import { webkit } from 'playwright';
import { verifyEnvVars } from './ynab-sync-lib.js';

(async () => {
  const browser = await webkit.launch();
  const context = await browser.newContext({
    recordVideo: { dir: 'video' },
    viewport: { width: 1280, height: 2000 }
  })
  const page = await context.newPage();

  const envVars = getEnvVars();

  try {
    await page.goto(`https://www.lawngateway.com/HerschsLawnSpray/Login_New.aspx`);

    // Login
    await page.fill('input#txtEmail', envVars.EMAIL);
    await page.fill('input#txtPassword', envVars.HERSCHS_PASSWORD);
    await page.click('button#sign_in_button');

    // Dashboard
    await page.click('a.btn-primary');

    // Start Prepay
    await page.click('input#accept_terms');
    await page.fill('input#_digital_signature', 'Dave Farinelli');
    await page.click('button#_prepay');

    // Make payment
    const confirmButton = await page.frameLocator('#payment-iframe').locator('button#btnIFrameProcessSave')
    await confirmButton.click();

    await page.waitForTimeout(30000);
    const confirmationText = await page.$$("text='Confirmed Programs/Services'");
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
    EMAIL: process.env.EMAIL,
    HERSCHS_PASSWORD: process.env.HERSCHS_PASSWORD
  }

  verifyEnvVars(envVars);

  return envVars;
}