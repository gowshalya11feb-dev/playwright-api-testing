import { test, expect } from '@playwright/test';

test.describe('Protected actions', () => {

  test('DELETE booking without a token is refused', async ({ request }) => {
    const response = await request.delete('https://restful-booker.herokuapp.com/booking/1');

    console.log(response.status());
    expect(response.status()).toBe(403);
    expect(response.ok()).toBeFalsy();
  });

    test('Login, create a booking, then delete it with the token', async ({ request }) => {

    // 1. Login and get the token
    const loginResponse = await request.post('https://restful-booker.herokuapp.com/auth', {
      data: {
        username: 'admin',
        password: 'password123',
      },
    });
    expect(loginResponse.status()).toBe(200);

    const loginBody = await loginResponse.json();
    const token = loginBody.token;
    expect(token).toBeDefined();

    // 2. Create our own booking (so we delete our own data)
    const createResponse = await request.post('https://restful-booker.herokuapp.com/booking', {
      data: {
        firstname: 'Test',
        lastname: 'User',
        totalprice: 500,
        depositpaid: true,
        bookingdates: {
          checkin: '2026-11-01',
          checkout: '2026-11-05',
        },
        additionalneeds: 'Breakfast',
      },
    });
    expect(createResponse.status()).toBe(200);

    const createBody = await createResponse.json();
    const bookingId = createBody.bookingid;
    console.log('Created booking id:', bookingId);

    // 3. Delete it, sending the token in the Cookie header
    const deleteResponse = await request.delete(`https://restful-booker.herokuapp.com/booking/${bookingId}`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });
    console.log('Delete status:', deleteResponse.status());
    expect(deleteResponse.status()).toBe(201);

     const getResponse = await request.get(`https://restful-booker.herokuapp.com/booking/${bookingId}`);
    expect(getResponse.status()).toBe(404);
  });
  

});