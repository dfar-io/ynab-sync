// When running this in non-prod, you may want to set up a
// .env file to simulate the required environment files.

import { webkit } from 'playwright';

(async () => {
  const envVars = getEnvVars();

  const selector = 'td.dcolor';

  const browser = await webkit.launch();
  const page = await browser.newPage();
  await page.goto('https://www.webpmt.com/cgi-bin/customers/clogin.pl');

  // Login
  await page.fill('#loannumber', envVars.MORTGAGE_USERNAME);
  await page.fill('#password', envVars.MORTGAGE_PASSWORD);
  await page.press('#password', 'Enter');

  // Process Security check if required
  var content = await page.content();
  if (content.includes('Enhanced Login Security')) {
    await page.waitForSelector(selector);
    var elements = await page.$$(selector);
    const question = await page.evaluate(el => el.innerText, elements[5]);
    const answer = provideSecurityQuestionAnswer(question, envVars);

    await page.fill('input[name="answer"]', answer);
    await page.click('input[type="submit"]');
  }

  // Move to My Info page
  try {
    await page.click('text=MY INFO');
  } catch (e) {
    if (e.name === 'TimeoutError') {
      console.error('Unable to progress to \'My Info\' page, credentials may be bad.');
      await page.screenshot({ path: `error.png` });
      const content = await page.content();
      console.log(content);
      process.exit(1);
    }
  }

  // Get loan balance
  await page.waitForSelector(selector);
  var elements = await page.$$(selector);
  const loanBalance = await page.evaluate(el => el.innerText, elements[10]);
  console.log(`${loanBalance}`);

  await browser.close();
})();

function provideSecurityQuestionAnswer(question, envVars) {
  const question1 = envVars.QUESTION_1;
  const answer1 = envVars.ANSWER_1;
  const question2 = envVars.QUESTION_2;
  const answer2 = envVars.ANSWER_2;
  const question3 = envVars.QUESTION_3;
  const answer3 = envVars.ANSWER_3;
  const question4 = envVars.QUESTION_4;
  const answer4 = envVars.ANSWER_4;

  switch(question.replace(':', '')) {
    case question1: return answer1;
    case question2: return answer2;
    case question3: return answer3;
    case question4: return answer4;
    default: throw new Error(`Received unsupported question: ${question}`);
  }
}

function getEnvVars() {
  const envVars = {
    MORTGAGE_USERNAME: process.env.MORTGAGE_USERNAME,
    MORTGAGE_PASSWORD: process.env.MORTGAGE_PASSWORD,
    QUESTION_1: process.env.QUESTION_1,
    ANSWER_1: process.env.ANSWER_1,
    QUESTION_2: process.env.QUESTION_2,
    ANSWER_2: process.env.ANSWER_2,
    QUESTION_3: process.env.QUESTION_3,
    ANSWER_3: process.env.ANSWER_3,
    QUESTION_4: process.env.QUESTION_4,
    ANSWER_4: process.env.ANSWER_4
  }

  for (const property in envVars) {
    if (envVars[property] === undefined) {
      console.error(`Environment variable ${property} not defined.`)
      process.exit(1);
    }
  }

  return envVars;
}

