import { prisma } from '../config/prisma';

export const organRepository = {
    async criarOrgao(dados: {
        id: string;
        nome: string;
        sigla: string;
        tipo: string;
        slahoras: number;
        responsavel: string;
        email: string;
        telefone?: string;
    }) {
        const orgao = await prisma.orgao.create({
            data: {
                id: dados.id,
                nome: dados.nome,
                sigla: dados.sigla,
                tipo: dados.tipo as any,
                slahoras: dados.slahoras,
                responsavel: dados.responsavel,
                email: dados.email,
                telefone: dados.telefone || null,
                status: 'Ativo',
            },
        });

        return orgao;
    },

    async adicionarCategorias(orgaoId: string, categoriaIds: number[]) {
        const categoryRelations = await Promise.all(
            categoriaIds.map(categoriaId =>
                prisma.orgao_categoria.create({
                    data: {
                        orgaoid: orgaoId,
                        categoriaid: categoriaId,
                    },
                })
            )
        );

        return categoryRelations;
    },

    async obterOrgaoPorId(id: string) {
        const orgao = await prisma.orgao.findUnique({
            where: { id },
            include: {
                orgao_categoria: {
                    include: {
                        categoria: true,
                    },
                },
            },
        });

        return orgao;
    },

    async verificarSiglaExistente(sigla: string) {
        const orgao = await prisma.orgao.findFirst({
            where: { sigla },
        });

        return !!orgao;
    },

    async verificarNomeExistente(nome: string, excluirId?: string) {
        return !!(await prisma.orgao.findFirst({
            where: {
                nome,
                ...(excluirId ? { NOT: { id: excluirId } } : {}),
            },
        }));
    },

    async verificarIdExistente(id: string) {
        const orgao = await prisma.orgao.findFirst({
            where: { id },
        });

        return !!orgao;
    },

    async listarOrgaos(status?: 'ativo' | 'inativo') {
        // Mapeia o filtro da query (?status=ativo) para o enum do banco (Ativo/Inativo)
        const statusFiltro = status
            ? status === 'ativo' ? 'Ativo' : 'Inativo'
            : undefined;

        const orgaos = await prisma.orgao.findMany({
            ...(statusFiltro && {
                where: {
                    status: statusFiltro as any,
                },
            }),
            orderBy: {
                nome: 'asc',
            },
            include: {
                orgao_categoria: {
                    include: {
                        categoria: {
                            select: {
                                nome: true,
                            },
                        },
                    },
                },
            },
        });

        return orgaos;
    },

    async atualizarOrgao(id: string, dados: Partial<{
        nome: string;
        tipo: string;
        slahoras: number;
        responsavel: string;
        email: string;
        telefone: string;
    }>) {
        return prisma.orgao.update({
            where: { id },
            data: { ...dados, tipo: dados.tipo as any },
        });
    },

    async substituirCategorias(orgaoId: string, categoriaIds: number[]) {
        await prisma.orgao_categoria.deleteMany({
            where: { orgaoid: orgaoId },
        });

        if (categoriaIds.length > 0) {
            await prisma.orgao_categoria.createMany({
                data: categoriaIds.map(categoriaid => ({
                    orgaoid: orgaoId,
                    categoriaid,
                })),
                skipDuplicates: true,
            });
        }
    },

    async atualizarStatus(id: string, status: 'Ativo' | 'Inativo') {
        return prisma.orgao.update({
            where: { id },
            data: { status: status as any },
        });
    },
};
