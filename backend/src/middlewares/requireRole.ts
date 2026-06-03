import { Request, Response, NextFunction } from 'express';

// Extraindo os perfis do Modelo Conceitual para garantir consistência
export type PerfilUsuario = 'Cidadão' | 'Gestor' | 'Admin';

// Extendendo a tipagem global do Express para reconhecer req.user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        perfil: PerfilUsuario;
      };
    }
  }
}

/**
 * Define a hierarquia de permissões:
 * Admin > Gestor > Cidadão
 * 
 * Admin tem acesso a TODAS as rotas de Gestor e Cidadão
 * Gestor tem acesso a rotas de Gestor e Cidadão
 * Cidadão tem acesso apenas a rotas de Cidadão
 */
const hierarchyMap: Record<PerfilUsuario, PerfilUsuario[]> = {
  Admin: ['Admin', 'Gestor', 'Cidadão'], // Admin tem acesso a tudo
  Gestor: ['Gestor', 'Cidadão'], // Gestor tem acesso a Gestor e Cidadão
  Cidadão: ['Cidadão'], // Cidadão tem acesso apenas a Cidadão
};

export const requireRole = (allowedRoles: PerfilUsuario[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Se não houver usuário autenticado ou perfil definido
    if (!req.user || !req.user.perfil) {
      return res.status(401).json({ 
        error: 'Não autorizado. Faça login para acessar.',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
    }

    const userPerfil = req.user.perfil;
    const userPermissions = hierarchyMap[userPerfil];

    // Verifica se algum dos perfis permitidos está nas permissões do usuário
    const hasPermission = allowedRoles.some(role => userPermissions.includes(role));

    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Acesso negado. Seu perfil não tem permissão para acessar este recurso.',
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
    }

    // Usuário autorizado, avança para o próximo handler
    next();
  };
};
