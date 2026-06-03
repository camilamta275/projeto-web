import { Request, Response, NextFunction } from 'express';

// Interface para erros operacionais
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Mapeamento de erros Prisma para status HTTP
const prismaErrorMap: Record<string, { statusCode: number; message: string }> = {
  // Unique constraint violation
  P2002: {
    statusCode: 409,
    message: 'Este registro já existe (violação de restrição única).',
  },
  // Record not found
  P2025: {
    statusCode: 404,
    message: 'Registro não encontrado.',
  },
  // Foreign key constraint failed
  P2003: {
    statusCode: 400,
    message: 'Referência inválida: um ou mais registros relacionados não existem.',
  },
  // Required relation violated
  P2011: {
    statusCode: 400,
    message: 'Erro de relacionamento: campo obrigatório não fornecido.',
  },
  // Value out of range
  P2012: {
    statusCode: 400,
    message: 'Valor fora do intervalo permitido.',
  },
  // Unique constraint failed
  P2014: {
    statusCode: 409,
    message: 'Este valor já está em uso.',
  },
  // Database connection error
  P1000: {
    statusCode: 503,
    message: 'Falha ao conectar ao banco de dados. Tente novamente.',
  },
  // Database server error
  P5000: {
    statusCode: 503,
    message: 'Erro no servidor do banco de dados.',
  },
};

// Função para formatar timestamp
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Middleware de tratamento centralizado de erros
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const timestamp = getTimestamp();

  // 1. Erros operacionais (AppError)
  if (error instanceof AppError) {
    console.error(
      `[${timestamp}] AppError: ${error.statusCode} - ${error.message}`,
      error.details
    );

    return res.status(error.statusCode).json({
      error: error.message,
      statusCode: error.statusCode,
      timestamp,
      ...(error.details && { details: error.details }),
    });
  }

  // 2. Erros do Prisma
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    const code = prismaError.code;

    if (prismaErrorMap[code]) {
      const { statusCode, message } = prismaErrorMap[code];

      console.error(
        `[${timestamp}] PrismaError ${code}: ${message}`,
        prismaError.meta
      );

      return res.status(statusCode).json({
        error: message,
        code,
        statusCode,
        timestamp,
      });
    }

    // Erro Prisma desconhecido
    console.error(`[${timestamp}] Unknown PrismaError: ${code}`, prismaError);
    return res.status(500).json({
      error: 'Erro ao processar dados.',
      code,
      statusCode: 500,
      timestamp,
    });
  }

  // 3. Erros operacionais (AppError)
  if (error instanceof Error && error.message.includes('E-mail já cadastrado')) {
    console.warn(`[${timestamp}] Email Duplicate Error`);
    return res.status(409).json({
      error: error.message,
      statusCode: 409,
      timestamp,
    });
  }

  // 4. Token expirado / Erro JWT
  if (error.name === 'TokenExpiredError') {
    console.warn(`[${timestamp}] TokenExpiredError`);
    return res.status(401).json({
      error: 'Token expirado. Faça login novamente.',
      statusCode: 401,
      timestamp,
    });
  }

  if (error.name === 'JsonWebTokenError') {
    console.warn(`[${timestamp}] JsonWebTokenError: ${error.message}`);
    return res.status(401).json({
      error: 'Token inválido.',
      statusCode: 401,
      timestamp,
    });
  }

  // 4. Erro de validação
  if (error.name === 'ValidationError') {
    console.warn(`[${timestamp}] ValidationError: ${error.message}`);
    return res.status(400).json({
      error: error.message,
      statusCode: 400,
      timestamp,
    });
  }

  // 5. Erros inesperados / não tratados
  console.error(`[${timestamp}] Unexpected Error:`, error);

  // Em produção, não expõe stack trace
  const isDevelopment = process.env.NODE_ENV === 'development';

  return res.status(500).json({
    error: 'Erro interno do servidor.',
    statusCode: 500,
    timestamp,
    ...(isDevelopment && { stack: error.stack }),
  });
};

// Wrapper para capturar erros em funções async
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
