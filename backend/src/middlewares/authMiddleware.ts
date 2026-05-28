import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_super_segura';

// Estendendo o Request do Express para incluir o payload do usuário
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Busca o token nos cookies
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Acesso negado. Autenticação necessária.' });
    }

    // Verifica a validade do token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    // Anexa as informações decodificadas no request
    req.user = decoded;
    
    // Segue para o próximo controller
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
};