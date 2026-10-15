import { test, expect } from '@playwright/test';

test.describe('Login API', () => {

  test('POST login with valid details returns a token', async ({ request }) => {
    const response = await request.post('https://reqres.in/api/login', {
      data: {
        email: 'eve.holt@reqres.in',
        password: 'cityslicka',
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log(body);
    expect(body.token).toBeDefined();
  });

    test('POST login without password returns 400', async ({ request }) => {
    const response = await request.post('https://reqres.in/api/login', {
      data: {
        email: 'eve.holt@reqres.in',
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    console.log(body);
    expect(body.error).toBe('Missing password');
    expect(body.token).toBeUndefined();
  });

});