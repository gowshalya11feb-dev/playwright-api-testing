import { APIRequestContext } from '@playwright/test';

export async function loginAs(
  request: APIRequestContext,
  username: string,
  password: string
): Promise<string> {
  const response = await request.post('/login', {
    data: { username, password },
  });
  const body = await response.json();
  return body.token;
}