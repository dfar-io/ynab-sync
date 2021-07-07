const { chromium } = require("playwright-chromium");

module.exports = async function (context) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://whatsmyuseragent.org/');
  const screenshotBuffer = await page.screenshot();
  await browser.close();

  context.res = {
    body: screenshotBuffer,
    headers: {
      "content-type": "image/png"
    }
  };
}