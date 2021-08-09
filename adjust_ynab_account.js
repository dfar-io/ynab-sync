if (process.argv.length != 4) {
  console.error('usage: node adjust_ynab_account.js <account_name> <balance>');
  process.exit(1);
}

import { getBudgetAsync, getAccountAsync, convertCurrencyToMilliUnits, ynabAPI, ynab } from './ynab-sync-lib.js'

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

