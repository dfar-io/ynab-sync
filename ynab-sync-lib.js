import ynab from "ynab";
export const ynabAPI = new ynab.API(process.env.YNAB_ACCESS_TOKEN);
export { ynab };

export async function getBudgetAsync() {
    const budgetName = 'Main'
    const budgetsResponse = await ynabAPI.budgets.getBudgets()
        .catch(e => {
            console.error(e);
            process.exit(1);
        });
    const budget = budgetsResponse.data.budgets.find(b => b.name === budgetName);
    if (budget == null) throw new Error(`Unable to find \'${budgetName}\' budget.`);
  
    return budget;
}

export async function getAccountAsync(budget_id, account_name) {
    const accountsResponse = await ynabAPI.accounts.getAccounts(budget_id)
        .catch(e => {
            console.error('Unable to get account.');
            console.error(e);
            process.exit(1);
        });;
    return getEntity(accountsResponse, 'accounts', account_name);
}

export async function createTransaction(budget_id, account_id, account_name, transactionAmount) {
    console.log(`${account_name}: Creating adjustment transaction of $${transactionAmount}.`);
    await ynabAPI.transactions.createTransaction(
        budget_id,
        {
            transaction: {
                account_id: account_id,
                date: ynab.utils.getCurrentDateInISOFormat(),
                amount: convertCurrencyToMilliUnits(transactionAmount),
                memo: "Adjustment from YNAB-Sync",
                cleared: ynab.SaveTransaction.ClearedEnum.Cleared
            }
        }
    ).catch(e => {
        console.error(e);
        process.exit(1);
    });
}

export function convertCurrencyToMilliUnits(currency) {
    return Math.round(currency * 1000);
}

export async function getCategoryGroupAsync(budget_id, category_group_name) {
    const categoriesResponse = await ynabAPI.categories.getCategories(budget_id);
    return getEntity(categoriesResponse, 'category_groups', category_group_name);
}

export async function getCategoryAsync(category_group, category_name) {
    const category = category_group.categories.find(c => c.name === category_name);
    if (category == null) throw new Error(`Unable to find \'${category_name}\' category.`);

    return category;
}

export function verifyEnvVars(env_vars) {
    for (const property in env_vars) {
        const value = env_vars[property];
        if (value === undefined || value === '') {
          console.error(`Environment variable ${property} not defined.`)
          process.exit(1);
        }
    }
}

export function getEnvVars() {
    const envVars = {
      SSN: process.env.SSN,
      ZIP_CODE: process.env.ZIP_CODE,
      SPOUSE_SSN: process.env.SPOUSE_SSN,
      SPOUSE_FIRST_NAME: process.env.SPOUSE_FIRST_NAME,
      ROUTING_NUMBER: process.env.ROUTING_NUMBER,
      ACCOUNT_NUMBER: process.env.ACCOUNT_NUMBER,
      PHONE_NUMBER: process.env.PHONE_NUMBER,
      EMAIL: process.env.EMAIL,
      STREET_ADDRESS: process.env.STREET_ADDRESS,
      CITY: process.env.CITY,
      STATE_ABBV: process.env.STATE_ABBV,
      BIRTH_YEAR: process.env.BIRTH_YEAR,
      BIRTH_MONTH: process.env.BIRTH_MONTH,
      BIRTH_DAY: process.env.BIRTH_DAY
    }
  
    verifyEnvVars(envVars)
  
    return envVars;
}

export function getYear() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // if January, get last year
    const year = currentMonth === 0 ?
        currentYear - 1 :
        currentYear;

    return year;
}

function getEntity(response, data_name, name) {
    const entity = response.data[data_name].find(a => a.name === name);
    if (entity == null)
        throw new Error(`Unable to find \'${name}\'.`);

    return entity;
}