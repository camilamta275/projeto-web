import { prisma } from '../src/config/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { tipo_orgao, prioridade } from '@prisma/client';

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
      tipo: 'Concession_ria',
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

// IDs fixos para garantir idempotência nas re-execuções
const GESTOR_ID = '11111111-1111-1111-1111-111111111111'
const CIDADAO_ID = '22222222-2222-2222-2222-222222222222'

// =============================================================
// REGRAS DE COMPETÊNCIA
//
// Cada entrada define: categoria + subcategoria → órgão responsável
// Restrição: o órgão DEVE ter vínculo com a categoria via orgao_categoria
// Unique constraint no banco: (categoriaid, subcategoria)
// =============================================================

type RegraInput = {
  categoriaId: number;         // id da categoria
  subcategoria: string;       // granularidade da regra
  orgaoprincipalId: string;   // id do órgão (deve ter vínculo com a categoria)
  orgaosecundarioId?: string; // opcional
  slaHoras?: number;          // se omitido, herda do órgão principal
  prioridade: prioridade;
};

const REGRAS: RegraInput[] = [
  // ── INFRAESTRUTURA → EMLURB (vínculos: Infraestrutura, Saneamento Básico) ──
  {
    categoriaId: 1,
    subcategoria: 'Buraco na pista',
    orgaoprincipalId: 'EMLURB',
    prioridade: 'Alta',
    slaHoras: 48,
  },
  {
    categoriaId: 1,
    subcategoria: 'Calçada danificada',
    orgaoprincipalId: 'EMLURB',
    prioridade: 'Media',
    slaHoras: 72,
  },
  {
    categoriaId: 1,
    subcategoria: 'Buraco em calçada',
    orgaoprincipalId: 'EMLURB',
    prioridade: 'Media',
    slaHoras: 72,
  },
  {
    categoriaId: 1,
    subcategoria: 'Árvore caída bloqueando via',
    orgaoprincipalId: 'EMLURB',
    prioridade: 'Critica',
    slaHoras: 6,
  },

  // ── INFRAESTRUTURA → SINFRA (rodovias estaduais) ──
  {
    categoriaId: 1,
    subcategoria: 'Buraco em rodovia estadual',
    orgaoprincipalId: 'SINFRA',
    prioridade: 'Alta',
    slaHoras: 72,
  },
  {
    categoriaId: 1,
    subcategoria: 'Deslizamento em rodovia',
    orgaoprincipalId: 'SINFRA',
    prioridade: 'Critica',
    slaHoras: 12,
  },

  // ── INFRAESTRUTURA → SEMC (manutenção geral da cidade) ──
  {
    categoriaId: 1,
    subcategoria: 'Muro de arrimo com risco de queda',
    orgaoprincipalId: 'SEMC',
    prioridade: 'Alta',
    slaHoras: 24,
  },
  // {
  //   categoriaId: 1,
  //   subcategoria: 'Ponte ou passarela danificada',
  //   orgaoprincipalId: 'SEMC',
  //   prioridade: 'Critica',
  //   slaHoras: 12,
  // },

  // ── ÁGUA E ESGOTO → COMPESA ──
  {
    categoriaId: 2,
    subcategoria: 'Vazamento de água na rua',
    orgaoprincipalId: 'COMPESA',
    prioridade: 'Alta',
    slaHoras: 24,
  },
  {
    categoriaId: 2,
    subcategoria: 'Falta de água no bairro',
    orgaoprincipalId: 'COMPESA',
    prioridade: 'Alta',
    slaHoras: 48,
  },
  {
    categoriaId: 2,
    subcategoria: 'Esgoto a céu aberto',
    orgaoprincipalId: 'COMPESA',
    prioridade: 'Critica',
    slaHoras: 24,
  },
  // {
  //   categoriaId: 2,
  //   subcategoria: 'Bueiro entupido com esgoto',
  //   orgaoprincipalId: 'COMPESA',
  //   prioridade: 'Alta',
  //   slaHoras: 24,
  // },
  // {
  //   categoriaId: 2,
  //   subcategoria: 'Água com odor ou coloração suspeita',
  //   orgaoprincipalId: 'COMPESA',
  //   prioridade: 'Critica',
  //   slaHoras: 12,
  // },

  // ── ILUMINAÇÃO PÚBLICA → CELPE ──
  {
    categoriaId: 3,
    subcategoria: 'Poste apagado',
    orgaoprincipalId: 'CELPE',
    prioridade: 'Media',
    slaHoras: 48,
  },
  {
    categoriaId: 3,
    subcategoria: 'Poste piscando',
    orgaoprincipalId: 'CELPE',
    prioridade: 'Baixa',
    slaHoras: 72,
  },
  {
    categoriaId: 3,
    subcategoria: 'Fiação exposta com risco elétrico',
    orgaoprincipalId: 'CELPE',
    prioridade: 'Critica',
    slaHoras: 6,
  },
  {
    categoriaId: 3,
    subcategoria: 'Poste inclinado ou tombado',
    orgaoprincipalId: 'CELPE',
    prioridade: 'Alta',
    slaHoras: 12,
  },
  // {
  //   categoriaId: 3,
  //   subcategoria: 'Lâmpada queimada em praça pública',
  //   orgaoprincipalId: 'CELPE',
  //   prioridade: 'Media',
  //   slaHoras: 72,
  // },

  // ── SANEAMENTO BÁSICO → EMLURB ──
  {
    categoriaId: 4,
    subcategoria: 'Lixo não coletado',
    orgaoprincipalId: 'EMLURB',
    prioridade: 'Media',
    slaHoras: 48,
  },
  {
    categoriaId: 4,
    subcategoria: 'Entulho irregular em via pública',
    orgaoprincipalId: 'EMLURB',
    prioridade: 'Media',
    slaHoras: 72,
  },
  // {
  //   categoriaId: 4,
  //   subcategoria: 'Ponto viciado de descarte irregular',
  //   orgaoprincipalId: 'EMLURB',
  //   prioridade: 'Baixa',
  //   slaHoras: 96,
  // },
  {
    categoriaId: 4,
    subcategoria: 'Acúmulo de lixo com infestação',
    orgaoprincipalId: 'EMLURB',
    prioridade: 'Alta',
    slaHoras: 24,
  },

  // ── SINALIZAÇÃO → CTTU ──
  {
    categoriaId: 5,
    subcategoria: 'Semáforo com defeito',
    orgaoprincipalId: 'CTTU',
    prioridade: 'Alta',
    slaHoras: 12,
  },
  {
    categoriaId: 5,
    subcategoria: 'Placa de trânsito danificada ou ausente',
    orgaoprincipalId: 'CTTU',
    prioridade: 'Media',
    slaHoras: 48,
  },
  {
    categoriaId: 5,
    subcategoria: 'Faixa de pedestre apagada',
    orgaoprincipalId: 'CTTU',
    prioridade: 'Media',
    slaHoras: 72,
  },
  // {
  //   categoriaId: 5,
  //   subcategoria: 'Semáforo apagado em cruzamento movimentado',
  //   orgaoprincipalId: 'CTTU',
  //   prioridade: 'Critica',
  //   slaHoras: 6,
  // },

  // ── OUTROS PROBLEMAS → SEMC ──
  {
    categoriaId: 6,
    subcategoria: 'Pichação em bem público',
    orgaoprincipalId: 'SEMC',
    prioridade: 'Baixa',
    slaHoras: 120,
  },
  {
    categoriaId: 6,
    subcategoria: 'Mobiliário urbano danificado',
    orgaoprincipalId: 'SEMC',
    prioridade: 'Baixa',
    slaHoras: 96,
  },
  {
    categoriaId: 6,
    subcategoria: 'Abrigo de ônibus danificado',
    orgaoprincipalId: 'SEMC',
    prioridade: 'Media',
    slaHoras: 72,
  },
];

// =============================================================
// SEED
// =============================================================

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n')

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@fiscalize.gov.br'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456'
  const adminName = process.env.SEED_ADMIN_NAME || 'Administrador'

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

    const catNome = (id: number): string => {
      const found = categoriaRows.find(c => c.id === id)
      if (!found) throw new Error(`Categoria não encontrada para o id informado"`)
      return found.nome
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
    // 3. Regras de competência
    // ----------------------------------------------------------
    let regrasCriadas = 0;
    let regrasIgnoradas = 0;

    for (const regra of REGRAS) {
      const categoriaNome = catNome(regra.categoriaId);

      // Garante que o órgão tem vínculo com a categoria antes de inserir
      const vinculo = await prisma.orgao_categoria.findUnique({
        where: {
          orgaoid_categoriaid: {
            orgaoid: regra.orgaoprincipalId,
            categoriaid: regra.categoriaId,
          },
        },
      });

      if (!vinculo) {
        console.warn(
          `  ⚠ Pulando regra "${regra.subcategoria}": órgão ${regra.orgaoprincipalId} não tem vínculo com categoria "${categoriaNome}"`
        );
        regrasIgnoradas++;
        continue;
      }

      // Busca SLA do órgão como fallback
      const orgao = await prisma.orgao.findUnique({
        where: { id: regra.orgaoprincipalId },
        select: { slahoras: true },
      });

      await prisma.regra_competencia.upsert({
        where: {
          categoriaid_subcategoria: {
            categoriaid: regra.categoriaId,
            subcategoria: regra.subcategoria,
          },
        },
        update: {}, // não sobrescreve regras editadas manualmente
        create: {
          categoriaid: regra.categoriaId,
          subcategoria: regra.subcategoria,
          orgaoprincipalid: regra.orgaoprincipalId,
          orgaosecundarioid: regra.orgaosecundarioId ?? null,
          slahoras: regra.slaHoras ?? orgao?.slahoras ?? 72,
          prioridade: regra.prioridade,
        },
      });

      regrasCriadas++;
    }

    console.log(
      `✓ ${regrasCriadas} regras de competência criadas/verificadas${regrasIgnoradas > 0 ? ` (${regrasIgnoradas} ignoradas por vínculo ausente)` : ''
      }`
    );

    // ----------------------------------------------------------
    // 4. Admin
    // ----------------------------------------------------------
    const adminExistente = await prisma.usuario.findUnique({
      where: { email: adminEmail },
    })

    if (!adminExistente) {
      const senhaHash = await bcrypt.hash(adminPassword, 10)
      const adminId = uuidv4()

      const usuarioAdmin = await prisma.usuario.create({
        data: {
          id: adminId,
          nome: adminName,
          email: adminEmail,
          senha: senhaHash,
          perfil: 'Admin',
          status: 'Ativo',
        },
      })

      await prisma.admin.create({
        data: {
          id: adminId,
          nivel_acesso: 'Super Admin',
          permissao_escopo: 'Global',
          ativo: true,
        },
      })

      console.log(`✓ Admin criado: ${usuarioAdmin.email}`)
    } else {
      console.log(`✓ Admin já existe: ${adminEmail}`)
    }

    // ----------------------------------------------------------
    // 4. Gestor de teste
    // ----------------------------------------------------------
    const gestorExistente = await prisma.usuario.findUnique({
      where: { email: 'gestor@fiscalize.gov.br' },
    })

    if (!gestorExistente) {
      const senhaHash = await bcrypt.hash('Gestor@123456', 10)

      await prisma.usuario.create({
        data: {
          id: GESTOR_ID,
          nome: 'Gestor Teste',
          email: 'gestor@fiscalize.gov.br',
          senha: senhaHash,
          perfil: 'Gestor',
          status: 'Ativo',
        },
      })

      await prisma.gestor.create({
        data: {
          id: GESTOR_ID,
          orgaoid: 'EMLURB',
          departamento: 'Manutenção Urbana',
          telefone: '(81) 3355-8001',
        },
      })

      console.log(`✓ Gestor de teste criado: gestor@fiscalize.gov.br`)
    } else {
      console.log(`✓ Gestor de teste já existe`)
    }

    // ----------------------------------------------------------
    // 5. Cidadão de teste
    // ----------------------------------------------------------
    const cidadaoExistente = await prisma.usuario.findUnique({
      where: { email: 'cidadao@fiscalize.gov.br' },
    })

    if (!cidadaoExistente) {
      const senhaHash = await bcrypt.hash('Cidadao@123456', 10)

      await prisma.usuario.create({
        data: {
          id: CIDADAO_ID,
          nome: 'Cidadão Teste',
          email: 'cidadao@fiscalize.gov.br',
          senha: senhaHash,
          perfil: 'Cidadao',
          status: 'Ativo',
        },
      })

      await prisma.cidadao.create({
        data: {
          id: CIDADAO_ID,
          cpf: '00000000000',
          endereco: 'Rua do Teste, 123, Recife - PE',
        },
      })

      console.log(`✓ Cidadão de teste criado: cidadao@fiscalize.gov.br`)
    } else {
      console.log(`✓ Cidadão de teste já existe`)
    }

    // ----------------------------------------------------------
    // 6. Chamados de teste (breakdown por status)
    // ----------------------------------------------------------
    const infraId = catId('Infraestrutura')
    const deadline = (horas: number) => new Date(Date.now() + horas * 60 * 60 * 1000)

    const CHAMADOS_SAMPLE = [
      {
        protocolo: 'DEM-SEED-001',
        descricao: 'Buraco grande na pista próximo ao cruzamento.',
        status: 'Aberto' as const,
        prioridade: 'Alta' as const,
        gestorid: GESTOR_ID,
      },
      {
        protocolo: 'DEM-SEED-002',
        descricao: 'Calçada danificada causando risco de queda.',
        status: 'Aberto' as const,
        prioridade: 'Media' as const,
        gestorid: GESTOR_ID,
      },
      {
        protocolo: 'DEM-SEED-003',
        descricao: 'Pavimento desgastado em trecho de 50 metros.',
        status: 'Aberto' as const,
        prioridade: 'Baixa' as const,
        gestorid: null,
      },
      {
        protocolo: 'DEM-SEED-004',
        descricao: 'Reparo de asfalto iniciado, aguardando conclusão.',
        status: 'Em_Andamento' as const,
        prioridade: 'Alta' as const,
        gestorid: GESTOR_ID,
      },
      {
        protocolo: 'DEM-SEED-005',
        descricao: 'Substituição de meio-fio em andamento.',
        status: 'Em_Andamento' as const,
        prioridade: 'Media' as const,
        gestorid: GESTOR_ID,
      },
      {
        protocolo: 'DEM-SEED-006',
        descricao: 'Buraco tampado com sucesso.',
        status: 'Resolvido' as const,
        prioridade: 'Alta' as const,
        gestorid: GESTOR_ID,
      },
      {
        protocolo: 'DEM-SEED-007',
        descricao: 'Calçada reconstruída e liberada para uso.',
        status: 'Resolvido' as const,
        prioridade: 'Media' as const,
        gestorid: GESTOR_ID,
      },
      {
        protocolo: 'DEM-SEED-008',
        descricao: 'Demanda encerrada após vistoria sem irregularidades.',
        status: 'Fechado' as const,
        prioridade: 'Baixa' as const,
        gestorid: GESTOR_ID,
      },
    ]

    let criados = 0
    for (const chamado of CHAMADOS_SAMPLE) {
      await prisma.chamado.upsert({
        where: { protocolo: chamado.protocolo },
        update: {},
        create: {
          protocolo: chamado.protocolo,
          descricao: chamado.descricao,
          cidadaoid: CIDADAO_ID,
          gestorid: chamado.gestorid,
          orgaoid: 'EMLURB',
          categoriaid: infraId,
          subcategoria: 'Pavimentação',
          endereco: 'Av. Agamenon Magalhães, 1000, Recife - PE',
          latitude: -8.0631,
          longitude: -34.8711,
          status: chamado.status,
          prioridade: chamado.prioridade,
          slahoras: 72,
          sladeadline: deadline(72),
        },
      })
      criados++
    }
    console.log(`✓ ${criados} chamados de teste criados/verificados`)
    console.log(`  └─ Abertos: 3 (2 com gestor, 1 sem)`)
    console.log(`  └─ Em andamento: 2`)
    console.log(`  └─ Resolvidos: 2`)
    console.log(`  └─ Fechados: 1`)

    // ----------------------------------------------------------
    // 7. Timeline events para chamados resolvidos/fechados
    //    (necessário para /metrics/average-response-time)
    // ----------------------------------------------------------
    const resolucoes = [
      { protocolo: 'DEM-SEED-006', horasAteResolucao: 24 },
      { protocolo: 'DEM-SEED-007', horasAteResolucao: 48 },
      { protocolo: 'DEM-SEED-008', horasAteResolucao: 12 },
    ]

    for (const item of resolucoes) {
      const chamado = await prisma.chamado.findUnique({
        where: { protocolo: item.protocolo },
        select: { id: true, criadoem: true },
      })

      if (!chamado) continue

      const jaTemEvento = await prisma.timeline_event.findFirst({
        where: { chamadoid: chamado.id, tipo: 'status' },
      })

      if (!jaTemEvento) {
        const timestampResolucao = new Date(
          chamado.criadoem.getTime() + item.horasAteResolucao * 60 * 60 * 1000
        )

        await prisma.timeline_event.create({
          data: {
            chamadoid: chamado.id,
            tipo: 'status',
            titulo: 'Status atualizado',
            descricao: `Status alterado para ${item.protocolo === 'DEM-SEED-008' ? 'Fechado' : 'Resolvido'}`,
            autor: 'Gestor Teste',
            timestamp: timestampResolucao,
            dadosantigos: { status: 'Em_Andamento' },
            dadosnovos: { status: item.protocolo === 'DEM-SEED-008' ? 'Fechado' : 'Resolvido' },
          },
        })
      }
    }
    console.log(`✓ Timeline events criados para chamados resolvidos/fechados`)
    console.log(`  └─ DEM-SEED-006: resolvido em 24h`)
    console.log(`  └─ DEM-SEED-007: resolvido em 48h`)
    console.log(`  └─ DEM-SEED-008: encerrado em 12h`)

    console.log('\n✅ Seed completado com sucesso!')
    console.log('\n📝 Credenciais de teste:')
    console.log(`   Admin   → ${adminEmail} / ${adminPassword}`)
    console.log(`   Gestor  → gestor@fiscalize.gov.br / Gestor@123456`)
    console.log(`   Cidadão → cidadao@fiscalize.gov.br / Cidadao@123456\n`)

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seed()
