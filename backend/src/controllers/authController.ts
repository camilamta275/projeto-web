import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { nome, email, senha } = req.body;
      
      // Validação de campos obrigatórios
      if (!nome || !email || !senha) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: nome, email, senha' 
        });
      }
      
      // Validação de formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'E-mail inválido' 
        });
      }
      
      // Validação de força de senha (mínimo 6 caracteres)
      if (senha.length < 6) {
        return res.status(400).json({ 
          error: 'Senha deve ter no mínimo 6 caracteres' 
        });
      }
      
      const usuario = await authService.register(nome, email, senha);
      
      res.status(201).json({ id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil });
    } catch (error: any) {
      // Tratar erro específico de email duplicado
      if (error.message.includes('E-mail já cadastrado')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;
      
      // Validação de campos obrigatórios
      if (!email || !senha) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: email, senha' 
        });
      }
      
      const { usuario, token } = await authService.login(email, senha);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ id: usuario.id, email: usuario.email, perfil: usuario.perfil });
    } catch (error: any) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
    }
  },

  async logout(req: AuthRequest, res: Response) {
    try {
      const token = req.cookies.token;
      
      // Remove o cookie
      res.clearCookie('token');
      
      // Adiciona token à blocklist
      await authService.addTokenToBlocklist(token);
      
      res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao fazer logout' });
    }
  },

  async me(req: AuthRequest, res: Response) {
    try {
      // Obtém o ID do usuário autenticado do token
      const usuarioId = req.user?.id;

      if (!usuarioId) {
        return res.status(401).json({ error: 'Usuário não identificado.' });
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
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }
  
};