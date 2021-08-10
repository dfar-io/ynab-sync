import { getBudgetAsync, getAccountAsync, ynab, createTransaction } from './ynab-sync-lib.js'

(async function() {
  const accountName = 'Corgi Prof. Dev';

  const budget = await getBudgetAsync();
  const account = await getAccountAsync(budget.id, accountName);
  const adjustmentAmount = 83.33;

  createTransaction(budget.id, account.id, accountName, adjustmentAmount);
})();
