import { organRepository } from '../repositories/organRepository';

interface CriarOrgaoDTO {
    id: string;
    nome: string;
    sigla: string;
    tipo?: string;
    slahoras: number;
    responsavel: string;
    email: string;
    telefone?: string;
    categorias: number[];
}

interface OrgaoListItem {
    id: string;
    sigla: string;
    nome: string;
    tipo: string;
    slaDefault: number;
    responsavel: string | null;
    email: string;
    status: string;
    categorias: string[];
}

interface EditarOrgaoDTO {
    nome?: string;
    tipo?: string;
    slahoras?: number;
    responsavel?: string;
    email?: string;
    telefone?: string;
    categorias?: number[];
}

export const organService = {
    async validarCamposObrigatorios(dados: CriarOrgaoDTO) {
        const camposObrigatorios = ['id', 'nome', 'sigla', 'slahoras', 'responsavel', 'email', 'categorias'];
        const camposFaltantes: string[] = [];

        camposObrigatorios.forEach(campo => {
            if (campo === 'categorias') {
                if (!dados[campo] || !Array.isArray(dados[campo]) || dados[campo].length === 0) {
                    camposFaltantes.push(campo);
                }
            } else if (!dados[campo as keyof CriarOrgaoDTO]) {
                camposFaltantes.push(campo);
            }
        });

        if (camposFaltantes.length > 0) {
            throw new Error(`Campos obrigatórios faltando: ${camposFaltantes.join(', ')}`);
        }
    },

    async criarOrgao(dados: CriarOrgaoDTO) {
        // Validar campos obrigatórios
        this.validarCamposObrigatorios(dados);

        // Validar se sigla e id já existe
        const siglaExiste = await organRepository.verificarSiglaExistente(dados.sigla);
        const idExiste = await organRepository.verificarIdExistente(dados.id);
        if (siglaExiste || idExiste) {
            const erro = new Error(`A sigla: '${dados.sigla}' já existe no sistema`) as Error & { statusCode?: number };
            erro.statusCode = 409;
            throw erro;
        }

        // Validar se nome já existe
        const nomeExiste = await organRepository.verificarNomeExistente(dados.nome);
        if (nomeExiste) {
            const erro = new Error(`O nome '${dados.nome}' já existe no sistema`) as Error & { statusCode?: number };
            erro.statusCode = 409;
            throw erro;
        }

        // Definir tipo padrão se não informado
        const tipo = dados.tipo || 'Municipal';

        try {
            // Criar órgão
            const dadosOrgao = {
                id: dados.id,
                nome: dados.nome,
                sigla: dados.sigla,
                tipo,
                slahoras: dados.slahoras,
                responsavel: dados.responsavel,
                email: dados.email,
            };

            if (dados.telefone !== undefined) {
                Object.assign(dadosOrgao, { telefone: dados.telefone });
            }

            const orgao = await organRepository.criarOrgao(dadosOrgao);

            // Adicionar categorias
            await organRepository.adicionarCategorias(orgao.id, dados.categorias);

            // Retornar órgão com categorias
            const orgaoComCategorias = await organRepository.obterOrgaoPorId(orgao.id);
            return orgaoComCategorias;
        } catch (error) {
            throw error;
        }
    },

    async findAll(status?: 'ativo' | 'inativo'): Promise<OrgaoListItem[]> {
        const orgaos = await organRepository.listarOrgaos(status);

        return orgaos.map(o => ({
            id: o.id,
            sigla: o.sigla,
            nome: o.nome,
            tipo: o.tipo,
            slaDefault: o.slahoras,
            responsavel: o.responsavel,
            email: o.email,
            status: o.status.toLowerCase(),
            categorias: o.orgao_categoria.map(oc => oc.categoria.nome),
        }));
    },

    async editarOrgao(id: string, dados: EditarOrgaoDTO) {
        // Verifica se o órgão existe
        const orgaoExistente = await organRepository.obterOrgaoPorId(id);
        if (!orgaoExistente) {
            const erro = new Error(`Órgão '${id}' não encontrado`) as Error & { statusCode?: number };
            erro.statusCode = 404;
            throw erro;
        }

        // Verifica conflito de nome com OUTRO órgão (exclui o próprio)
        if (dados.nome !== undefined) {
            const nomeExiste = await organRepository.verificarNomeExistente(dados.nome, id);
            if (nomeExiste) {
                const erro = new Error(`O nome '${dados.nome}' já está em uso por outro órgão`) as Error & { statusCode?: number };
                erro.statusCode = 409;
                throw erro;
            }
        }

        // Atualiza campos escalares
        const dadosAtualizados: any = {};
        if (dados.nome !== undefined) dadosAtualizados.nome = dados.nome;
        if (dados.tipo !== undefined) dadosAtualizados.tipo = dados.tipo;
        if (dados.slahoras !== undefined) dadosAtualizados.slahoras = dados.slahoras;
        if (dados.responsavel !== undefined) dadosAtualizados.responsavel = dados.responsavel;
        if (dados.email !== undefined) dadosAtualizados.email = dados.email;
        if (dados.telefone !== undefined) dadosAtualizados.telefone = dados.telefone;

        await organRepository.atualizarOrgao(id, dadosAtualizados);

        // Substitui categorias se enviadas
        if (dados.categorias !== undefined) {
            await organRepository.substituirCategorias(id, dados.categorias);
        }

        const orgao = await organRepository.obterOrgaoPorId(id);

        if (!orgao) {
            throw new Error('Órgão não encontrado');
        }

        return {
            id: orgao.id,
            sigla: orgao.sigla,
            nome: orgao.nome,
            tipo: orgao.tipo,
            slaDefault: orgao.slahoras,
            responsavel: orgao.responsavel,
            email: orgao.email,
            telefone: orgao.telefone,
            status: orgao.status.toLowerCase(),
            categorias: orgao.orgao_categoria.map(
                oc => oc.categoria.nome
            ),
        };
    },

    async editarStatus(id: string, status: 'inativo' | 'ativo') {
        const orgaoExistente = await organRepository.obterOrgaoPorId(id);
        if (!orgaoExistente) {
            const erro = new Error(`Órgão '${id}' não encontrado`) as Error & { statusCode?: number };
            erro.statusCode = 404;
            throw erro;
        }

        const novoStatus = status === 'ativo' ? 'Ativo' : 'Inativo';
        await organRepository.atualizarStatus(id, novoStatus);
        const orgao = await organRepository.obterOrgaoPorId(id);

        return orgao?.status;
    }
};
