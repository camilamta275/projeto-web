import { prisma } from '../config/prisma';

export const categoryService = {
  async findAll() {
    const categorias = await prisma.categoria.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, descricao: true },
      orderBy: { nome: 'asc' },
    });
    return categorias;
  },
};
