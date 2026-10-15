# Mini Bank API Test Automation

API test automation framework built with **Playwright** and **TypeScript**, testing a small banking REST API.

## What is tested

- Account lookup (found and not found)
- Deposits (valid, negative, zero, missing account)
- Transfers between accounts, including balance reconciliation
- Rejected transfers do not change any balance
- Login with valid and invalid credentials
- Security: no token (401), fake token (401), another user's account (403)

**17 automated tests** in total.

## Tech stack

- Playwright Test
- TypeScript
- Node.js and Express (the bank server being tested)

## Project structure

```
bank-server/   The mini bank API (the system under test)
helpers/       Reusable login function and test data
tests/         API test files
```

## How to run

1. Start the bank server:

```
cd bank-server
npm install
node server.js
```

2. In a second terminal, from the main project folder:

```
npm install
npx playwright test bank
```

3. View the report:

```
npx playwright show-report
```

## Key practices demonstrated

- Positive and negative test cases
- Chained API calls (login, then use the token)
- Authentication and authorization testing (401 vs 403)
- Balance checks before and after each operation
- Shared helpers and test data kept separate from test logic

## Author

Gowshalya