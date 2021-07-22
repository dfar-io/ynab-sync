#!/bin/bash

mortgage_username=$1
mortgage_password=$2

if [ $# -ne 2 ]
  then
    echo "usage: ./run.sh <mortgage_username> <mortgage_password>"
    exit 1
fi


mortgage_balance=$(node get_mortgage_balance.ts $1 $2)
echo $mortgage_balance

if [ $? -ne 0 ]; then
  exit 1
fi