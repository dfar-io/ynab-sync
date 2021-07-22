if (process.argv.length != 4) {
  console.error('usage: node adjust_mortgage.ts <ynab_access_token> <mortgage_balance>');
  process.exit(1);
}

const ynab = require("ynab");
const ynabAPI = new ynab.API(process.argv[2]);

(async function() {
  const budget = await getBudget();
  const mortgageAccount = await getMortgageAccount(budget.id);

  // Determine adjustment amount
  const balance = Math.abs(ynab.utils.convertMilliUnitsToCurrencyAmount(mortgageAccount.balance));
  const providedBalance = parseFloat(process.argv[3]);
  const adjustmentAmount = balance - providedBalance;
  if (adjustmentAmount === 0)
  {
    console.log('No difference between balances.');
    process.exit(0);
  }

  // Create adjustment transaction
  console.log(`Creating adjustment transaction of $${adjustmentAmount}.`);
  await ynabAPI.transactions.createTransaction(
    budget.id,
    {
      transaction: {
        account_id: mortgageAccount.id,
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

async function getMortgageAccount(budget_id) {
  const mortgageAccountName = 'Mortgage';
  const accountsResponse = await ynabAPI.accounts.getAccounts(budget_id);
  const mortgageAccount = accountsResponse.data.accounts.find(a => a.name === mortgageAccountName);
  if (mortgageAccount == null) throw new Error(`Unable to find \'${mortgageAccountName}\' account.`);

  return mortgageAccount;
}

