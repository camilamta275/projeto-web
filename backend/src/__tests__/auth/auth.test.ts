import { getTestAgent, loginAs, authed } from '../helpers/auth';
import { cleanupTestData, seedTestData } from '../helpers/seedTestData';
import { prisma } from '../../config/prisma';

describe('Auth flows', () => {
  beforeAll(async () => {
    await seedTestData();
  });

  beforeEach(async () => {
    await cleanupTestData();
  });

  describe('POST /auth/register', () => {
    it('returns 201 with user object without password hash', async () => {
      const res = await getTestAgent()
        .post('/auth/register')
        .send({
          nome: 'Novo Cidadão',
          email: 'novo@register-test.local',
          senha: 'senha123',
        });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        nome: 'Novo Cidadão',
        email: 'novo@register-test.local',
        perfil: 'Cidadao',
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.senha).toBeUndefined();
      expect(res.body.password_hash).toBeUndefined();
      expect(res.body.token).toBeUndefined();
    });

    it('returns 400 when required field is missing', async () => {
      const res = await getTestAgent()
        .post('/auth/register')
        .send({ nome: 'Sem Email', senha: 'senha123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/obrigatórios/i);
    });

    it('returns 400 for invalid email format', async () => {
      const res = await getTestAgent()
        .post('/auth/register')
        .send({ nome: 'Teste', email: 'email-invalido', senha: 'senha123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/e-mail inválido/i);
    });

    it('returns 409 for duplicate email', async () => {
      const payload = {
        nome: 'Duplicado',
        email: 'dup@register-test.local',
        senha: 'senha123',
      };

      await getTestAgent().post('/auth/register').send(payload);
      const res = await getTestAgent().post('/auth/register').send(payload);

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/e-mail já cadastrado/i);
    });

    it('assigns default role Cidadao', async () => {
      const res = await getTestAgent()
        .post('/auth/register')
        .send({
          nome: 'Role Default',
          email: 'role@register-test.local',
          senha: 'senha123',
        });

      expect(res.status).toBe(201);
      expect(res.body.perfil).toBe('Cidadao');

      const dbUser = await prisma.usuario.findUnique({
        where: { email: 'role@register-test.local' },
      });
      expect(dbUser?.perfil).toBe('Cidadao');
    });

    it('does not return token in response body', async () => {
      const res = await getTestAgent()
        .post('/auth/register')
        .send({
          nome: 'Sem Token',
          email: 'notoken@register-test.local',
          senha: 'senha123',
        });

      expect(res.status).toBe(201);
      expect(res.headers['set-cookie']).toBeUndefined();
      expect(res.body.token).toBeUndefined();
    });
  });

  describe('POST /auth/login', () => {
    it('returns 200 with user data on valid credentials', async () => {
      const res = await getTestAgent()
        .post('/auth/login')
        .send({ email: 'cidadao@test.local', senha: 'Cidadao@123456' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        email: 'cidadao@test.local',
        perfil: 'Cidadao',
      });
      expect(res.body.token).toBeUndefined();
    });

    it('sets token as HttpOnly cookie, not in body', async () => {
      const res = await getTestAgent()
        .post('/auth/login')
        .send({ email: 'cidadao@test.local', senha: 'Cidadao@123456' });

      const cookie = res.headers['set-cookie']?.[0];
      expect(cookie).toBeDefined();
      expect(cookie).toMatch(/token=/);
      expect(cookie).toMatch(/HttpOnly/i);
      expect(res.body.token).toBeUndefined();
    });

    it('returns 401 with generic message for wrong password', async () => {
      const res = await getTestAgent()
        .post('/auth/login')
        .send({ email: 'cidadao@test.local', senha: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Credenciais inválidas.');
    });

    it('returns same 401 generic message for non-existent email', async () => {
      const res = await getTestAgent()
        .post('/auth/login')
        .send({ email: 'naoexiste@test.local', senha: 'qualquer' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Credenciais inválidas.');
    });

    it('never reveals whether email or password was wrong', async () => {
      const wrongPassword = await getTestAgent()
        .post('/auth/login')
        .send({ email: 'cidadao@test.local', senha: 'wrong' });

      const wrongEmail = await getTestAgent()
        .post('/auth/login')
        .send({ email: 'missing@test.local', senha: 'wrong' });

      expect(wrongPassword.body.error).toBe(wrongEmail.body.error);
      expect(wrongPassword.body.error.toLowerCase()).not.toMatch(/senha|email|e-mail/);
    });
  });

  describe('POST /auth/logout', () => {
    it('returns 200 and clears session cookie for authenticated user', async () => {
      const { agent, token } = await loginAs('cidadao@test.local', 'Cidadao@123456');

      const res = await authed(agent, token).post('/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/logout/i);

      const clearedCookie = res.headers['set-cookie']?.[0] ?? '';
      expect(clearedCookie).toMatch(/token=/);
    });

    it('returns 401 for unauthenticated request', async () => {
      const res = await getTestAgent().post('/auth/logout');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    it('returns authenticated user data without password hash', async () => {
      const { agent, token } = await loginAs('cidadao@test.local', 'Cidadao@123456');
      const res = await authed(agent, token).get('/auth/me');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        nome: 'Cidadão Teste',
        email: 'cidadao@test.local',
        perfil: 'Cidadao',
        status: 'Ativo',
      });
      expect(res.body.criadoem).toBeDefined();
      expect(res.body.senha).toBeUndefined();
      expect(res.body.password_hash).toBeUndefined();
    });

    it('returns 401 for missing token', async () => {
      const res = await getTestAgent().get('/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 for invalid token', async () => {
      const res = await getTestAgent()
        .get('/auth/me')
        .set('Cookie', 'token=invalid.token.value');

      expect(res.status).toBe(401);
    });
  });
});
