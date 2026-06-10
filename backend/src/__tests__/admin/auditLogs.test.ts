import { getTestAgent, loginAs, authed } from '../helpers/auth';
import {
  cleanupTestData,
  seedTestData,
  TEST_ADMIN_ID,
  TEST_CIDADAO_ID,
  TEST_GESTOR_ID,
  TEST_ORGAN_ID,
} from '../helpers/seedTestData';
import { prisma } from '../../config/prisma';
import { AuditActions } from '../../services/auditLogService';

describe('Admin — GET /admin/audit-logs', () => {
  let categoryId: number;
  let routingRuleId: string;

  beforeAll(async () => {
    const seeded = await seedTestData();
    categoryId = seeded.categoryId;
  });

  beforeEach(async () => {
    await cleanupTestData();
    await prisma.audit_logs.deleteMany({});
  });

  async function seedAuditLogs() {
    const { agent, token } = await loginAs('admin@test.local', 'Admin@123456');
    const admin = authed(agent, token);

    await admin.patch(`/admin/users/${TEST_CIDADAO_ID}/deactivate`);
    await admin.patch(`/admin/users/${TEST_CIDADAO_ID}/activate`);

    await admin.patch(`/admin/users/${TEST_GESTOR_ID}/role`).send({ role: 'Cidadao' });
    await admin.patch(`/admin/users/${TEST_GESTOR_ID}/role`).send({ role: 'Gestor' });

    await admin.put(`/admin/organs/${TEST_ORGAN_ID}`).send({
      responsavel: 'Responsável Atualizado',
    });

    const ruleRes = await admin.post('/admin/routing-rules').send({
      category_id: categoryId,
      organ_id: TEST_ORGAN_ID,
      active: true,
    });
    routingRuleId = ruleRes.body.id;

    await admin.put(`/admin/routing-rules/${routingRuleId}`).send({ active: false });
  }

  it('allows admin to access paginated audit logs', async () => {
    await seedAuditLogs();
    const { agent, token } = await loginAs('admin@test.local', 'Admin@123456');
    const res = await authed(agent, token).get('/admin/audit-logs');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      data: expect.any(Array),
      total: expect.any(Number),
      page: 1,
      limit: 20,
    });
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].admin).toMatchObject({
      id: TEST_ADMIN_ID,
      email: 'admin@test.local',
    });
  });

  it('returns 403 for non-admin role', async () => {
    const { agent, token } = await loginAs('cidadao@test.local', 'Cidadao@123456');
    const res = await authed(agent, token).get('/admin/audit-logs');
    expect(res.status).toBe(403);
  });

  it('returns 401 for unauthenticated request', async () => {
    const res = await getTestAgent().get('/admin/audit-logs');
    expect(res.status).toBe(401);
  });

  it('filters by ?action=', async () => {
    await seedAuditLogs();
    const { agent, token } = await loginAs('admin@test.local', 'Admin@123456');
    const client = authed(agent, token);

    const res = await client.get('/admin/audit-logs').query({ action: AuditActions.ROLE_CHANGE });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((log: { action: string }) => log.action === AuditActions.ROLE_CHANGE)).toBe(true);
  });

  it('filters by ?admin_id=', async () => {
    await seedAuditLogs();
    const { agent, token } = await loginAs('admin@test.local', 'Admin@123456');
    const client = authed(agent, token);

    const res = await client.get('/admin/audit-logs').query({ admin_id: TEST_ADMIN_ID });

    expect(res.status).toBe(200);
    expect(res.body.data.every((log: { admin_id: string }) => log.admin_id === TEST_ADMIN_ID)).toBe(true);
  });

  it('paginates with ?page=1&limit=5', async () => {
    await seedAuditLogs();
    const { agent, token } = await loginAs('admin@test.local', 'Admin@123456');
    const client = authed(agent, token);

    const res = await client.get('/admin/audit-logs').query({ page: 1, limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body.total).toBeGreaterThanOrEqual(res.body.data.length);
  });

  it('automatically logs admin actions (role, activation, organ edit, rule edit)', async () => {
    await seedAuditLogs();

    const actions = await prisma.audit_logs.findMany({
      select: { action: true },
    });
    const actionSet = new Set(actions.map((a) => a.action));

    expect(actionSet.has(AuditActions.ROLE_CHANGE)).toBe(true);
    expect(actionSet.has(AuditActions.USER_ACTIVATED)).toBe(true);
    expect(actionSet.has(AuditActions.USER_DEACTIVATED)).toBe(true);
    expect(actionSet.has(AuditActions.ORGAN_EDITED)).toBe(true);
    expect(actionSet.has(AuditActions.ROUTING_RULE_CREATED)).toBe(true);
    expect(actionSet.has(AuditActions.ROUTING_RULE_EDITED)).toBe(true);
  });
});
