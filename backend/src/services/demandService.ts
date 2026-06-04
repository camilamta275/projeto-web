import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorMiddleware';

interface UpdateDemandInput {
  id: string;
  userId: string;
  title?: string;
  description?: string;
  location?: string;
  categoryId?: number;
  latitude?: number;
  longitude?: number;
}

interface ListDemandsInput {
  userId: string;
  perfil: string;
  status?: string;
  categoria?: number;
  regiao?: string;
  page: number;
  limit: number;
}

const BLOCKED_STATUSES = ['Em_Andamento', 'Resolvido', 'Fechado'] as const;

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
  async list(input: ListDemandsInput) {
    const { userId, perfil, status, categoria, regiao, page, limit } = input;

    const where: Record<string, unknown> = {};

    if (perfil === 'Cidadao') where['cidadaoid'] = userId;
    if (status) where['status'] = status;
    if (categoria) where['categoriaid'] = categoria;
    if (regiao) where['endereco'] = { contains: regiao, mode: 'insensitive' };

    const include = {
      categoria: { select: { id: true, nome: true } },
      cidadao: {
        include: { usuario: { select: { id: true, nome: true, email: true } } },
      },
    };

    const [chamados, total] = await Promise.all([
      prisma.chamado.findMany({
        where,
        include,
        orderBy: { criadoem: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.chamado.count({ where }),
    ]);

    return {
      data: chamados.map((c) => ({
        id: c.id,
        protocolo: c.protocolo,
        title: c.subcategoria,
        description: c.descricao,
        status: c.status,
        location: c.endereco,
        latitude: Number(c.latitude),
        longitude: Number(c.longitude),
        category: c.categoria,
        creator: c.cidadao.usuario,
        createdAt: c.criadoem,
        updatedAt: c.atualizadoem,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findById(id: string, userId: string, perfil: string) {
    const chamado = await prisma.chamado.findUnique({
      where: { id },
      include: {
        categoria: { select: { id: true, nome: true } },
        cidadao: {
          include: { usuario: { select: { id: true, nome: true, email: true } } },
        },
        timeline_event: {
          orderBy: { timestamp: 'asc' },
          select: { tipo: true, titulo: true, descricao: true, autor: true, timestamp: true },
        },
      },
    });

    if (!chamado) throw new AppError(404, 'Demanda não encontrada.');

    if (perfil === 'Cidadao' && chamado.cidadaoid !== userId) {
      throw new AppError(403, 'Você não tem permissão para acessar esta demanda.');
    }

    return {
      id: chamado.id,
      protocolo: chamado.protocolo,
      title: chamado.subcategoria,
      description: chamado.descricao,
      status: chamado.status,
      location: chamado.endereco,
      latitude: Number(chamado.latitude),
      longitude: Number(chamado.longitude),
      category: chamado.categoria,
      creator: chamado.cidadao.usuario,
      createdAt: chamado.criadoem,
      updatedAt: chamado.atualizadoem,
      logs: chamado.timeline_event,
    };
  },

  async update(input: UpdateDemandInput) {
    const { id, userId, title, description, location, categoryId, latitude, longitude } = input;

    // 1. Find demand
    const chamado = await prisma.chamado.findUnique({
      where: { id },
      include: { categoria: { select: { id: true, nome: true } } },
    });
    if (!chamado) throw new AppError(404, 'Demanda não encontrada.');

    // 2. Ownership check
    if (chamado.cidadaoid !== userId) {
      throw new AppError(403, 'Você não tem permissão para editar esta demanda.');
    }

    // 3. Status check
    if ((BLOCKED_STATUSES as readonly string[]).includes(chamado.status)) {
      throw new AppError(403, `Não é possível editar uma demanda com status '${chamado.status}'.`);
    }

    // 4. If category_id provided, validate and re-resolve org/prioridade/slahoras
    let orgaoid = chamado.orgaoid;
    let prioridade = chamado.prioridade;
    let slahoras = chamado.slahoras;

    if (categoryId !== undefined) {
      const categoria = await prisma.categoria.findUnique({ where: { id: categoryId } });
      if (!categoria || !categoria.ativo) {
        throw new AppError(400, `Categoria inválida: categoria ${categoryId} não encontrada ou inativa.`);
      }

      const regra = await prisma.regra_competencia.findFirst({
        where: { categoriaid: categoryId, subcategoria: title ?? chamado.subcategoria },
      });

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
          if (!orgao) throw new AppError(500, 'Nenhum órgão responsável encontrado no sistema.');
          orgaoid = orgao.id;
          slahoras = orgao.slahoras;
        }
      }
    }

    // 5. Update chamado + log timeline_event atomically
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.chamado.update({
        where: { id },
        data: {
          ...(title !== undefined && { subcategoria: title }),
          ...(description !== undefined && { descricao: description }),
          ...(location !== undefined && { endereco: location }),
          ...(categoryId !== undefined && { categoriaid: categoryId }),
          ...(latitude !== undefined && { latitude }),
          ...(longitude !== undefined && { longitude }),
          orgaoid,
          prioridade,
          slahoras,
          atualizadoem: new Date(),
        },
        include: { categoria: { select: { id: true, nome: true } } },
      });

      const usuario = await tx.usuario.findUnique({
        where: { id: userId },
        select: { nome: true },
      });

      await tx.timeline_event.create({
        data: {
          chamadoid: id,
          tipo: 'mensagem',
          titulo: 'Demanda atualizada',
          descricao: 'Dados da demanda foram atualizados pelo cidadão.',
          autor: usuario?.nome ?? 'Cidadão',
          dadosantigos: {
            subcategoria: chamado.subcategoria,
            descricao: chamado.descricao,
            endereco: chamado.endereco,
            categoriaid: chamado.categoriaid,
          },
          dadosnovos: {
            subcategoria: title ?? chamado.subcategoria,
            descricao: description ?? chamado.descricao,
            endereco: location ?? chamado.endereco,
            categoriaid: categoryId ?? chamado.categoriaid,
          },
        },
      });

      return result;
    });

    return {
      id: updated.id,
      protocolo: updated.protocolo,
      title: updated.subcategoria,
      description: updated.descricao,
      category: updated.categoria,
      location: updated.endereco,
      latitude: Number(updated.latitude),
      longitude: Number(updated.longitude),
      status: updated.status,
      createdAt: updated.criadoem,
      updatedAt: updated.atualizadoem,
    };
  },

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
