export default async function globalTeardown() {
  const { prisma } = require('../../config/prisma');
  await prisma.$disconnect();
}
