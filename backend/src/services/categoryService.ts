import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorMiddleware';

export const categoryService = {
  async findAll() {
    return prisma.categoria.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, descricao: true },
      orderBy: { nome: 'asc' },
    });
  },

  async findById(id: number) {
    const categoria = await prisma.categoria.findUnique({
      where: { id },
      select: { id: true, nome: true, descricao: true, ativo: true },
    });
    if (!categoria || !categoria.ativo) {
      throw new AppError(404, `Categoria ${id} não encontrada.`);
    }
    return categoria;
  },
};
