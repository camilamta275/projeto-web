import { prisma } from '../src/config/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { tipo_orgao } from '@prisma/client';

// =============================================================
// DADOS DE SEED
// =============================================================

const CATEGORIAS = [
  { nome: 'Infraestrutura', descricao: 'Buracos, pavimentação, calçadas danificadas' },
  { nome: 'Água e Esgoto', descricao: 'Vazamentos, falta de água, esgoto a céu aberto' },
  { nome: 'Iluminação Pública', descricao: 'Postes apagados, fiação exposta, lâmpadas queimadas' },
  { nome: 'Saneamento Básico', descricao: 'Coleta de lixo, entulho, descarte irregular' },
  { nome: 'Sinalização', descricao: 'Placas faltando, semáforos com defeito, faixas apagadas' },
  { nome: 'Outros Problemas', descricao: 'Outros problemas urbanos não listados acima' },
]

// Corrigido: usando o enum tipo_orgao do Prisma
// "Concessionária" no Prisma vira "Concession_ria" por causa do acento
const ORGAOS: {
  id: string
  nome: string
  sigla: string
  tipo: tipo_orgao
  slahoras: number
  responsavel: string
  email: string
  telefone: string
  categorias: string[]
}[] = [
    {
      id: 'EMLURB',
      nome: 'Empresa de Manutenção e Limpeza Urbana do Recife',
      sigla: 'EMLURB',
      tipo: 'Municipal',
      slahoras: 72,
      responsavel: 'Diretoria de Operações',
      email: 'atendimento@emlurb.recife.pe.gov.br',
      telefone: '(81) 3355-8000',
      categorias: ['Infraestrutura', 'Saneamento Básico'],
    },
    {
      id: 'COMPESA',
      nome: 'Companhia Pernambucana de Saneamento',
      sigla: 'COMPESA',
      tipo: 'Estadual',
      slahoras: 48,
      responsavel: 'Ouvidoria COMPESA',
      email: 'ouvidoria@compesa.com.br',
      telefone: '0800 081 0195',
      categorias: ['Água e Esgoto'],
    },
    {
      id: 'CELPE',
      nome: 'Companhia Energética de Pernambuco',
      sigla: 'CELPE',
      tipo: 'Concession_ria', // enum gerado pelo Prisma para "Concessionária"
      slahoras: 24,
      responsavel: 'Central de Atendimento CELPE',
      email: 'atendimento@celpe.com.br',
      telefone: '0800 081 0196',
      categorias: ['Iluminação Pública'],
    },
    {
      id: 'CTTU',
      nome: 'Autarquia de Trânsito e Transporte Urbano do Recife',
      sigla: 'CTTU',
      tipo: 'Municipal',
      slahoras: 48,
      responsavel: 'Diretoria de Engenharia de Tráfego',
      email: 'atendimento@cttu.recife.pe.gov.br',
      telefone: '(81) 3182-5800',
      categorias: ['Sinalização'],
    },
    {
      id: 'SINFRA',
      nome: 'Secretaria de Infraestrutura e Recursos Hídricos de Pernambuco',
      sigla: 'SINFRA',
      tipo: 'Estadual',
      slahoras: 96,
      responsavel: 'Gabinete da Secretaria',
      email: 'contato@sinfra.pe.gov.br',
      telefone: '(81) 3183-3000',
      categorias: ['Infraestrutura'],
    },
    {
      id: 'SEMC',
      nome: 'Secretaria Executiva de Manutenção da Cidade do Recife',
      sigla: 'SEMC',
      tipo: 'Municipal',
      slahoras: 72,
      responsavel: 'Coordenadoria de Manutenção',
      email: 'manutencao@semc.recife.pe.gov.br',
      telefone: '(81) 3355-9000',
      categorias: ['Infraestrutura', 'Outros Problemas'],
    },
  ]

// =============================================================
// SEED
// =============================================================

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Variáveis de ambiente para criar admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@fiscalize.gov.br';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.SEED_ADMIN_NAME || 'Administrador';

  try {

    // ----------------------------------------------------------
    // 1. Categorias
    // ----------------------------------------------------------
    for (const cat of CATEGORIAS) {
      await prisma.categoria.upsert({
        where: { nome: cat.nome },
        update: {},
        create: { nome: cat.nome, descricao: cat.descricao, ativo: true },
      })
    }
    console.log(`✓ ${CATEGORIAS.length} categorias criadas/verificadas`)

    const categoriaRows = await prisma.categoria.findMany({
      select: { id: true, nome: true },
    })
    const catId = (nome: string): number => {
      const found = categoriaRows.find((c: any) => c.nome === nome)
      if (!found) throw new Error(`Categoria não encontrada: "${nome}"`)
      return found.id
    }

    // ----------------------------------------------------------
    // 2. Órgãos + vínculos com categorias
    // ----------------------------------------------------------
    for (const orgao of ORGAOS) {
      const { categorias, ...orgaoData } = orgao

      await prisma.orgao.upsert({
        where: { id: orgaoData.id },
        update: {},
        create: { ...orgaoData, status: 'Ativo' },
      })

      // Corrigido: orgao_categoria (snake_case) em vez de orgaoCategoria
      await prisma.orgao_categoria.createMany({
        data: categorias.map(nome => ({
          orgaoid: orgaoData.id,
          categoriaid: catId(nome),
        })),
        skipDuplicates: true,
      })
    }
    console.log(`✓ ${ORGAOS.length} órgãos criados/verificados com seus vínculos de categoria`)

    // ----------------------------------------------------------
    // 3. Admin
    // ----------------------------------------------------------
    const adminExistente = await prisma.usuario.findUnique({
      where: { email: adminEmail },
    });

    if (adminExistente) {
      console.log(`✓ Admin já existe: ${adminEmail}`)
      return
    }

    // 2. Hash da senha
    const senhaHash = await bcrypt.hash(adminPassword, 10);

    // 3. Gerar UUID para o usuário
    const adminId = uuidv4();

    // 4. Criar usuário admin
    const usuarioAdmin = await prisma.usuario.create({
      data: {
        id: adminId,
        nome: adminName,
        email: adminEmail,
        senha: senhaHash,
        perfil: 'Admin',
        status: 'Ativo',
      },
    });

    console.log(`✓ Usuário Admin criado com sucesso!`);
    console.log(`  └─ ID: ${usuarioAdmin.id}`);
    console.log(`  └─ Email: ${usuarioAdmin.email}`);
    console.log(`  └─ Perfil: ${usuarioAdmin.perfil}`);

    // 5. Criar registro na tabela admin
    const adminRecord = await prisma.admin.create({
      data: {
        id: adminId,
        nivel_acesso: 'Super Admin',
        permissao_escopo: 'Global',
        ativo: true,
      },
    });

    console.log(`✓ Registro Admin criado com sucesso!`);
    console.log(`  └─ Nível: ${adminRecord.nivel_acesso}`);
    console.log(`  └─ Escopo: ${adminRecord.permissao_escopo}\n`);

    console.log('✅ Seed completado com sucesso!');
    console.log('\n📝 Credenciais de teste:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminPassword}\n`);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
