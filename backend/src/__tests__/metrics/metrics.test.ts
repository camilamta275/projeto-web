import { getTestAgent, loginAs, authed } from '../helpers/auth';
import { cleanupTestData, seedTestData } from '../helpers/seedTestData';
import { metricsRepository } from '../../repositories/metricsRepository';
import * as cacheUtils from '../../utils/cache';

const memoryStore = new Map<string, string>();

jest.mock('../../config/redis', () => ({
  getRedisClient: () => ({
    get: async (key: string) => memoryStore.get(key) ?? null,
    set: async (key: string, value: string) => {
      memoryStore.set(key, value);
      return 'OK';
    },
    del: async (...keys: string[]) => {
      keys.forEach((key) => memoryStore.delete(key));
      return keys.length;
    },
    ping: async () => 'PONG',
    connect: async () => undefined,
    on: () => undefined,
  }),
  isRedisAvailable: async () => true,
}));

describe('Metrics & cache', () => {
  beforeAll(async () => {
    await seedTestData();
  });

  beforeEach(async () => {
    memoryStore.clear();
    await cleanupTestData();
    jest.restoreAllMocks();
  });

  it('returns metrics in expected shape', async () => {
    const { agent, token } = await loginAs('gestor@test.local', 'Gestor@123456');
    const res = await authed(agent, token).get('/metrics/total-demands');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      escopo: 'gestor',
      total: expect.any(Number),
      aberta: expect.any(Number),
      em_andamento: expect.any(Number),
      resolvida: expect.any(Number),
      encerrada: expect.any(Number),
    });
  });

  it('serves second request from cache (repository called once)', async () => {
    const countSpy = jest.spyOn(metricsRepository, 'countByScope');
    const { agent, token } = await loginAs('gestor@test.local', 'Gestor@123456');
    const client = authed(agent, token);

    await client.get('/metrics/total-demands');
    await client.get('/metrics/total-demands');

    expect(countSpy).toHaveBeenCalledTimes(1);
  });

  it('invalidates cache after new demand is created', async () => {
    const countSpy = jest.spyOn(metricsRepository, 'countByScope');
    const { agent: adminAgent, token: adminToken } = await loginAs('admin@test.local', 'Admin@123456');
    const admin = authed(adminAgent, adminToken);

    await admin.get('/metrics/total-demands');
    expect(countSpy).toHaveBeenCalledTimes(1);

    const { agent: cidadaoAgent, token: cidadaoToken } = await loginAs('cidadao@test.local', 'Cidadao@123456');
    const categoryId = (await seedTestData()).categoryId;

    await authed(cidadaoAgent, cidadaoToken).post('/demands').send({
      title: 'Nova demanda cache',
      description: 'Invalida cache de metricas da plataforma',
      category_id: categoryId,
      location: 'Rua Cache, 1',
    });

    await admin.get('/metrics/total-demands');
    expect(countSpy).toHaveBeenCalledTimes(2);
  });

  it('falls back to DB when Redis is unavailable', async () => {
    jest.spyOn(cacheUtils, 'getCache').mockResolvedValue(null);
    jest.spyOn(cacheUtils, 'setCache').mockResolvedValue(undefined);

    const { agent, token } = await loginAs('gestor@test.local', 'Gestor@123456');
    const res = await authed(agent, token).get('/metrics/demands-by-category');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(expect.any(Array));
  });
});

describe('Metrics & cache — platform scope', () => {
  beforeAll(async () => {
    await seedTestData();
  });

  it('admin receives platform-scoped metrics', async () => {
    const { agent, token } = await loginAs('admin@test.local', 'Admin@123456');
    const res = await authed(agent, token).get('/metrics/average-response-time');

    expect(res.status).toBe(200);
    expect(res.body.escopo).toBe('plataforma');
    expect(res.body).toHaveProperty('media_horas');
    expect(res.body).toHaveProperty('total_demandas_consideradas');
  });
});
