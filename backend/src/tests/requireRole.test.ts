import { Request, Response, NextFunction } from 'express';
import { requireRole } from '../middlewares/requireRole';


describe('Middleware: requireRole', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Resetamos os mocks antes de cada teste
    mockRequest = {};
    mockResponse = {
      // .mockReturnThis() permite encadear res.status().json()
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('deve chamar next() quando o usuário possui um perfil autorizado (ex: Admin)', () => {
    mockRequest.user = { id: '1', perfil: 'Admin' };
    
    const middleware = requireRole(['Admin', 'Gestor']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Validações
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('deve retornar status 403 quando o perfil não for autorizado (ex: Cidadão acessando área de Gestor)', () => {
    mockRequest.user = { id: '2', perfil: 'Cidadão' };
    
    const middleware = requireRole(['Admin', 'Gestor']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Validações
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Acesso negado. Perfil não autorizado.' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('deve retornar status 401 quando não houver usuário no request (não autenticado)', () => {
    mockRequest.user = undefined; // Simula a ausência de um token/sessão anterior
    
    const middleware = requireRole(['Gestor']);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    // Validações
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Não autorizado. Faça login para acessar.' });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});