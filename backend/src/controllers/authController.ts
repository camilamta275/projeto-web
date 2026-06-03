import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AppError } from '../middlewares/errorMiddleware';
import { AuthRequest } from '../middlewares/authMiddleware';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { nome, email, senha } = req.body;
      
      // Validação de campos obrigatórios
      if (!nome || !email || !senha) {
        throw new AppError(400, 'Campos obrigatórios: nome, email, senha');
      }
      
      // Validação de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError(400, 'E-mail inválido');
      }
      
      // Validação de força de senha (mínimo 6 caracteres)
      if (senha.length < 6) {
        throw new AppError(400, 'Senha deve ter no mínimo 6 caracteres');
      }
      
      const usuario = await authService.register(nome, email, senha);
      
      res.status(201).json({ id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, senha } = req.body;
      
      // Validação de campos obrigatórios
      if (!email || !senha) {
        throw new AppError(400, 'Campos obrigatórios: email, senha');
      }
      
      const { usuario, token } = await authService.login(email, senha);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ id: usuario.id, email: usuario.email, perfil: usuario.perfil });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.token;
      
      // Remove o cookie
      res.clearCookie('token');
      
      // Adiciona token à blocklist
      await authService.addTokenToBlocklist(token);
      
      res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      next(error);
    }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Obtém o ID do usuário autenticado do token
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        throw new AppError(401, 'Usuário não identificado.');
      }

      // Busca os dados completos do usuário do banco
      const usuario = await authService.getUserById(usuarioId);

      res.status(200).json({ 
        id: usuario.id, 
        nome: usuario.nome, 
        email: usuario.email, 
        perfil: usuario.perfil,
        status: usuario.status,
        criadoem: usuario.criadoem 
      });
    } catch (error) {
      next(error);
    }
  }
  
};