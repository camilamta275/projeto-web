import { getTestAgent, loginAs, authed } from '../helpers/auth';
import {
  cleanupTestData,
  getCategoryId,
  seedTestData,
  TEST_ORGAN_ID,
} from '../helpers/seedTestData';
import { prisma } from '../../config/prisma';

describe('Demands — POST /demands', () => {
  let categoryId: number;

  beforeAll(async () => {
    const seeded = await seedTestData();
    categoryId = seeded.categoryId;
  });

  beforeEach(async () => {
    await cleanupTestData();
  });

  it('allows authenticated citizen to create demand — returns 201', async () => {
    const { agent, token } = await loginAs('cidadao@test.local', 'Cidadao@123456');
    const client = authed(agent, token);

    const res = await client.post('/demands').send({
      title: 'Buraco na rua',
      description: 'Buraco grande próximo ao cruzamento',
      category_id: categoryId,
      location: 'Rua Teste, 100',
      latitude: -8.05,
      longitude: -34.87,
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Buraco na rua',
      description: 'Buraco grande próximo ao cruzamento',
      location: 'Rua Teste, 100',
      status: 'Aberto',
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.protocolo).toMatch(/^DEM-/);
  });

  it('auto-assigns organ_id when active routing rule exists', async () => {
    const { agent: adminAgent, token: adminToken } = await loginAs('admin@test.local', 'Admin@123456');
    const admin = authed(adminAgent, adminToken);

    await admin.post('/admin/routing-rules').send({
      category_id: categoryId,
      organ_id: TEST_ORGAN_ID,
      active: true,
    });

    const { agent, token } = await loginAs('cidadao@test.local', 'Cidadao@123456');
    const client = authed(agent, token);

    const res = await client.post('/demands').send({
      title: 'Com regra de roteamento',
      description: 'Deve receber orgao automaticamente',
      category_id: categoryId,
      location: 'Av. Roteamento, 1',
    });

    expect(res.status).toBe(201);

    const chamado = await prisma.chamado.findUnique({
      where: { id: res.body.id },
      select: { orgaoid: true },
    });
    expect(chamado?.orgaoid).toBe(TEST_ORGAN_ID);
  });

  it('creates demand with organ_id null when no routing rule exists', async () => {
    await prisma.routing_rules.deleteMany({ where: { category_id: categoryId } });

    const { agent, token } = await loginAs('cidadao@test.local', 'Cidadao@123456');
    const client = authed(agent, token);

    const res = await client.post('/demands').send({
      title: 'Sem regra',
      description: 'Sem orgao atribuido',
      category_id: categoryId,
      location: 'Av. Sem Regra, 2',
    });

    expect(res.status).toBe(201);

    const chamado = await prisma.chamado.findUnique({
      where: { id: res.body.id },
      select: { orgaoid: true },
    });
    expect(chamado?.orgaoid).toBeNull();
  });

  it('returns 401 for unauthenticated request', async () => {
    const res = await getTestAgent().post('/demands').send({
      title: 'Anônimo',
      description: 'Sem auth',
      category_id: categoryId,
      location: 'Rua X',
    });

    expect(res.status).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const { agent, token } = await loginAs('cidadao@test.local', 'Cidadao@123456');
    const client = authed(agent, token);

    const res = await client.post('/demands').send({
      title: 'Incompleto',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/obrigatórios/i);
  });
});

describe('Routing rules — resolveOrgan behavior', () => {
  let categoryId: number;

  beforeAll(async () => {
    const seeded = await seedTestData();
    categoryId = seeded.categoryId;
  });

  beforeEach(async () => {
    await cleanupTestData();
  });

  it('assigns correct organ when active rule exists for category', async () => {
    const { agent: adminAgent, token: adminToken } = await loginAs('admin@test.local', 'Admin@123456');
    await authed(adminAgent, adminToken)
      .post('/admin/routing-rules')
      .send({ category_id: categoryId, organ_id: TEST_ORGAN_ID, active: true });

    const { agent, token } = await loginAs('cidadao@test.local', 'Cidadao@123456');
    const res = await authed(agent, token).post('/demands').send({
      title: 'Roteamento',
      description: 'Teste resolveOrgan',
      category_id: categoryId,
      location: 'Local',
    });

    const chamado = await prisma.chamado.findUnique({
      where: { id: res.body.id },
      select: { orgaoid: true },
    });
    expect(chamado?.orgaoid).toBe(TEST_ORGAN_ID);
  });

  it('leaves organ null when no active rule exists', async () => {
    await prisma.routing_rules.deleteMany({ where: { category_id: categoryId } });

    const { agent, token } = await loginAs('cidadao@test.local', 'Cidadao@123456');
    const res = await authed(agent, token).post('/demands').send({
      title: 'Sem rota',
      description: 'Sem regra ativa',
      category_id: categoryId,
      location: 'Local',
    });

    const chamado = await prisma.chamado.findUnique({
      where: { id: res.body.id },
      select: { orgaoid: true },
    });
    expect(chamado?.orgaoid).toBeNull();
  });

  it('does not fail demand creation when resolveOrgan returns null', async () => {
    await prisma.routing_rules.deleteMany({ where: { category_id: categoryId } });

    const { agent, token } = await loginAs('cidadao@test.local', 'Cidadao@123456');
    const res = await authed(agent, token).post('/demands').send({
      title: 'Criação ok',
      description: 'Mesmo sem orgao',
      category_id: await getCategoryId(),
      location: 'Local',
    });

    expect(res.status).toBe(201);
  });
});
