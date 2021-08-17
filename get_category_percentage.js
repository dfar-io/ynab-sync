import { getBudgetAsync, getCategoryGroupAsync, getCategoryAsync } from './ynab-sync-lib.js'

if (process.argv.length != 5) {
    console.error('usage: node get_category_percentage.js <category_group_name> <category_name> <percentage>');
    process.exit(1);
  }

(async function() {
  const categoryGroupName = process.argv[2];
  const categoryName = process.argv[3];
  const percentage = process.argv[4];

  const budget = await getBudgetAsync();
  const categoryGroup = await getCategoryGroupAsync(budget.id, categoryGroupName);
  const category = await getCategoryAsync(categoryGroup, categoryName);

  const amount = ((category.balance * percentage) / 100000).toFixed(2);
  console.log(amount);
})();
