#!/bin/bash

mortgage_username=$1
mortgage_password=$2
ynab_access_token=$3


if [ $# -ne 3 ]
  then
    echo "usage: ./run.sh <mortgage_username> <mortgage_password> <ynab_access_token>"
    exit 1
fi

# Get mortgage balance
mortgage_balance=$(node get_mortgage_balance.ts $1 $2)
if [ $? -ne 0 ]; then
  echo $mortgage_balance
  exit 1
fi

# Make adjustment
node adjust_mortgage.ts $ynab_access_token $mortgage_balance