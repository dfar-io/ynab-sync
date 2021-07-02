const { chromium } = require("playwright-chromium");

module.exports = async function (context) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://whatsmyuseragent.org/');
  await page.screenshot({ path: `example.png` });
  await browser.close();

  context.res = {
      // status: 200, /* Defaults to 200 */
      body: "Worked."
  };
}