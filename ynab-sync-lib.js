import ynab from "ynab";
export const ynabAPI = new ynab.API(process.env.YNAB_ACCESS_TOKEN);
export { ynab }

export async function getBudgetAsync() {
    const budgetName = 'Budget'
    const budgetsResponse = await ynabAPI.budgets.getBudgets();
    const budget = budgetsResponse.data.budgets.find(b => b.name === budgetName);
    if (budget == null) throw new Error(`Unable to find \'${budgetName}\' budget.`);
  
    return budget;
}

export async function getAccountAsync(budget_id, account_name) {
    const accountsResponse = await ynabAPI.accounts.getAccounts(budget_id);
    const mortgageAccount = accountsResponse.data.accounts.find(a => a.name === account_name);
    if (mortgageAccount == null) throw new Error(`Unable to find \'${account_name}\' account.`);
  
    return mortgageAccount;
}

export function convertCurrencyToMilliUnits(currency) {
    return Math.round(currency * 1000);
}