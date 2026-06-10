import { Request, Response, NextFunction } from 'express';
import { organService } from '../services/organService';

const service = organService;

export const organController = {
    async cadastrarOrgao(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, nome, sigla, tipo, slahoras, responsavel, email, telefone, categorias } = req.body;

            const adminId = req.user!.id;

            const orgao = await service.criarOrgao({
                id,
                nome,
                sigla,
                tipo,
                slahoras,
                responsavel,
                email,
                telefone,
                categorias,
            }, adminId);

            return res.status(201).json({
                mensagem: 'Órgão cadastrado com sucesso',
                orgao,
            });
        } catch (error) {
            // Verificar se é erro de conflito (statusCode 409)
            if (error instanceof Error && (error as any).statusCode === 409) {
                return res.status(409).json({
                    message: error.message,
                });
            }
            next(error);
        }
    },

    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const { status } = req.query;

            if (status !== undefined && status !== 'ativo' && status !== 'inativo') {
                return res.status(400).json({
                    message: 'Filtro status inválido. Use "ativo" ou "inativo".',
                });
            }

            const orgaos = await service.findAll(status as 'ativo' | 'inativo' | undefined);
            res.status(200).json(orgaos);
        } catch (error) {
            next(error);
        }
    },

    async editarOrgao(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { nome, tipo, slahoras, responsavel, email, telefone, categorias } = req.body;

            const adminId = req.user!.id;

            const orgao = await service.editarOrgao(id, {
                nome,
                tipo,
                slahoras,
                responsavel,
                email,
                telefone,
                categorias,
            }, adminId);

            return res.status(200).json(orgao);
        } catch (error) {
            const err = error as Error & { statusCode?: number };
            if (err.statusCode === 404) return res.status(404).json({ message: err.message });
            if (err.statusCode === 409) return res.status(409).json({ message: err.message });
            next(error);
        }
    },

    async editarStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const status = req.params.status as string;


            if (status !== 'ativo' && status !== 'inativo') {
                return res.status(400).json({
                    message: 'Status inválido. Use "ativo" ou "inativo".',
                });
            }

            const orgao = await service.editarStatus(id, status);

            return res.status(200).json(orgao);
        } catch (error) {
            const err = error as Error & { statusCode?: number };
            if (err.statusCode === 404) return res.status(404).json({ message: err.message });
            if (err.statusCode === 409) return res.status(409).json({ message: err.message });
            next(error);
        }
    },

    /**
   * GET /admin/organs/:id/categories
   * Retorna as categorias vinculadas ao órgão informado.
   * Usado pelo modal de regras para filtrar o select de categorias
   * após o usuário selecionar um órgão principal.
   */
    async listarCategoriasPorOrgao(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;

            const categorias = await service.listarCategoriasPorOrgao(id);
            return res.status(200).json(categorias);

        } catch (error) {
            const err = error as Error & { statusCode?: number };

            if (err.statusCode === 404) return res.status(404).json({ message: err.message });
            next(error);
        }
    },
};
