import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorMiddleware';

export const routingRuleRepository = {
  /**
   * Cria uma nova regra de competência
   */
  async create(
    categoriaId: number,
    subcategoria: string,
    orgaoprincipalId: string,
    orgaosecundarioId: string | undefined,
    slaHoras: number,
    prioridade: string
  ) {
    return prisma.regra_competencia.create({
      data: {
        categoriaid: categoriaId,
        subcategoria: subcategoria,
        orgaoprincipalid: orgaoprincipalId,
        orgaosecundarioid: orgaosecundarioId || null,
        slahoras: slaHoras,
        prioridade: (prioridade || 'Media') as any,
      },
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
        orgao_regra_competencia_orgaoprincipalidToorgao: {
          select: {
            id: true,
            nome: true,
            sigla: true,
          },
        },
        orgao_regra_competencia_orgaosecundarioidToorgao: {
          select: {
            id: true,
            nome: true,
            sigla: true,
          },
        },
      },
    });
  },

  /**
   * Verifica se uma categoria existe
   */
  async categoriaExists(categoriaId: number) {
    return prisma.categoria.findUnique({
      where: { id: categoriaId },
    });
  },

  /**
   * Verifica se um órgão existe
   */
  async orgaoExists(orgaoId: string) {
    return prisma.orgao.findUnique({
      where: { id: orgaoId },
    });
  },

  /**
   * Verifica se categoria e órgão estão relacionados
   */
  async categoriaBelongsToOrgao(categoriaId: number, orgaoId: string) {
    return prisma.orgao_categoria.findUnique({
      where: {
        orgaoid_categoriaid: {
          orgaoid: orgaoId,
          categoriaid: categoriaId,
        },
      },
    });
  },

  /**
   * Verifica se já existe uma regra com a mesma categoria e subcategoria
   */
  async regraExistsByCategoriaySubcategoria(
    categoriaId: number,
    subcategoria: string
  ) {
    return prisma.regra_competencia.findUnique({
      where: {
        categoriaid_subcategoria: {
          categoriaid: categoriaId,
          subcategoria: subcategoria,
        },
      },
    });
  },

  /**
   * Lista todas as regras de competência
   */
  // routingRuleRepository.ts

  async findAll(
    page: number = 1,
    limit: number = 10,
    organ_id?: string,
    category_id?: number
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (organ_id) {
      where.OR = [
        { orgaoprincipalid: organ_id },
        { orgaosecundarioid: organ_id },
      ];
    }
    if (category_id) {
      where.categoriaid = category_id;
    }

    const [regras, total] = await Promise.all([
      prisma.regra_competencia.findMany({
        skip,
        take: limit,
        where,
        include: {
          categoria: { select: { id: true, nome: true } },
          orgao_regra_competencia_orgaoprincipalidToorgao: {
            select: { id: true, nome: true, sigla: true },
          },
          orgao_regra_competencia_orgaosecundarioidToorgao: {
            select: { id: true, nome: true, sigla: true },
          },
        },
        orderBy: { criadoem: 'desc' },
      }),
      prisma.regra_competencia.count({ where }),
    ]);

    return {
      regras,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  /**
   * Busca uma regra por ID
   */
  async findById(id: string) {
    return prisma.regra_competencia.findUnique({
      where: { id },
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
        orgao_regra_competencia_orgaoprincipalidToorgao: {
          select: {
            id: true,
            nome: true,
            sigla: true,
          },
        },
        orgao_regra_competencia_orgaosecundarioidToorgao: {
          select: {
            id: true,
            nome: true,
            sigla: true,
          },
        },
      },
    });
  },

  /**
   * Atualiza uma regra de competência
   */
  async update(
    id: string,
    data: {
      categoriaid?: number;
      subcategoria?: string;
      orgaoprincipalid?: string;
      orgaosecundarioid?: string | null;
      slahoras?: number;
      prioridade?: string;
    }
  ) {
    return prisma.regra_competencia.update({
      where: { id },
      data: {
        ...data,
        prioridade: data.prioridade ? (data.prioridade as any) : undefined,
      },
      include: {
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
        orgao_regra_competencia_orgaoprincipalidToorgao: {
          select: {
            id: true,
            nome: true,
            sigla: true,
          },
        },
        orgao_regra_competencia_orgaosecundarioidToorgao: {
          select: {
            id: true,
            nome: true,
            sigla: true,
          },
        },
      },
    });
  },

  /**
   * Deleta uma regra de competência
   */
  async delete(id: string) {
    return prisma.regra_competencia.delete({
      where: { id },
    });
  },


  async regraExistsByCategoriaySubcategoriaExcluindo(
    categoriaId: number,
    subcategoria: string,
    excludeId: string
  ) {
    return prisma.regra_competencia.findFirst({
      where: {
        categoriaid: categoriaId,
        subcategoria: subcategoria,
        NOT: { id: excludeId },
      },
    });
  },
};
