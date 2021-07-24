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

if [ $# -ne 11 ]
  then
    echo "usage: ./run.sh <mortgage_username> <mortgage_password> <ynab_access_token> <q1> <a1> <q2> <a2> <q3> <a3> <q4> <a4>"
    exit 1
fi

# Get mortgage balance
mortgage_balance=$(node get_mortgage_balance.ts $mortgage_username $mortgage_password "$question_1" $answer_1 "$question_2" $answer_2 "$question_3" $answer_3 "$question_4" $answer_4)
if [ $? -ne 0 ]; then
  echo $mortgage_balance
  exit 1
fi

# Make adjustment
node adjust_mortgage.ts $ynab_access_token $mortgage_balance