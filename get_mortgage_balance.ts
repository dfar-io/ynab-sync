const { webkit } = require('playwright');
const fs = require('fs'); 

if (process.argv.length != 12) {
  console.error('usage: node get_mortgage_balance.ts <username> <password> <question_1> <answer_1> <question_2> <answer_2> <question_3> <answer_3> <question_4> <answer_4>');
  process.exit(1);
}

(async () => {
  const selector = 'td.dcolor';

  const browser = await webkit.launch();
  const page = await browser.newPage();
  await page.goto('https://www.webpmt.com/cgi-bin/customers/clogin.pl');

  // Login
  const username = process.argv[2];
  const password = process.argv[3];
  await page.fill('#loannumber', username);
  await page.fill('#password', password);
  await page.press('#password', 'Enter');

  // Process Security check if required
  var content = await page.content();
  if (content.includes('Enhanced Login Security')) {
    await page.waitForSelector(selector);
    var elements = await page.$$(selector);
    const question = await page.evaluate(el => el.innerText, elements[5]);
    const answer = provideSecurityQuestionAnswer(question);

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

function provideSecurityQuestionAnswer(question) {
  const question1 = process.argv[4];
  const answer1 = process.argv[5];
  const question2 = process.argv[6];
  const answer2 = process.argv[7];
  const question3 = process.argv[8];
  const answer3 = process.argv[9];
  const question4 = process.argv[10];
  const answer4 = process.argv[11];

  switch(question.replace(':', '')) {
    case question1: return answer1;
    case question2: return answer2;
    case question3: return answer3;
    case question4: return answer4;
    default: throw new Error(`Received unsupported question: ${question}`);
  }
}
