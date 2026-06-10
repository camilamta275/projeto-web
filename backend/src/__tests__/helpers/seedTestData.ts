import { prisma } from '../../config/prisma';
import bcrypt from 'bcryptjs';

export const TEST_ADMIN_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
export const TEST_GESTOR_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
export const TEST_CIDADAO_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
export const TEST_ORGAN_ID = 'TESTORG01';
export const TEST_CATEGORY_NAME = 'Categoria Teste E2E';

export const TEST_PASSWORDS = {
  admin: 'Admin@123456',
  gestor: 'Gestor@123456',
  cidadao: 'Cidadao@123456',
} as const;

export async function seedTestData() {
  const category = await prisma.categoria.upsert({
    where: { nome: TEST_CATEGORY_NAME },
    update: { ativo: true },
    create: {
      nome: TEST_CATEGORY_NAME,
      descricao: 'Categoria para testes automatizados',
      ativo: true,
    },
  });

  await prisma.orgao.upsert({
    where: { id: TEST_ORGAN_ID },
    update: { status: 'Ativo' },
    create: {
      id: TEST_ORGAN_ID,
      nome: 'Orgão Teste E2E',
      sigla: 'TESTORG',
      tipo: 'Municipal',
      slahoras: 48,
      responsavel: 'Responsável Teste',
      email: 'orgao@test.local',
      status: 'Ativo',
    },
  });

  await prisma.orgao_categoria.upsert({
    where: {
      orgaoid_categoriaid: {
        orgaoid: TEST_ORGAN_ID,
        categoriaid: category.id,
      },
    },
    update: {},
    create: {
      orgaoid: TEST_ORGAN_ID,
      categoriaid: category.id,
    },
  });

  const adminHash = await bcrypt.hash(TEST_PASSWORDS.admin, 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@test.local' },
    update: {
      nome: 'Admin Teste',
      senha: adminHash,
      perfil: 'Admin',
      status: 'Ativo',
    },
    create: {
      id: TEST_ADMIN_ID,
      nome: 'Admin Teste',
      email: 'admin@test.local',
      senha: adminHash,
      perfil: 'Admin',
      status: 'Ativo',
    },
  });

  await prisma.admin.upsert({
    where: { id: TEST_ADMIN_ID },
    update: {},
    create: {
      id: TEST_ADMIN_ID,
      nivel_acesso: 'total',
      ativo: true,
    },
  });

  const gestorHash = await bcrypt.hash(TEST_PASSWORDS.gestor, 10);
  await prisma.usuario.upsert({
    where: { email: 'gestor@test.local' },
    update: {
      nome: 'Gestor Teste',
      senha: gestorHash,
      perfil: 'Gestor',
      status: 'Ativo',
    },
    create: {
      id: TEST_GESTOR_ID,
      nome: 'Gestor Teste',
      email: 'gestor@test.local',
      senha: gestorHash,
      perfil: 'Gestor',
      status: 'Ativo',
    },
  });

  await prisma.gestor.upsert({
    where: { id: TEST_GESTOR_ID },
    update: { orgaoid: TEST_ORGAN_ID },
    create: {
      id: TEST_GESTOR_ID,
      orgaoid: TEST_ORGAN_ID,
      departamento: 'Testes',
    },
  });

  const cidadaoHash = await bcrypt.hash(TEST_PASSWORDS.cidadao, 10);
  await prisma.usuario.upsert({
    where: { email: 'cidadao@test.local' },
    update: {
      nome: 'Cidadão Teste',
      senha: cidadaoHash,
      perfil: 'Cidadao',
      status: 'Ativo',
    },
    create: {
      id: TEST_CIDADAO_ID,
      nome: 'Cidadão Teste',
      email: 'cidadao@test.local',
      senha: cidadaoHash,
      perfil: 'Cidadao',
      status: 'Ativo',
    },
  });

  await prisma.cidadao.upsert({
    where: { id: TEST_CIDADAO_ID },
    update: {},
    create: { id: TEST_CIDADAO_ID },
  });

  return { categoryId: category.id };
}

export async function cleanupTestData() {
  await prisma.audit_logs.deleteMany({
    where: {
      admin_id: TEST_ADMIN_ID,
    },
  });

  await prisma.routing_rules.deleteMany({
    where: { organ_id: TEST_ORGAN_ID },
  });

  await prisma.timeline_event.deleteMany({
    where: {
      chamado: {
        protocolo: { startsWith: 'DEM-TEST-' },
      },
    },
  });

  await prisma.chamado.deleteMany({
    where: { protocolo: { startsWith: 'DEM-TEST-' } },
  });

  await prisma.metrics_snapshot.deleteMany({
    where: { jobstatus: { in: ['success', 'error'] } },
  });

  await prisma.usuario.deleteMany({
    where: {
      email: { endsWith: '@register-test.local' },
    },
  });
}

export async function getCategoryId() {
  const category = await prisma.categoria.findFirst({
    where: { nome: TEST_CATEGORY_NAME },
  });
  if (!category) {
    throw new Error('Test category not found — run seedTestData() first');
  }
  return category.id;
}
