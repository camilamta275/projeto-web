import request, { Agent } from 'supertest';
import { createApp } from '../../app';

export function getTestAgent(): Agent {
  return request(createApp());
}

export function extractToken(setCookieHeader: string): string {
  const match = setCookieHeader.match(/token=([^;]+)/);
  if (!match) throw new Error('Token cookie not found');
  return match[1];
}

export async function loginAs(email: string, senha: string) {
  const agent = getTestAgent();
  const res = await agent.post('/auth/login').send({ email, senha });

  const rawCookie = res.headers['set-cookie']?.[0];
  if (!rawCookie) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.body)}`);
  }

  const token = extractToken(rawCookie);
  return { agent, token, body: res.body };
}

export function authed(agent: Agent, token: string) {
  const cookie = `token=${token}`;
  return {
    get: (url: string) => agent.get(url).set('Cookie', cookie),
    post: (url: string) => agent.post(url).set('Cookie', cookie),
    put: (url: string) => agent.put(url).set('Cookie', cookie),
    patch: (url: string) => agent.patch(url).set('Cookie', cookie),
    delete: (url: string) => agent.delete(url).set('Cookie', cookie),
  };
}
