import { Request, Response, NextFunction } from 'express';

// Extraindo os perfis do Modelo Conceitual para garantir consistência
export type PerfilUsuario = 'Cidadao' | 'Gestor' | 'Admin';

const hierarchyMap: Record<string, string[]> = {
  Admin: ['Admin', 'Gestor', 'Cidadao'],
  Gestor: ['Gestor', 'Cidadao'],
  Cidadao: ['Cidadao'],
};

export const requireRole = (allowedRoles: string[]) => {
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
    const userPermissions = hierarchyMap[userPerfil] || [];

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
