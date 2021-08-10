if (process.argv.length != 4) {
  console.error('usage: node adjust_ynab_account.js <account_name> <balance>');
  process.exit(1);
}

import { getBudgetAsync, getAccountAsync, ynab, createTransaction } from './ynab-sync-lib.js'

(async function() {
  const accountName = process.argv[2];
  const providedBalance = parseFloat(process.argv[3]);

  const budget = await getBudgetAsync();
  const account = await getAccountAsync(budget.id, accountName);

  // Determine adjustment amount
  const balance = ynab.utils.convertMilliUnitsToCurrencyAmount(account.balance);
  const adjustmentAmount = providedBalance - balance;
  if (adjustmentAmount === 0)
  {
    console.log(`${accountName}: No difference between balances.`);
    process.exit(0);
  }

  createTransaction(budget.id, account.id, accountName, adjustmentAmount);
})();

