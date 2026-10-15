import { test, expect } from '@playwright/test';

test.describe('Posts API', () => {

  test('GET post 1 has correct data', async ({ request }) => {
    const response = await request.get('/posts/1');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.id).toBe(1);
    expect(body.userId).toBe(1);
    expect(typeof body.title).toBe('string');
    expect(body.title.length).toBeGreaterThan(0);
  });

  test('GET all posts returns a list of 100', async ({ request }) => {
    const response = await request.get('/posts');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body).toHaveLength(100);
  });

  test('GET a post that does not exist returns 404', async ({ request }) => {
    const response = await request.get('/posts/99999');

    expect(response.status()).toBe(404);
    expect(response.ok()).toBeFalsy();
  });

});

test.describe('Comments API', () => {

  test('GET comments filtered by postId', async ({ request }) => {
    const response = await request.get('/comments', {
      params: { postId: 1 },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.length).toBeGreaterThan(0);

    for (const comment of body) {
      expect(comment.postId).toBe(1);
    }
  });

});