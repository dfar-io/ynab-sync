const fetch = require('node-fetch');

if (process.argv.length != 4) {
  console.error('usage: node get_car_balance.ts <api_key> <vin>');
  process.exit(1);
}

(async () => {
  const api_key = process.argv[2];
  const vin = process.argv[3];

  const response = await fetch(`https://api.carsxe.com/marketvalue?key=${api_key}&vin=${vin}`);
  const responseJson = await response.json();

  console.log(responseJson.roughTradeIn);
})();