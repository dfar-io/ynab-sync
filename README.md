![Daily Jobs](https://github.com/dfar-io/ynab-sync/actions/workflows/daily.yml/badge.svg)
![Monthly Jobs](https://github.com/dfar-io/ynab-sync/actions/workflows/monthly.yml/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/820cf2f0eae37e00b7dc/maintainability)](https://codeclimate.com/github/dfar-io/ynab-sync/maintainability)

# YNAB Sync

Collects data using [Playwright](https://playwright.dev/) and then adjusts
different accounts using the [YNAB API](https://api.youneedabudget.com/).

## Getting Started

This app is set up using
[VSCode Remote Containers](https://code.visualstudio.com/docs/remote/containers),
so build the container using the development container to get started without
needing any dependencies.

To set up environment variables, use a `.env` environment using the values
provided in `.env.example`.

You can then run any of the tasks using pre-config:

`node -r dotenv/config YOUR_JOB.js`
