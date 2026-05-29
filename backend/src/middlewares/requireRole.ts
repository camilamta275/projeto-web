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

export const requireRole = (allowedRoles: PerfilUsuario[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Se não houver usuário autenticado ou perfil definido
    if (!req.user || !req.user.perfil) {
      return res.status(401).json({ message: 'Não autorizado. Faça login para acessar.' });
    }

    // Verifica se o perfil do usuário está na lista de perfis permitidos
    if (!allowedRoles.includes(req.user.perfil)) {
      return res.status(403).json({ message: 'Acesso negado. Perfil não autorizado.' });
    }

    // Usuário autorizado, avança para o próximo handler
    next();
  };
};