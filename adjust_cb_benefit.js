import { getBudgetAsync, getAccountAsync, convertCurrencyToMilliUnits, ynabAPI, ynab } from './ynab-sync-lib.js'

(async function() {
  const accountName = 'Corgi Prof. Dev';

  const budget = await getBudgetAsync();
  const account = await getAccountAsync(budget.id, accountName);

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
