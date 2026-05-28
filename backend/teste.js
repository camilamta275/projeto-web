const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// 1. O Prisma 7 exige que a conexão passe primeiro pelo driver nativo (pg)
const pool = new Pool({ 
  connectionString: "postgresql://postgres:BacoExu@localhost:5050/fiscalize?schema=public" 
});

// 2. Criamos o adaptador do Postgres para o Prisma
const adapter = new PrismaPg(pool);

// 3. Inicializamos o Prisma passando o adaptador exigido pela versão 7
const prisma = new PrismaClient({ adapter });

async function testarConexao() {
  try {
    console.log("⏳ Tentando conectar ao banco fiscalize...");
    const categorias = await prisma.categoria.findMany();
    
    console.log("✅ Conexão realizada com sucesso! 🎉\n");
    console.table(categorias);
  } catch (erro) {
    console.error("❌ Ops! Deu um erro ao conectar:", erro);
  } finally {
    // É importante fechar a conexão do Prisma e o Pool do pg
    await prisma.$disconnect();
    await pool.end();
  }
}

testarConexao();