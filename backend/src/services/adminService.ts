import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorMiddleware';
import { routingRuleRepository } from '../repositories/routingRuleRepository';
import bcrypt from 'bcrypt';
import { perfil, prioridade as prioridadeEnum } from '@prisma/client';
import { auditLogService, AuditActions } from './auditLogService';

export const adminService = {
  async activateUser(userId: string, adminId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) throw new AppError(404, 'Usuário não encontrado.');

    if (usuario.perfil === perfil.Admin) {
      throw new AppError(403, 'Não é permitido ativar outro admin.');
    }

    if (usuario.status === 'Ativo') {
      throw new AppError(409, 'Usuário já está ativo.');
    }

    const updated = await prisma.usuario.update({
      where: { id: userId },
      data: { status: 'Ativo' },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        status: true,
        criadoem: true,
      },
    });

    await auditLogService.log(
      AuditActions.USER_ACTIVATED,
      'user',
      userId,
      adminId,
      { previous_status: usuario.status },
    );

    return updated;
  },

  async deactivateUser(userId: string, adminId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) throw new AppError(404, 'Usuário não encontrado.');

    if (usuario.perfil === perfil.Admin) {
      throw new AppError(403, 'Não é permitido desativar outro admin.');
    }

    if (usuario.id === adminId) {
      throw new AppError(403, 'Você não pode se desativar.');
    }

    if (usuario.status === 'Inativo') {
      throw new AppError(409, 'Usuário já está inativo.');
    }

    const updated = await prisma.usuario.update({
      where: { id: userId },
      data: { status: 'Inativo' },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        status: true,
        criadoem: true,
      },
    });

    await auditLogService.log(
      AuditActions.USER_DEACTIVATED,
      'user',
      userId,
      adminId,
      { previous_status: usuario.status },
    );

    return updated;
  },

  async listUsers(page: number, limit: number, role?: string, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (role) where.perfil = role;
    if (status) where.status = status;

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        skip,
        take: limit,
        where,
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          status: true,
          criadoem: true,
        },
        orderBy: { criadoem: 'desc' },
      }),
      prisma.usuario.count({ where }),
    ]);

    return {
      usuarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateUserRole(userId: string, role: perfil, adminId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new AppError(404, 'Usuário não encontrado.');
    }

    if (usuario.id === adminId) {
      throw new AppError(403, 'Você não pode alterar seu próprio perfil.');
    }

    if (usuario.perfil === role) {
      throw new AppError(409, 'Usuário já possui esse perfil.');
    }

    const atualizado = await prisma.usuario.update({
      where: { id: userId },
      data: { perfil: role },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        status: true,
        criadoem: true,
      },
    });

    await auditLogService.log(
      AuditActions.ROLE_CHANGE,
      'user',
      userId,
      adminId,
      { before: { perfil: usuario.perfil }, after: { perfil: role } },
    );

    return atualizado;
  },

  async createUser(
    name: string,
    email: string,
    password: string,
    role: perfil,
    adminId: string,
  ) {
    const exists = await prisma.usuario.findUnique({
      where: { email },
    });

    if (exists) {
      throw new AppError(409, 'E-mail já cadastrado.');
    }

    if (role === perfil.Admin) {
      throw new AppError(
        403,
        'Não é permitido criar usuários admin por este endpoint.'
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.usuario.create({
      data: {
        nome: name,
        email,
        senha: hashedPassword,
        perfil: role,
        status: 'Ativo',
        atualizadopor: adminId,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        status: true,
        criadoem: true,
      },
    });

    return user;
  },

  async createRoutingRule(
    categoriaId: number,
    subcategoria: string,
    orgaoprincipalId: string,
    orgaosecundarioId: string | undefined,
    slaHoras: number | undefined,
    prioridade: prioridadeEnum
  ) {
    // ========================
    // 1. VALIDAR CAMPOS OBRIGATÓRIOS E PRIORIDADE
    // ========================
    if (!categoriaId || !orgaoprincipalId) {
      throw new AppError(
        400,
        'Campos obrigatórios faltando: categoriaId e orgaoprincipalId são necessários para criar a regra.'
      );
    }

    // Validar se a prioridade está no enum válido
    if (!prioridade || !Object.keys(prioridadeEnum).includes(prioridade)) {
      throw new AppError(
        400,
        `Prioridade inválida: "${prioridade}". Deve ser um de: ${Object.keys(prioridadeEnum).join(', ')}`
      );
    }

    // ========================
    // 2. VALIDAR CATEGORIA EXISTE
    // ========================
    const categoria = await routingRuleRepository.categoriaExists(categoriaId);

    if (!categoria) {
      throw new AppError(
        404,
        `Categoria com ID ${categoriaId} não foi encontrada no sistema.`
      );
    }

    // ========================
    // 3. VALIDAR ÓRGÃO PRINCIPAL EXISTE E ESTÁ ATIVO
    // ========================
    const orgaoPrincipal = await routingRuleRepository.orgaoExists(orgaoprincipalId);

    if (!orgaoPrincipal) {
      throw new AppError(
        404,
        `Órgão principal com ID "${orgaoprincipalId}" não foi encontrado.`
      );
    }

    if (orgaoPrincipal.status !== 'Ativo') {
      throw new AppError(
        400,
        `O órgão "${orgaoPrincipal.nome}" não está ativo e não pode ser associado a regras de competência. Ative o órgão primeiro.`
      );
    }

    // ========================
    // 4. VALIDAR ÓRGÃO SECUNDÁRIO SE FORNECIDO (PODE ESTAR INATIVO)
    // ========================
    if (orgaosecundarioId) {
      const orgaoSecundario = await routingRuleRepository.orgaoExists(orgaosecundarioId);

      if (!orgaoSecundario) {
        throw new AppError(
          404,
          `Órgão secundário com ID "${orgaosecundarioId}" não foi encontrado.`
        );
      }
    }

    // ========================
    // 5. VALIDAR RELACIONAMENTO CATEGORIA-ÓRGÃO PRINCIPAL
    // ========================
    const relacionamento = await routingRuleRepository.categoriaBelongsToOrgao(
      categoriaId,
      orgaoprincipalId
    );

    if (!relacionamento) {
      throw new AppError(
        400,
        `A categoria "${categoria.nome}" não está vinculada ao órgão "${orgaoPrincipal.nome}". Vincule a categoria ao órgão antes de criar a regra.`
      );
    }

    // ========================
    // 6. VALIDAR DUPLICATA (MESMA CATEGORIA + SUBCATEGORIA)
    // ========================
    const regraExistente = await routingRuleRepository.regraExistsByCategoriaySubcategoria(
      categoriaId,
      subcategoria
    );

    if (regraExistente) {
      throw new AppError(
        409,
        `Já existe uma regra para a categoria "${categoria.nome}" com a subcategoria "${subcategoria}". Use subcategorias diferentes para a mesma categoria.`
      );
    }

    // ========================
    // 7. DETERMINAR SLA
    // ========================
    const slaParaRegra = slaHoras !== undefined ? slaHoras : orgaoPrincipal.slahoras;

    // ========================
    // 8. CRIAR REGRA
    // ========================
    const regra = await routingRuleRepository.create(
      categoriaId,
      subcategoria,
      orgaoprincipalId,
      orgaosecundarioId,
      slaParaRegra,
      prioridade
    );

    return regra;
  },

  // ========================
  // 9. LISTA REGRA
  // ========================
  async listRoutingRules(
    page: number,
    limit: number,
    organ_id?: string,
    category_id?: number
  ) {
    return routingRuleRepository.findAll(page, limit, organ_id, category_id);
  },

  // ========================
  // 10. ATUALIZA REGRA
  // ========================

  async updateRoutingRule(
    id: string,
    data: {
      categoriaId?: number;
      subcategoria?: string;
      orgaoprincipalId?: string;
      orgaosecundarioId?: string | null;
      slaHoras?: number;
      prioridade?: prioridadeEnum;
    }
  ) {
    // 1. Verifica se a regra existe
    const regraExistente = await routingRuleRepository.findById(id);
    if (!regraExistente) {
      throw new AppError(404, `Regra de competência com ID "${id}" não encontrada.`);
    }

    // Valores efetivos (merge com o que já existe)
    const categoriaId = data.categoriaId ?? regraExistente.categoriaid;
    const orgaoprincipalId = data.orgaoprincipalId ?? regraExistente.orgaoprincipalid;
    const subcategoria = data.subcategoria ?? regraExistente.subcategoria;

    // 2. Valida categoria se fornecida
    const categoria = await routingRuleRepository.categoriaExists(categoriaId);
    if (!categoria) {
      throw new AppError(404, `Categoria com ID ${categoriaId} não encontrada.`);
    }

    // 3. Valida órgão principal se fornecido
    const orgaoPrincipal = await routingRuleRepository.orgaoExists(orgaoprincipalId);
    if (!orgaoPrincipal) {
      throw new AppError(404, `Órgão principal com ID "${orgaoprincipalId}" não encontrado.`);
    }
    if (orgaoPrincipal.status !== 'Ativo') {
      throw new AppError(400, `O órgão "${orgaoPrincipal.nome}" não está ativo.`);
    }

    // 4. Valida órgão secundário se fornecido
    if (data.orgaosecundarioId) {
      const orgaoSecundario = await routingRuleRepository.orgaoExists(data.orgaosecundarioId);
      if (!orgaoSecundario) {
        throw new AppError(404, `Órgão secundário com ID "${data.orgaosecundarioId}" não encontrado.`);
      }
    }

    // 5. Valida relacionamento categoria ↔ órgão principal
    const relacionamento = await routingRuleRepository.categoriaBelongsToOrgao(
      categoriaId,
      orgaoprincipalId
    );
    if (!relacionamento) {
      throw new AppError(
        400,
        `A categoria "${categoria.nome}" não está vinculada ao órgão "${orgaoPrincipal.nome}".`
      );
    }

    // 6. Valida duplicata — ignora a própria regra
    const duplicata = await routingRuleRepository.regraExistsByCategoriaySubcategoriaExcluindo(
      categoriaId,
      subcategoria,
      id
    );
    if (duplicata) {
      throw new AppError(
        409,
        `Já existe outra regra para a categoria "${categoria.nome}" com a subcategoria "${subcategoria}".`
      );
    }

    const updateData = {
      ...(data.categoriaId !== undefined && {
        categoriaid: data.categoriaId,
      }),
      ...(data.subcategoria !== undefined && {
        subcategoria: data.subcategoria,
      }),
      ...(data.orgaoprincipalId !== undefined && {
        orgaoprincipalid: data.orgaoprincipalId,
      }),
      ...(data.orgaosecundarioId !== undefined && {
        orgaosecundarioid: data.orgaosecundarioId,
      }),
      ...(data.slaHoras !== undefined && {
        slahoras: data.slaHoras,
      }),
      ...(data.prioridade !== undefined && {
        prioridade: data.prioridade,
      }),
    };

    // 7. Atualiza
    return routingRuleRepository.update(id, updateData);
  },

  async deleteRoutingRule(id: string) {
    const regra = await routingRuleRepository.findById(id);

    if (!regra) {
      throw new AppError(
        404,
        `Regra de competência com ID "${id}" não encontrada.`
      );
    }

    await routingRuleRepository.delete(id);

    return true;
  },
};