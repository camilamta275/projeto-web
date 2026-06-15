import { Request, Response, NextFunction } from 'express';
import jwt, {
  TokenExpiredError,
  JsonWebTokenError,
} from 'jsonwebtoken';
import { authService } from '../services/authService';
import { JWT_SECRET } from '../config/env';

// Estendendo Request para incluir usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        perfil: string;
      };
    }
  }
}

export type AuthRequest = Request;

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Token via cookie (prioridade)
    let token = req.cookies.token;

    // 2. Token via Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;

      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // 3. Token obrigatório
    if (!token) {
      return res.status(401).json({
        error: 'Acesso negado. Token não fornecido.',
      });
    }

    // 4. Verifica blocklist (logout)
    if (authService.isTokenBlocked(token)) {
      return res.status(401).json({
        error: 'Token foi revogado (logout realizado).',
      });
    }

    // 5. Valida JWT
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      perfil: string;
    };

    // 6. Busca usuário no banco (OBRIGATÓRIO)
    const user = await authService.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado.',
      });
    }

    // 7. BLOQUEIO DE USUÁRIO INATIVO (REGRA DE NEGÓCIO)
    if (user.status !== 'Ativo') {
      return res.status(403).json({
        error: 'Usuário inativo. Acesso bloqueado.',
      });
    }

    // 8. Injeta usuário no request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      perfil: decoded.perfil,
    };

    // 9. Continua fluxo
    next();
  } catch (error) {
    // Token expirado
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expirado. Faça login novamente.',
      });
    }

    // Token inválido
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({
        error: 'Token inválido.',
      });
    }

    // Erro genérico
    return res.status(401).json({
      error: 'Erro na autenticação.',
    });
  }
};