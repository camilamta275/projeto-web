import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorMiddleware';

interface CreateDemandInput {
  title: string;
  description: string;
  categoryId: number;
  location: string;
  latitude?: number;
  longitude?: number;
  userId: string;
}

function generateProtocolo(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DEM-${date}-${rand}`;
}

export const demandService = {
  async create(input: CreateDemandInput) {
    const { title, description, categoryId, location, latitude, longitude, userId } = input;

    // 1. Validate category exists and is active
    const categoria = await prisma.categoria.findUnique({ where: { id: categoryId } });
    if (!categoria || !categoria.ativo) {
      throw new AppError(400, `Categoria inválida: categoria ${categoryId} não encontrada ou inativa.`);
    }

    // 2. Verify user has a cidadao profile
    const cidadao = await prisma.cidadao.findUnique({ where: { id: userId } });
    if (!cidadao) {
      throw new AppError(403, 'Usuário não possui perfil de cidadão para registrar demandas.');
    }

    // 3. Resolve orgaoid, prioridade, slahoras from regra_competencia or fallbacks
    const regra = await prisma.regra_competencia.findFirst({
      where: { categoriaid: categoryId, subcategoria: title },
    });

    let orgaoid: string;
    let prioridade: 'Baixa' | 'M_dia' | 'Alta' | 'Cr_tica' = 'M_dia';
    let slahoras = 48;

    if (regra) {
      orgaoid = regra.orgaoprincipalid;
      prioridade = regra.prioridade;
      slahoras = regra.slahoras;
    } else {
      const orgaoCategoria = await prisma.orgao_categoria.findFirst({
        where: { categoriaid: categoryId },
        include: { orgao: true },
      });
      if (orgaoCategoria) {
        orgaoid = orgaoCategoria.orgaoid;
        slahoras = orgaoCategoria.orgao.slahoras;
      } else {
        const orgao = await prisma.orgao.findFirst({ where: { status: 'Ativo' } });
        if (!orgao) {
          throw new AppError(500, 'Nenhum órgão responsável encontrado no sistema.');
        }
        orgaoid = orgao.id;
        slahoras = orgao.slahoras;
      }
    }

    const protocolo = generateProtocolo();
    const sladeadline = new Date(Date.now() + slahoras * 60 * 60 * 1000);

    // 4. Create chamado + timeline_event atomically
    const chamado = await prisma.$transaction(async (tx) => {
      const created = await tx.chamado.create({
        data: {
          protocolo,
          descricao: description,
          cidadaoid: userId,
          orgaoid,
          categoriaid: categoryId,
          subcategoria: title,
          endereco: location,
          latitude: latitude ?? 0,
          longitude: longitude ?? 0,
          prioridade,
          slahoras,
          sladeadline,
        },
        include: {
          categoria: { select: { id: true, nome: true } },
        },
      });

      const usuario = await tx.usuario.findUnique({
        where: { id: userId },
        select: { nome: true },
      });

      await tx.timeline_event.create({
        data: {
          chamadoid: created.id,
          tipo: 'criacao',
          titulo: 'Demanda registrada',
          descricao: 'Demanda urbana registrada pelo cidadão.',
          autor: usuario?.nome ?? 'Cidadão',
        },
      });

      return created;
    });

    return {
      id: chamado.id,
      protocolo: chamado.protocolo,
      title: chamado.subcategoria,
      description: chamado.descricao,
      category: chamado.categoria,
      location: chamado.endereco,
      latitude: Number(chamado.latitude),
      longitude: Number(chamado.longitude),
      status: chamado.status,
      createdAt: chamado.criadoem,
    };
  },
};
