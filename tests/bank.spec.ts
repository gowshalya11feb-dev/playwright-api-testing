import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import { BANK_URL, users } from '../helpers/testData';

test.describe('Mini Bank API', () => {

    test.use({ baseURL: BANK_URL });

  test('GET account 101 returns correct data', async ({ request }) => {
    const response = await request.get('/accounts/101');

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log(body);
    expect(body.id).toBe(101);
    expect(body.owner).toBe('Gowshi');
    expect(body.balance).toBe(5000);
  });

    test('GET account 999 returns 404', async ({ request }) => {
    const response = await request.get('/accounts/999');

    expect(response.status()).toBe(404);

    const body = await response.json();
    console.log(body);
    expect(body.error).toBe('Account not found');
  });

    test('POST deposit increases the balance', async ({ request }) => {
    // 1. Check the balance before
    const beforeResponse = await request.get('/accounts/102');
    const before = await beforeResponse.json();

    // 2. Deposit 1000
    const depositResponse = await request.post('/accounts/102/deposit', {
      data: { amount: 1000 },
    });
    expect(depositResponse.status()).toBe(200);

    // 3. Check the balance after
    const afterResponse = await request.get('/accounts/102');
    const after = await afterResponse.json();

    console.log('Before:', before.balance, 'After:', after.balance);
    expect(after.balance).toBe(before.balance + 1000);
  });


    test('POST deposit of negative amount returns 400', async ({ request }) => {
    const response = await request.post('/accounts/102/deposit', {
      data: { amount: -500 },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Amount must be a positive number');
  });

  test('POST deposit of zero returns 400', async ({ request }) => {
    const response = await request.post('/accounts/102/deposit', {
      data: { amount: 0 },
    });

    expect(response.status()).toBe(400);
  });

  test('POST deposit to a missing account returns 404', async ({ request }) => {
    const response = await request.post('/accounts/999/deposit', {
      data: { amount: 100 },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Account not found');
  });

    test('Rejected deposit does not change the balance', async ({ request }) => {
    const beforeResponse = await request.get('/accounts/102');
    const before = await beforeResponse.json();

    await request.post('/accounts/102/deposit', {
      data: { amount: -500 },
    });

    const afterResponse = await request.get('/accounts/102');
    const after = await afterResponse.json();

    expect(after.balance).toBe(before.balance);
  });


      test('POST transfer moves money between accounts', async ({ request }) => {
    const token = await loginAs(request, users.ravi.username, users.ravi.password);

    const fromBefore = await (await request.get('/accounts/102')).json();
    const toBefore = await (await request.get('/accounts/103')).json();

    const transferResponse = await request.post('/transfer', {
      data: { fromAccount: 102, toAccount: 103, amount: 500 },
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(transferResponse.status()).toBe(200);

    const fromAfter = await (await request.get('/accounts/102')).json();
    const toAfter = await (await request.get('/accounts/103')).json();

    expect(fromAfter.balance).toBe(fromBefore.balance - 500);
    expect(toAfter.balance).toBe(toBefore.balance + 500);
  });


    test('POST transfer with insufficient funds returns 400', async ({ request }) => {
    const token = await loginAs(request, users.ravi.username, users.ravi.password);

    const response = await request.post('/transfer', {
      data: { fromAccount: 102, toAccount: 103, amount: 9999999 },
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Insufficient funds');
  });

   test('POST transfer of negative amount returns 400', async ({ request }) => {
    const token = await loginAs(request, users.ravi.username, users.ravi.password);

    const response = await request.post('/transfer', {
      data: { fromAccount: 102, toAccount: 103, amount: -100 },
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Amount must be a positive number');
  });

   test('POST transfer from a missing account returns 404', async ({ request }) => {
    const token = await loginAs(request, users.ravi.username, users.ravi.password);

    const response = await request.post('/transfer', {
      data: { fromAccount: 999, toAccount: 103, amount: 100 },
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.error).toBe('Account not found');
  });

    test('Failed transfer does not change any balance', async ({ request }) => {
    const token = await loginAs(request, users.ravi.username, users.ravi.password);

    const fromBefore = await (await request.get('/accounts/102')).json();
    const toBefore = await (await request.get('/accounts/103')).json();

    await request.post('/transfer', {
      data: { fromAccount: 102, toAccount: 103, amount: 9999999 },
      headers: { Authorization: `Bearer ${token}` },
    });

    const fromAfter = await (await request.get('/accounts/102')).json();
    const toAfter = await (await request.get('/accounts/103')).json();

    expect(fromAfter.balance).toBe(fromBefore.balance);
    expect(toAfter.balance).toBe(toBefore.balance);
  });


    test('POST login with valid details returns a token', async ({ request }) => {
    const response = await request.post('/login', {
      data: { username: 'ravi', password: 'pass456' },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.token).toBeDefined();
  });

  test('POST login with wrong password returns 401', async ({ request }) => {
    const response = await request.post('/login', {
      data: { username: 'ravi', password: 'wrong' },
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Invalid username or password');
    expect(body.token).toBeUndefined();
  });

    test('POST transfer without a token returns 401', async ({ request }) => {
    const response = await request.post('/transfer', {
      data: { fromAccount: 102, toAccount: 103, amount: 100 },
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Token required');
  });

    test('POST transfer with a fake token returns 401', async ({ request }) => {
    const response = await request.post('/transfer', {
      data: { fromAccount: 102, toAccount: 103, amount: 100 },
      headers: { Authorization: 'Bearer fake-token' },
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Invalid token');
  });

    test('POST transfer from another user account returns 403', async ({ request }) => {
    const token = await loginAs(request, users.ravi.username, users.ravi.password);

    const response = await request.post('/transfer', {
      data: { fromAccount: 103, toAccount: 102, amount: 100 },
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(403);

    const body = await response.json();
    expect(body.error).toBe('You can only transfer from your own account');
  });
});