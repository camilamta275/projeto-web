import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { authService } from '../services/authService';

const JWT_SECRET = process.env.JWT_SECRET || 'chave_secreta_super_segura';

// Estendendo o Request do Express para incluir o payload do usuário
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    perfil: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Tenta ler token do cookie (prioridade)
    let token = req.cookies.token;

    // 2. Se não encontrar no cookie, tenta header Authorization: Bearer <token>
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove "Bearer " do início
      }
    }

    // 3. Se ainda não tem token, retorna erro
    if (!token) {
      return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    // 4. Verifica se o token está na blocklist (logout)
    if (authService.isTokenBlocked(token)) {
      return res.status(401).json({ error: 'Token foi revogado (logout realizado).' });
    }

    // 5. Verifica a validade do token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; perfil: string };
    
    // 6. Anexa as informações decodificadas no request
    req.user = decoded;
    
    // 7. Segue para o próximo middleware/controller
    next();
  } catch (error) {
    // Diferencia tipo de erro
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: 'Token expirado. Faça login novamente.' });
    }
    
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    
    return res.status(401).json({ error: 'Erro na autenticação.' });
  }
};