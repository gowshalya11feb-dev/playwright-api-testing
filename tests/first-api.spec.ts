import { test, expect } from '@playwright/test';

test('GET a single post', async ({ request }) => {
  const response = await request.get('/posts/1')

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.id).toBe(1);
  expect(body).toHaveProperty('title');
});


test('POST create a new post', async ({ request }) => {
  const response = await request.post('/posts', {
    data: {
      title: 'My first API test',
      body: 'Learning Playwright',
      userId: 1,
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body.title).toBe('My first API test');
  expect(body.id).toBeDefined();
});


test('GET a post that does not exist', async ({ request }) => {
  const response = await request.get('/posts/99999');
  expect(response.status()).toBe(404);
});