// To call the API directly
// curl https://api.carsxe.com/marketvalue?key=API_KEY&vin=VIN

import fetch from 'node-fetch';

if (process.argv.length != 3) {
  console.error('usage: node get_car_balance.js <vin>');
  process.exit(1);
}

(async () => {
  const api_key = process.env.CAR_API_KEY;
  const vin = process.argv[2];

  const response = await fetch(`https://api.carsxe.com/marketvalue?key=${api_key}&vin=${vin}`);
  const responseJson = await response.json();

  console.log(responseJson.averageTradeIn);
})();