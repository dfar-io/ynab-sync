import { getBudgetAsync, getAccountAsync, ynabAPI } from './ynab-sync-lib.js'
  
(async function() {
  // This should be the percent taken between both federal and state
  const taxPercentage = 0.34;
  
  const budget = await getBudgetAsync();
  const account = await getAccountAsync(budget.id, 'LLC');

  const transactionsResponse = await ynabAPI.transactions.getTransactionsByAccount(budget.id, account.id);
  const transactionsData = transactionsResponse.data.transactions;
  const unflaggedTransactions = transactionsData.filter(t => t.flag_color === null && t.amount > 0);

  if (unflaggedTransactions.length === 0) {
    console.log("No eligible transactions found.");
    process.exit(0);
  }

  unflaggedTransactions.forEach(async transaction => {
    const transactionAmount = transaction.amount;
    const taxAmount = transactionAmount * taxPercentage;
    console.log(`Adding ${taxAmount / 1000} from transaction amount ${transactionAmount / 1000}`)
    await addTaxAmountToCategoryAsync(budget.id, taxAmount);
    await markTransactionAsync(budget.id, transaction);
  });
})();
  
async function getLLCCategoryAsync(budget_id) {
  const llcCategoryName = '1099 Taxes';
  const mainCategoryGroupName = 'Main';

  const categoriesResponse = await ynabAPI.categories.getCategories(budget_id);
  const mainCategoryGroup = categoriesResponse.data.category_groups.find(cg => cg.name === mainCategoryGroupName);
  if (mainCategoryGroup == null) throw new Error(`Unable to find \'${mainCategoryGroupName}\' category group.`);

  const llcCategory = mainCategoryGroup.categories.find(c => c.name === llcCategoryName);
  if (llcCategory == null) throw new Error(`Unable to find \'${llcCategoryName}\' category.`);

  return llcCategory;
}

async function addTaxAmountToCategoryAsync(budget_id, taxAmount) {
  const category = await getLLCCategoryAsync(budget_id);
  category.budgeted = category.budgeted + taxAmount;
  await ynabAPI.categories.updateMonthCategory(
    budget_id,
    new Date(),
    category.id,
    {
      category: category
    }
  ).catch(e => {
    console.error(e);
    process.exit(1);
  });
}

async function markTransactionAsync(budget_id, transaction) {
  transaction.flag_color = 'red';
  transaction.approved = true;
  await ynabAPI.transactions.updateTransaction(
    budget_id,
    transaction.id,
    {
      transaction: transaction
    }
  ).catch(e => {
    console.error(e);
    process.exit(1);
  });
}

