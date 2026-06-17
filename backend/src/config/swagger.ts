/**
 * Documentação OpenAPI 3.0 (Swagger) — gerada a partir da análise de todo o backend.
 *
 * Expõe duas rotas (registradas em src/server.ts):
 *   - GET /docs        → interface Swagger UI (carregada via CDN externo)
 *   - GET /docs.json   → especificação OpenAPI crua (consumível por ferramentas externas)
 *
 * "Link externo": a interface Swagger UI é servida a partir do CDN público
 * https://unpkg.com/swagger-ui-dist, portanto não há dependência npm adicional.
 * A especificação /docs.json também pode ser colada/importada no editor externo
 * https://editor.swagger.io para visualizar e exportar a documentação.
 */

import { PORT } from './env';

const BEARER = [{ cookieAuth: [] as string[] }, { bearerAuth: [] as string[] }];

/** Resposta de erro padronizada (errorMiddleware.ts). */
const errorResponse = (description: string) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Error' },
    },
  },
});

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'API — Plataforma de Demandas Urbanas',
    version: '1.0.0',
    description:
      'Documentação completa de todos os endpoints do backend (Express 5 + Prisma + PostgreSQL).\n\n' +
      '### Autenticação\n' +
      'A API usa JWT. Após `POST /auth/login` o token é devolvido no corpo da resposta **e** ' +
      'gravado em um cookie `httpOnly` chamado `token`. Envie-o de uma destas formas:\n' +
      '- Cookie `token=<jwt>` (automático no navegador), ou\n' +
      '- Header `Authorization: Bearer <jwt>`.\n\n' +
      '### Perfis (hierarquia)\n' +
      '`Admin` › `Gestor` › `Cidadao`. Um perfil herda as permissões dos perfis abaixo dele.',
  },
  servers: [
    { url: `http://localhost:${PORT}`, description: 'Desenvolvimento local' },
    { url: '/', description: 'Mesma origem (produção / deploy)' },
  ],
  tags: [
    { name: 'Health', description: 'Verificação de saúde do serviço' },
    { name: 'Auth', description: 'Registro, login, logout e sessão' },
    { name: 'Demands', description: 'Demandas urbanas (chamados) — cidadão e gestor' },
    { name: 'Categories', description: 'Categorias de demandas' },
    { name: 'Users', description: 'Consulta de usuários (gestor)' },
    { name: 'Gestor', description: 'Painel do gestor: dashboard, equipe e fila de chamados' },
    { name: 'Metrics', description: 'Métricas e indicadores (gestor / admin)' },
    { name: 'Admin', description: 'Administração: órgãos, usuários, regras de competência e auditoria' },
  ],

  components: {
    securitySchemes: {
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' },
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Mensagem de erro legível' },
          statusCode: { type: 'integer', example: 400 },
          timestamp: { type: 'string', format: 'date-time' },
          details: { type: 'object', nullable: true },
        },
      },
      AuthUser: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nome: { type: 'string', example: 'Maria Silva' },
          email: { type: 'string', format: 'email' },
          perfil: { $ref: '#/components/schemas/Perfil' },
        },
      },
      Perfil: { type: 'string', enum: ['Cidadao', 'Gestor', 'Admin'], example: 'Cidadao' },
      Prioridade: { type: 'string', enum: ['Baixa', 'Media', 'Alta', 'Critica'] },
      StatusChamado: {
        type: 'string',
        enum: ['Aberto', 'Em Análise', 'Em Andamento', 'Aguardando', 'Resolvido', 'Fechado'],
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Iluminação Pública' },
          descricao: { type: 'string', nullable: true },
        },
      },
      Demand: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          protocolo: { type: 'string', example: 'DEM-20260617-A1B2' },
          title: { type: 'string', description: 'Subcategoria do chamado', example: 'Poste apagado' },
          description: { type: 'string' },
          status: { $ref: '#/components/schemas/StatusChamado' },
          location: { type: 'string', example: 'Rua das Flores, 123' },
          latitude: { type: 'number', format: 'double', example: -23.55052 },
          longitude: { type: 'number', format: 'double', example: -46.633308 },
          category: { $ref: '#/components/schemas/Category' },
          creator: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              nome: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      DemandList: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Demand' } },
          total: { type: 'integer', example: 42 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          totalPages: { type: 'integer', example: 3 },
        },
      },
      Organ: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'SEINF' },
          nome: { type: 'string', example: 'Secretaria de Infraestrutura' },
          sigla: { type: 'string', example: 'SEINF' },
          tipo: { type: 'string', enum: ['Municipal', 'Estadual', 'Federal', 'Concessionária'] },
          slahoras: { type: 'integer', example: 48 },
          responsavel: { type: 'string', nullable: true },
          email: { type: 'string', format: 'email' },
          telefone: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['Ativo', 'Inativo'] },
        },
      },
      RoutingRule: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          categoria: { $ref: '#/components/schemas/Category' },
          subcategoria: { type: 'string', example: 'Poste apagado' },
          orgaoPrincipal: { $ref: '#/components/schemas/Organ' },
          orgaoSecundario: { allOf: [{ $ref: '#/components/schemas/Organ' }], nullable: true },
          sla: { type: 'integer', description: 'SLA em horas', example: 24 },
          prioridade: { $ref: '#/components/schemas/Prioridade' },
        },
      },
      AuditLog: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          action: { type: 'string', example: 'USER_DEACTIVATED' },
          entity: { type: 'string', example: 'usuario' },
          entity_id: { type: 'string' },
          admin_id: { type: 'string', format: 'uuid' },
          metadata: { type: 'object', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
    },
    responses: {
      Unauthorized: errorResponse('Não autenticado — token ausente, inválido, expirado ou revogado.'),
      Forbidden: errorResponse('Acesso negado — perfil sem permissão ou usuário inativo.'),
      NotFound: errorResponse('Recurso não encontrado.'),
      BadRequest: errorResponse('Requisição inválida — campos obrigatórios ausentes ou inválidos.'),
      Conflict: errorResponse('Conflito — registro já existe.'),
    },
  },

  paths: {
    /* ===================== HEALTH ===================== */
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check do serviço',
        description: 'Verifica conectividade com banco de dados e Redis. Não requer autenticação.',
        security: [],
        responses: {
          200: {
            description: 'Serviço saudável',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                    environment: { type: 'string', example: 'development' },
                    database: { type: 'string', enum: ['connected', 'disconnected'] },
                    redis: { type: 'string', enum: ['connected', 'unavailable'] },
                  },
                },
              },
            },
          },
          503: { description: 'Serviço degradado (banco indisponível)' },
        },
      },
    },

    /* ===================== AUTH ===================== */
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar novo cidadão',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'email', 'senha'],
                properties: {
                  nome: { type: 'string', example: 'Maria Silva' },
                  email: { type: 'string', format: 'email' },
                  senha: { type: 'string', format: 'password', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuário criado',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthUser' } } },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login (define cookie httpOnly e retorna o token)',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'senha'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  senha: { type: 'string', format: 'password' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Autenticado. O token também é enviado no cookie `token`.',
            headers: {
              'Set-Cookie': { schema: { type: 'string' }, description: 'token=<jwt>; HttpOnly' },
            },
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/AuthUser' },
                    { type: 'object', properties: { token: { type: 'string' } } },
                  ],
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (revoga o token e limpa o cookie)',
        security: BEARER,
        responses: {
          200: {
            description: 'Logout realizado',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { message: { type: 'string' } } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Dados do usuário autenticado',
        security: BEARER,
        responses: {
          200: {
            description: 'Usuário atual',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/AuthUser' },
                    {
                      type: 'object',
                      properties: {
                        status: { type: 'string', enum: ['Ativo', 'Inativo'] },
                        criadoem: { type: 'string', format: 'date-time' },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    /* ===================== DEMANDS ===================== */
    '/demands': {
      get: {
        tags: ['Demands'],
        summary: 'Listar demandas (cidadão vê só as suas; gestor/admin veem todas)',
        security: BEARER,
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Filtra por status (valor do enum)' },
          { name: 'categoria', in: 'query', schema: { type: 'integer' }, description: 'ID da categoria' },
          { name: 'regiao', in: 'query', schema: { type: 'string' }, description: 'Busca por trecho do endereço' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
        ],
        responses: {
          200: {
            description: 'Lista paginada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DemandList' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Demands'],
        summary: 'Criar demanda',
        description: 'Requer perfil **Cidadao**. O órgão, prioridade e SLA são resolvidos automaticamente pelas regras de competência.',
        security: BEARER,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'description', 'category_id', 'location'],
                properties: {
                  title: { type: 'string', example: 'Poste apagado' },
                  description: { type: 'string' },
                  category_id: { type: 'integer', example: 1 },
                  location: { type: 'string', example: 'Rua das Flores, 123' },
                  latitude: { type: 'number', format: 'double' },
                  longitude: { type: 'number', format: 'double' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Demanda criada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Demand' } } },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/demands/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      get: {
        tags: ['Demands'],
        summary: 'Detalhar demanda (inclui timeline)',
        security: BEARER,
        responses: {
          200: {
            description: 'Demanda',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/Demand' },
                    { type: 'object', properties: { logs: { type: 'array', items: { type: 'object' } } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      put: {
        tags: ['Demands'],
        summary: 'Atualizar demanda (somente o autor — perfil Cidadao)',
        security: BEARER,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  location: { type: 'string' },
                  category_id: { type: 'integer' },
                  latitude: { type: 'number', format: 'double' },
                  longitude: { type: 'number', format: 'double' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Demanda atualizada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Demand' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Demands'],
        summary: 'Excluir demanda — soft delete, marca como Fechado (perfil Gestor)',
        security: BEARER,
        responses: {
          204: { description: 'Demanda removida (sem conteúdo)' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/demands/{id}/status': {
      patch: {
        tags: ['Demands'],
        summary: 'Atualizar status da demanda (perfil Gestor)',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status_id'],
                properties: {
                  status_id: {
                    type: 'string',
                    description: 'Novo status (valor do enum interno)',
                    enum: ['Aberto', 'Em_An_lise', 'Em_Andamento', 'Aguardando', 'Resolvido', 'Fechado'],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status atualizado' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    /* ===================== CATEGORIES ===================== */
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Listar categorias ativas',
        security: BEARER,
        responses: {
          200: {
            description: 'Lista de categorias',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Detalhar categoria por ID',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Categoria',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    /* ===================== USERS ===================== */
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar usuários (perfil Gestor)',
        security: BEARER,
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'Lista paginada de usuários',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    usuarios: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', format: 'uuid' },
                          name: { type: 'string' },
                          email: { type: 'string', format: 'email' },
                          role: { $ref: '#/components/schemas/Perfil' },
                          created_at: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Buscar usuário por ID (perfil Gestor)',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Usuário encontrado' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    /* ===================== GESTOR ===================== */
    '/gestor/dashboard': {
      get: {
        tags: ['Gestor'],
        summary: 'Dashboard do gestor (estatísticas do órgão)',
        security: BEARER,
        responses: {
          200: {
            description: 'Resumo de chamados do órgão',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    gestor: { type: 'object' },
                    chamados: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        abertos: { type: 'integer' },
                        emProgresso: { type: 'integer' },
                        encerrados: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/gestor/equipe': {
      get: {
        tags: ['Gestor'],
        summary: 'Listar gestores do mesmo órgão',
        security: BEARER,
        responses: {
          200: { description: 'Equipe do órgão' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/gestor/chamados': {
      get: {
        tags: ['Gestor'],
        summary: 'Fila de chamados do órgão',
        security: BEARER,
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' }, description: '"Todos" ou um status específico' },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 } },
          { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        ],
        responses: {
          200: { description: 'Lista de chamados com paginação' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/gestor/chamados/{id}': {
      get: {
        tags: ['Gestor'],
        summary: 'Detalhar chamado (com timeline)',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Chamado detalhado' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/gestor/chamados/{id}/aceitar': {
      put: {
        tags: ['Gestor'],
        summary: 'Aceitar/atribuir chamado',
        description: 'Sem corpo: o gestor assume o chamado. Com `gestorDestinoId`: atribui a outro gestor do mesmo órgão.',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { gestorDestinoId: { type: 'string', format: 'uuid' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Chamado aceito' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/gestor/chamados/{id}/transferir': {
      put: {
        tags: ['Gestor'],
        summary: 'Transferir chamado para outro órgão',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['orgaoId', 'justificativa'],
                properties: {
                  orgaoId: { type: 'string', example: 'SEMOB' },
                  justificativa: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Chamado transferido' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/gestor/chamados/{id}/status': {
      put: {
        tags: ['Gestor'],
        summary: 'Atualizar status do chamado',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { $ref: '#/components/schemas/StatusChamado' },
                  justificativa: { type: 'string' },
                  resolutionNote: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status atualizado' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    /* ===================== METRICS ===================== */
    '/metrics/total-demands': {
      get: {
        tags: ['Metrics'],
        summary: 'Total de demandas (escopo gestor/admin)',
        security: BEARER,
        responses: {
          200: { description: 'Total de demandas' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/metrics/demands-by-category': {
      get: {
        tags: ['Metrics'],
        summary: 'Demandas por categoria',
        security: BEARER,
        responses: {
          200: { description: 'Distribuição por categoria' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/metrics/average-response-time': {
      get: {
        tags: ['Metrics'],
        summary: 'Tempo médio de resposta',
        security: BEARER,
        responses: {
          200: { description: 'Tempo médio de resolução' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    /* ===================== ADMIN — ORGÃOS ===================== */
    '/admin/organs': {
      get: {
        tags: ['Admin'],
        summary: 'Listar órgãos (Admin ou Gestor)',
        security: BEARER,
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ativo', 'inativo'] } },
        ],
        responses: {
          200: {
            description: 'Lista de órgãos',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Organ' } },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Admin'],
        summary: 'Cadastrar órgão (Admin)',
        security: BEARER,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id', 'nome', 'sigla', 'tipo', 'slahoras', 'email'],
                properties: {
                  id: { type: 'string', example: 'SEINF' },
                  nome: { type: 'string' },
                  sigla: { type: 'string' },
                  tipo: { type: 'string', enum: ['Municipal', 'Estadual', 'Federal', 'Concessionária'] },
                  slahoras: { type: 'integer' },
                  responsavel: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  telefone: { type: 'string' },
                  categorias: { type: 'array', items: { type: 'integer' }, description: 'IDs de categorias vinculadas' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Órgão cadastrado' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/admin/organs/{id}': {
      put: {
        tags: ['Admin'],
        summary: 'Editar órgão (Admin)',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                  tipo: { type: 'string', enum: ['Municipal', 'Estadual', 'Federal', 'Concessionária'] },
                  slahoras: { type: 'integer' },
                  responsavel: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  telefone: { type: 'string' },
                  categorias: { type: 'array', items: { type: 'integer' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Órgão atualizado' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' },
        },
      },
    },
    '/admin/organs/{id}/{status}': {
      put: {
        tags: ['Admin'],
        summary: 'Ativar/inativar órgão (Admin)',
        security: BEARER,
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'status', in: 'path', required: true, schema: { type: 'string', enum: ['ativo', 'inativo'] } },
        ],
        responses: {
          200: { description: 'Status do órgão atualizado' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/admin/organs/{id}/categories': {
      get: {
        tags: ['Admin'],
        summary: 'Listar categorias vinculadas a um órgão (Admin)',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Categorias do órgão',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    /* ===================== ADMIN — USUÁRIOS ===================== */
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Listar usuários (Admin)',
        security: BEARER,
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'role', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Lista paginada de usuários' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Admin'],
        summary: 'Criar usuário (Admin)',
        security: BEARER,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password', 'role'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  role: { type: 'string', enum: ['Cidadao', 'Gestor'] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuário criado' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/users/{id}/activate': {
      patch: {
        tags: ['Admin'],
        summary: 'Ativar usuário (Admin)',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Usuário ativado' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/users/{id}/deactivate': {
      patch: {
        tags: ['Admin'],
        summary: 'Desativar usuário (Admin)',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Usuário desativado' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/users/{id}/role': {
      patch: {
        tags: ['Admin'],
        summary: 'Alterar perfil do usuário (Admin)',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: { role: { type: 'string', enum: ['Cidadao', 'Gestor'] } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Perfil atualizado' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    /* ===================== ADMIN — REGRAS DE COMPETÊNCIA ===================== */
    '/admin/routing-rules': {
      get: {
        tags: ['Admin'],
        summary: 'Listar regras de competência (Admin)',
        security: BEARER,
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 100 } },
          { name: 'organ_id', in: 'query', schema: { type: 'string' } },
          { name: 'category_id', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          200: {
            description: 'Lista de regras',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    regras: { type: 'array', items: { $ref: '#/components/schemas/RoutingRule' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      post: {
        tags: ['Admin'],
        summary: 'Criar regra de competência (Admin)',
        security: BEARER,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['categoriaId', 'subcategoria', 'orgaoprincipalId', 'prioridade'],
                properties: {
                  categoriaId: { type: 'integer' },
                  subcategoria: { type: 'string' },
                  orgaoprincipalId: { type: 'string' },
                  orgaosecundarioId: { type: 'string', nullable: true },
                  slaHoras: { type: 'integer' },
                  prioridade: { $ref: '#/components/schemas/Prioridade' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Regra criada' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/admin/routing-rules/{id}': {
      patch: {
        tags: ['Admin'],
        summary: 'Editar regra de competência (Admin)',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  categoriaId: { type: 'integer' },
                  subcategoria: { type: 'string' },
                  orgaoprincipalId: { type: 'string' },
                  orgaosecundarioId: { type: 'string', nullable: true },
                  slaHoras: { type: 'integer' },
                  prioridade: { $ref: '#/components/schemas/Prioridade' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Regra atualizada' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Excluir regra de competência (Admin)',
        security: BEARER,
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Regra excluída' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },

    /* ===================== ADMIN — AUDITORIA ===================== */
    '/admin/audit-logs': {
      get: {
        tags: ['Admin'],
        summary: 'Listar logs de auditoria (Admin)',
        security: BEARER,
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'admin_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: {
            description: 'Lista paginada de logs',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/AuditLog' } },
                    pagination: { $ref: '#/components/schemas/Pagination' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
  },
} as const;

/**
 * HTML da interface Swagger UI. Os assets (JS/CSS) são carregados de um CDN
 * externo (unpkg) — daí o "link externo". A especificação é buscada em /docs.json.
 */
export const swaggerHtml = `<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API — Plataforma de Demandas Urbanas | Swagger</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@5/favicon-32x32.png" />
    <style>body { margin: 0; } .topbar { display: none; }</style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js" crossorigin></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: './docs.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout',
        persistAuthorization: true,
      });
    </script>
  </body>
</html>`;
