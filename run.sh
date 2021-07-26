#!/bin/bash

mortgage_username=$1
mortgage_password=$2
ynab_access_token=$3
question_1=$4
answer_1=$5
question_2=$6
answer_2=$7
question_3=$8
answer_3=$9
question_4=${10}
answer_4=${11}
car_api_key=${12}
vin1=${13}
vin2=${14}

if [ $# -ne 14 ]
  then
    echo "usage: ./run.sh <mortgage_username> <mortgage_password> <ynab_access_token> <q1> <a1> <q2> <a2> <q3> <a3> <q4> <a4> <car_api_key> <vin1> <vin2>"
    exit 1
fi

# Get mortgage balance
mortgage_balance=$(node get_mortgage_balance.ts $mortgage_username $mortgage_password "$question_1" $answer_1 "$question_2" $answer_2 "$question_3" $answer_3 "$question_4" $answer_4)
if [ $? -ne 0 ]; then
  echo $mortgage_balance
  exit 1
fi

car1_value=$(node get_car_value.ts $car_api_key $vin1)
if [ $? -ne 0 ]; then
  echo $car1_value
  exit 1
fi

car2_value=$(node get_car_value.ts $car_api_key $vin2)
if [ $? -ne 0 ]; then
  echo $car2_value
  exit 1
fi

# Make adjustments
node adjust_ynab_account.ts $ynab_access_token Mortgage $mortgage_balance
node adjust_ynab_account.ts $ynab_access_token CX-3 $car1_value
node adjust_ynab_account.ts $ynab_access_token Stelvio $car2_value