import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorMiddleware';

export const userService = {
  async findById(id: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      throw new AppError(
        400,
        'ID inválido. O ID deve estar no formato UUID.'
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        status: true,
        criadoem: true,
        atualizadoem: true,
        atualizadopor: true,
      },
    });

    if (!usuario) {
      throw new AppError(
        404,
        'Usuário não encontrado.'
      );
    }

    return usuario;
  },
};