import fetch from 'node-fetch';
import { default as FormData } from "form-data";
import { verifyEnvVars } from './ynab-sync-lib.js';

(async () => {
  var envVars = getEnvVars();

  // generate access token from refresh token
  const accessTokenResponse = await fetch(
    `https://accounts.zoho.com/oauth/v2/token?refresh_token=${envVars.ZOHO_REFRESH_TOKEN}` +
    `&client_id=${envVars.ZOHO_CLIENT_ID}` +
    `&client_secret=${envVars.ZOHO_CLIENT_SECRET}&grant_type=refresh_token`,
    { method: 'POST' }
  )
  const accessToken = (await accessTokenResponse.json()).access_token;

  // create invoice
  const createInvoiceResponse = await fetch(
    `https://invoice.zoho.com/api/v3/invoices?send=true`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'X-com-zoho-invoice-organizationid': 677807491
      },
      body: getInvoiceBody()
    }
  )

  console.log(await createInvoiceResponse.json());
})();

function getEnvVars() {
  const envVars = {
    ZOHO_CLIENT_ID: process.env.ZOHO_CLIENT_ID,
    ZOHO_CLIENT_SECRET: process.env.ZOHO_CLIENT_SECRET,
    ZOHO_REFRESH_TOKEN: process.env.ZOHO_REFRESH_TOKEN
  }

  verifyEnvVars(envVars);

  return envVars;
}

function getInvoiceBody() {
  const formData  = new FormData();

  formData.append(
    'JSONString',
    JSON.stringify({
      customer_id: '1617949000000066138',
      date: getDate(),
      line_items: [
        {
          item_id: '1617949000000066248',
          rate: 125,
          quantity: 80
        }
      ],
      email: 1617949000000066140
    })
  );

  return formData;
}

function getDate() {
  let currentDate = new Date();
  const offset = currentDate.getTimezoneOffset()
  currentDate = new Date(currentDate.getTime() - (offset*60*1000))
  return currentDate.toISOString().split('T')[0]
}