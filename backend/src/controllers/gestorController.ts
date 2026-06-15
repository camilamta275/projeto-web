import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorMiddleware';
import { status_chamado } from '@prisma/client';
import { prisma } from '../config/prisma';
import { invalidateMetricsCache } from '../utils/cache';

const STATUS_DISPLAY: Record<status_chamado, string> = {
  Aberto: 'Aberto',
  Em_An_lise: 'Em Análise',
  Em_Andamento: 'Em Andamento',
  Aguardando: 'Aguardando',
  Resolvido: 'Resolvido',
  Fechado: 'Fechado',
};

function displayStatus(s: status_chamado): string {
  return STATUS_DISPLAY[s] ?? s;
}

export const gestorController = {
  // GET /gestor/dashboard - Estatísticas do gestor
  async dashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const gestorId = req.user?.id;
      if (!gestorId) throw new AppError(401, 'Usuário não autenticado.');

      const gestor = await prisma.gestor.findUnique({
        where: { id: gestorId },
        select: {
          id: true,
          departamento: true,
          orgaoid: true,
          usuario: { select: { nome: true, email: true } },
          orgao:   { select: { nome: true } },
        },
      });
      if (!gestor) throw new AppError(404, 'Gestor não encontrado.');

      const orgaoid = gestor.orgaoid;

      const [totalChamados, chamadosAbertos, chamadosEmProgresso, chamadosEncerrados] =
        await Promise.all([
          prisma.chamado.count({ where: { orgaoid } }),
          prisma.chamado.count({ where: { orgaoid, status: 'Aberto' } }),
          prisma.chamado.count({ where: { orgaoid, status: status_chamado.Em_Andamento } }),
          prisma.chamado.count({ where: { orgaoid, status: { in: ['Resolvido', 'Fechado'] } } }),
        ]);

      res.status(200).json({
        gestor: {
          id: gestor.id,
          nome: gestor.usuario.nome,
          email: gestor.usuario.email,
          departamento: gestor.departamento,
          orgao: gestor.orgao.nome,
        },
        chamados: {
          total: totalChamados,
          abertos: chamadosAbertos,
          emProgresso: chamadosEmProgresso,
          encerrados: chamadosEncerrados,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /gestor/chamados - Fila de chamados do órgão do gestor
  async listarChamados(req: Request, res: Response, next: NextFunction) {
    try {
      const gestorId = req.user?.id;
      if (!gestorId) throw new AppError(401, 'Usuário não autenticado.');

      const { status, limit = 100, offset = 0 } = req.query;

      const gestor = await prisma.gestor.findUnique({
        where: { id: gestorId },
        select: { orgaoid: true },
      });
      if (!gestor) throw new AppError(404, 'Gestor não encontrado.');

      const whereClause: Record<string, unknown> = { orgaoid: gestor.orgaoid };

      if (status && status !== 'Todos') {
        whereClause['status'] = status as status_chamado;
      }

      const [chamados, total] = await Promise.all([
        prisma.chamado.findMany({
          where: whereClause,
          select: {
            id: true,
            protocolo: true,
            descricao: true,
            status: true,
            prioridade: true,
            endereco: true,
            latitude: true,
            longitude: true,
            slahoras: true,
            sladeadline: true,
            criadoem: true,
            gestorid: true,
            categoria: { select: { id: true, nome: true } },
          },
          orderBy: { sladeadline: 'asc' },
          take: Number(limit),
          skip: Number(offset),
        }),
        prisma.chamado.count({ where: whereClause }),
      ]);

      res.status(200).json({
        chamados: chamados.map((c) => ({
          id: c.id,
          protocolo: c.protocolo,
          descricao: c.descricao,
          status: displayStatus(c.status),
          prioridade: c.prioridade,
          endereco: c.endereco,
          latitude: Number(c.latitude),
          longitude: Number(c.longitude),
          slaHoras: c.slahoras,
          slaDeadline: c.sladeadline,
          criadoEm: c.criadoem,
          gestorid: c.gestorid,
          categoria: c.categoria,
        })),
        pagina: { total, limit: Number(limit), offset: Number(offset) },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /gestor/chamados/:id - Detalhes de um chamado
  async detalharChamado(req: Request, res: Response, next: NextFunction) {
    try {
      const gestorId = req.user?.id;
      const id = req.params.id as string;

      if (!gestorId) throw new AppError(401, 'Usuário não autenticado.');

      const gestor = await prisma.gestor.findUnique({
        where: { id: gestorId },
        select: { orgaoid: true },
      });
      if (!gestor) throw new AppError(404, 'Gestor não encontrado.');

      const c = await prisma.chamado.findUnique({
        where: { id },
        select: {
          id: true,
          protocolo: true,
          subcategoria: true,
          descricao: true,
          status: true,
          prioridade: true,
          endereco: true,
          slahoras: true,
          sladeadline: true,
          criadoem: true,
          orgaoid: true,
          categoria: { select: { nome: true } },
          orgao: { select: { nome: true } },
          cidadao: { include: { usuario: { select: { nome: true } } } },
          timeline_event: {
            orderBy: { timestamp: 'asc' },
            select: { id: true, tipo: true, titulo: true, descricao: true, autor: true, timestamp: true },
          },
        },
      });

      if (!c) throw new AppError(404, 'Chamado não encontrado.');

      // Gestor só pode ver chamados do seu próprio órgão
      const usuarioGestor = await prisma.usuario.findUnique({ where: { id: gestorId } });
      if (usuarioGestor?.perfil === 'Gestor' && c.orgaoid !== gestor.orgaoid) {
        throw new AppError(403, 'Você não tem permissão para visualizar este chamado.');
      }

      res.status(200).json({
        chamado: {
          id: c.id,
          protocolo: c.protocolo,
          subcategoria: c.subcategoria,
          descricao: c.descricao,
          status: displayStatus(c.status),
          prioridade: c.prioridade,
          endereco: c.endereco,
          slaHoras: c.slahoras,
          slaDeadline: c.sladeadline,
          criadoEm: c.criadoem,
          categoria: c.categoria?.nome ?? '',
          orgao: c.orgao?.nome ?? '',
          cidadaoNome: c.cidadao?.usuario?.nome ?? '',
          timeline: c.timeline_event.map((e) => ({
            id: e.id,
            tipo: e.tipo,
            titulo: e.titulo,
            descricao: e.descricao,
            autor: e.autor,
            timestamp: e.timestamp,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /gestor/chamados/:id/status - Atualizar status de um chamado
  async atualizarStatusChamado(req: Request, res: Response, next: NextFunction) {
    try {
      const gestorId = req.user?.id;
      const id = req.params.id as string;
      const { status, justificativa, resolutionNote } = req.body;

      if (!gestorId) throw new AppError(401, 'Usuário não autenticado.');
      if (!status)   throw new AppError(400, 'Status é obrigatório.');

      const statusValidos = ['Aberto', 'Em Análise', 'Em Andamento', 'Aguardando', 'Resolvido', 'Fechado'];
      if (!statusValidos.includes(status)) {
        throw new AppError(400, `Status inválido. Valores aceitos: ${statusValidos.join(', ')}`);
      }

      const gestor = await prisma.gestor.findUnique({ where: { id: gestorId }, select: { orgaoid: true } });
      if (!gestor) throw new AppError(404, 'Gestor não encontrado.');

      const chamado = await prisma.chamado.findUnique({ where: { id } });
      if (!chamado) throw new AppError(404, 'Chamado não encontrado.');

      const usuarioGestor = await prisma.usuario.findUnique({ where: { id: gestorId }, select: { perfil: true, nome: true } });
      if (usuarioGestor?.perfil === 'Gestor' && chamado.orgaoid !== gestor.orgaoid) {
        throw new AppError(403, 'Você não tem permissão para atualizar este chamado.');
      }

      const oldStatus = chamado.status;

      const updated = await prisma.$transaction(async (tx) => {
        const result = await tx.chamado.update({
          where: { id },
          data: {
            status: status as status_chamado,
            atualizadoem: new Date(),
            ...(justificativa  ? { slajustification: String(justificativa) }  : {}),
            ...(resolutionNote ? { resolutionnote:   String(resolutionNote) } : {}),
          },
          select: { id: true, protocolo: true, status: true, atualizadoem: true },
        });

        const descricao = resolutionNote
          ? `Chamado concluído. ${resolutionNote}`
          : justificativa
            ? `Status alterado para ${status}. Motivo: ${justificativa}`
            : `Status alterado de ${oldStatus} para ${status}`;

        await tx.timeline_event.create({
          data: {
            chamadoid: id,
            tipo: 'status',
            titulo: 'Status atualizado',
            descricao,
            autor: usuarioGestor?.nome ?? gestorId,
            dadosantigos: { status: oldStatus },
            dadosnovos: { status },
          },
        });

        return result;
      });

      await invalidateMetricsCache(chamado.gestorid);

      res.status(200).json({ message: 'Status atualizado com sucesso.', chamado: updated });
    } catch (error) {
      next(error);
    }
  },

  // PUT /gestor/chamados/:id/aceitar - Assumir ou atribuir chamado a um gestor
  async aceitarChamado(req: Request, res: Response, next: NextFunction) {
    try {
      const gestorId = req.user?.id;
      const id = req.params['id'] as string;
      const gestorDestinoId = req.body.gestorDestinoId as string | undefined;

      if (!gestorId) throw new AppError(401, 'Usuário não autenticado.');

      const gestor = await prisma.gestor.findUnique({ where: { id: gestorId }, select: { orgaoid: true } });
      if (!gestor) throw new AppError(404, 'Gestor não encontrado.');

      const chamado = await prisma.chamado.findUnique({ where: { id } });
      if (!chamado) throw new AppError(404, 'Chamado não encontrado.');
      if (chamado.orgaoid !== gestor.orgaoid) throw new AppError(403, 'Chamado não pertence ao seu órgão.');

      const responsavelId: string = gestorDestinoId ?? gestorId;

      if (gestorDestinoId) {
        const dest = await prisma.gestor.findUnique({ where: { id: gestorDestinoId }, select: { orgaoid: true } });
        if (!dest || dest.orgaoid !== gestor.orgaoid) throw new AppError(400, 'Gestor destino inválido ou de outro órgão.');
      }

      const novoStatus: status_chamado = chamado.status === 'Aberto' ? status_chamado.Em_An_lise : chamado.status;

      const autor     = await prisma.usuario.findUnique({ where: { id: gestorId },     select: { nome: true } });
      const responsavel = await prisma.usuario.findUnique({ where: { id: responsavelId }, select: { nome: true } });

      const updated = await prisma.$transaction(async (tx) => {
        const result = await tx.chamado.update({
          where: { id },
          data: { gestorid: responsavelId, status: novoStatus, atualizadoem: new Date() },
          select: { id: true, status: true, gestorid: true },
        });

        await tx.timeline_event.create({
          data: {
            chamadoid: id,
            tipo: 'status',
            titulo: 'Chamado aceito',
            descricao: gestorDestinoId
              ? `Chamado atribuído a ${responsavel?.nome ?? gestorDestinoId} por ${autor?.nome ?? gestorId}.`
              : `Chamado aceito por ${autor?.nome ?? gestorId}.`,
            autor: autor?.nome ?? gestorId,
          },
        });

        return result;
      });

      await invalidateMetricsCache(gestorId);

      res.status(200).json({ message: 'Chamado aceito com sucesso.', chamado: updated });
    } catch (error) {
      next(error);
    }
  },

  // PUT /gestor/chamados/:id/transferir - Transferir chamado para outro órgão
  async transferirChamado(req: Request, res: Response, next: NextFunction) {
    try {
      const gestorId = req.user?.id;
      const id = req.params['id'] as string;
      const orgaoId      = req.body.orgaoId      as string | undefined;
      const justificativa = req.body.justificativa as string | undefined;

      if (!gestorId) throw new AppError(401, 'Usuário não autenticado.');
      if (!orgaoId || !justificativa) throw new AppError(400, 'orgaoId e justificativa são obrigatórios.');

      const gestor = await prisma.gestor.findUnique({ where: { id: gestorId }, select: { orgaoid: true } });
      if (!gestor) throw new AppError(404, 'Gestor não encontrado.');

      const chamado = await prisma.chamado.findUnique({ where: { id } });
      if (!chamado) throw new AppError(404, 'Chamado não encontrado.');
      if (chamado.orgaoid !== gestor.orgaoid) throw new AppError(403, 'Chamado não pertence ao seu órgão.');

      const orgaoDestino = await prisma.orgao.findUnique({ where: { id: orgaoId } });
      if (!orgaoDestino) throw new AppError(400, 'Órgão destino não encontrado.');

      const autor = await prisma.usuario.findUnique({ where: { id: gestorId }, select: { nome: true } });

      await prisma.$transaction(async (tx) => {
        await tx.chamado.update({
          where: { id },
          data: { orgaoid: orgaoId, gestorid: null, atualizadoem: new Date() },
        });

        await tx.timeline_event.create({
          data: {
            chamadoid: id,
            tipo: 'transferencia',
            titulo: 'Chamado transferido',
            descricao: `Encaminhado para ${orgaoDestino.nome}. Motivo: ${justificativa}`,
            autor: autor?.nome ?? gestorId,
            dadosantigos: { orgaoid: chamado.orgaoid },
            dadosnovos:   { orgaoid: orgaoId },
          },
        });
      });

      await invalidateMetricsCache(gestorId);

      res.status(200).json({ message: 'Chamado transferido com sucesso.' });
    } catch (error) {
      next(error);
    }
  },

  // GET /gestor/equipe - Lista gestores do mesmo órgão
  async listarEquipe(req: Request, res: Response, next: NextFunction) {
    try {
      const gestorId = req.user?.id;
      if (!gestorId) throw new AppError(401, 'Usuário não autenticado.');

      const gestor = await prisma.gestor.findUnique({ where: { id: gestorId }, select: { orgaoid: true } });
      if (!gestor) throw new AppError(404, 'Gestor não encontrado.');

      const equipe = await prisma.gestor.findMany({
        where: { orgaoid: gestor.orgaoid },
        include: { usuario: { select: { id: true, nome: true, email: true } } },
      });

      res.status(200).json({
        equipe: equipe.map((g) => ({
          id: g.id,
          nome: g.usuario.nome,
          email: g.usuario.email,
          departamento: g.departamento,
        })),
      });
    } catch (error) {
      next(error);
    }
  },
};
