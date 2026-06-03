import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorMiddleware';
// 1. Puxe do pacote @prisma/client APENAS os tipos ou enums (como o status_chamado)
import { status_chamado } from '@prisma/client';

// 2. Importe a instância do Prisma que já está pronta no seu arquivo de config
// Atenção às chaves { prisma }, pois você usou "export const prisma" no arquivo!
import { prisma } from '../config/prisma';

export const gestorController = {
  // GET /gestor/dashboard - Estatísticas do gestor
  async dashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const gestorId = req.user?.id;

      if (!gestorId) {
        throw new AppError(401, 'Usuário não autenticado.');
      }

      // Buscar dados do gestor - usar ID do usuário diretamente
      const gestor = await prisma.gestor.findUnique({
        where: { id: gestorId },
        select: {
          id: true,
          departamento: true,
          usuario: {
            select: {
              nome: true,
              email: true,
            },
          },
          orgao: {
            select: {
              nome: true,
            },
          },
        },
      });

      if (!gestor) {
        throw new AppError(404, 'Gestor não encontrado.');
      }

      // Contar chamados atribuídos ao gestor
      const totalChamados = await prisma.chamado.count({
        where: { gestorid: gestorId },
      });

      const chamadosAbertos = await prisma.chamado.count({
        where: {
          gestorid: gestorId,
          status: 'Aberto',
        },
      });

      const chamadosEmProgresso = await prisma.chamado.count({
        where: {
          gestorid: gestorId,
          status: 'Em_Andamento',
        },
      });

      const chamadosEncerrados = await prisma.chamado.count({
        where: {
          gestorid: gestorId,
          status: { in: ['Resolvido', 'Fechado'] },
        },
      });

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

  // GET /gestor/chamados - Lista de chamados do gestor
  async listarChamados(req: Request, res: Response, next: NextFunction) {
    try {
      const gestorId = req.user?.id;

      if (!gestorId) {
        throw new AppError(401, 'Usuário não autenticado.');
      }

      const { status, limit = 10, offset = 0 } = req.query;

      let whereClause: any = { gestorid: gestorId };

      if (status && status !== 'Todos') {
        whereClause.status = status as status_chamado;
      }

      const chamados = await prisma.chamado.findMany({
        where: whereClause,
        select: {
          id: true,
          protocolo: true,
          descricao: true,
          status: true,
          prioridade: true,
          criadoem: true,
        },
        orderBy: { criadoem: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      });

      const totalChamados = await prisma.chamado.count({ where: whereClause });

      res.status(200).json({
        chamados,
        pagina: {
          total: totalChamados,
          limit: Number(limit),
          offset: Number(offset),
        },
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

      if (!gestorId) {
        throw new AppError(401, 'Usuário não autenticado.');
      }

      const chamado = await prisma.chamado.findUnique({
        where: { id },
        select: {
          id: true,
          protocolo: true,
          descricao: true,
          status: true,
          prioridade: true,
          endereco: true,
          latitude: true,
          longitude: true,
          criadoem: true,
          gestorid: true,
        },
      });

      if (!chamado) {
        throw new AppError(404, 'Chamado não encontrado.');
      }

      // Verificar se o gestor atual é o responsável pelo chamado
      // Admin tem acesso a todos, Gestor só vê seus próprios
      const usuarioGestor = await prisma.usuario.findUnique({
        where: { id: gestorId },
      });

      if (usuarioGestor?.perfil === 'Gestor' && chamado.gestorid !== gestorId) {
        throw new AppError(403, 'Você não tem permissão para visualizar este chamado.');
      }

      res.status(200).json({ chamado });
    } catch (error) {
      next(error);
    }
  },

  // PUT /gestor/chamados/:id/status - Atualizar status de um chamado
  async atualizarStatusChamado(req: Request, res: Response, next: NextFunction) {
    try {
      const gestorId = req.user?.id;
      const id = req.params.id as string;
      const { status } = req.body;

      if (!gestorId) {
        throw new AppError(401, 'Usuário não autenticado.');
      }

      if (!status) {
        throw new AppError(400, 'Status é obrigatório.');
      }

      const statusValidos = ['Aberto', 'Em_An_lise', 'Em_Andamento', 'Aguardando', 'Resolvido', 'Fechado'];
      if (!statusValidos.includes(status)) {
        throw new AppError(400, `Status inválido. Deve ser um de: ${statusValidos.join(', ')}`);
      }

      const chamado = await prisma.chamado.findUnique({
        where: { id },
      });

      if (!chamado) {
        throw new AppError(404, 'Chamado não encontrado.');
      }

      // Verificar permissão
      const usuarioGestor = await prisma.usuario.findUnique({
        where: { id: gestorId },
      });

      if (usuarioGestor?.perfil === 'Gestor' && chamado.gestorid !== gestorId) {
        throw new AppError(403, 'Você não tem permissão para atualizar este chamado.');
      }

      const chamadoAtualizado = await prisma.chamado.update({
        where: { id },
        data: { status: status as status_chamado },
        select: {
          id: true,
          protocolo: true,
          status: true,
          atualizadoem: true,
        },
      });

      res.status(200).json({
        message: 'Status do chamado atualizado com sucesso.',
        chamado: chamadoAtualizado,
      });
    } catch (error) {
      next(error);
    }
  },
};
