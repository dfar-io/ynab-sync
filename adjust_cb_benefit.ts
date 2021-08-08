if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const ynab = require("ynab");
const ynabAPI = new ynab.API(process.env.YNAB_ACCESS_TOKEN);

(async function() {
  const accountName = 'Corgi Prof. Dev';

  const budget = await getBudget();
  const account = await getAccount(budget.id, accountName);

  // Determine adjustment amount
  const balance = Math.abs(ynab.utils.convertMilliUnitsToCurrencyAmount(account.balance));
  const adjustmentAmount = 83.33;

  // Create adjustment transaction
  console.log(`${accountName}: Creating adjustment transaction of $${adjustmentAmount}.`);
  await ynabAPI.transactions.createTransaction(
    budget.id,
    {
      transaction: {
        account_id: account.id,
        date: ynab.utils.getCurrentDateInISOFormat(),
        amount: convertCurrencyToMilliUnits(adjustmentAmount),
        memo: "Adjustment from YNAB-Sync",
        cleared: ynab.SaveTransaction.ClearedEnum.Cleared
      }
    }
  ).catch(e => {
    console.error(e);
    process.exit(1);
  });;
})();

function convertCurrencyToMilliUnits(currency) {
  return currency * 1000;
}

async function getBudget() {
  const budgetName = 'Budget'
  const budgetsResponse = await ynabAPI.budgets.getBudgets();
  const budget = budgetsResponse.data.budgets.find(b => b.name === budgetName);
  if (budget == null) throw new Error(`Unable to find \'${budgetName}\' budget.`);

  return budget;
}

async function getAccount(budget_id, account_name) {
  const accountsResponse = await ynabAPI.accounts.getAccounts(budget_id);
  const mortgageAccount = accountsResponse.data.accounts.find(a => a.name === account_name);
  if (mortgageAccount == null) throw new Error(`Unable to find \'${account_name}\' account.`);

  return mortgageAccount;
}

