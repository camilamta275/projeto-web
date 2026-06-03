import { prisma } from '../src/config/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Variáveis de ambiente para criar admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@fiscalize.gov.br';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.SEED_ADMIN_NAME || 'Administrador';

  try {
    // 1. Verificar se admin já existe
    const adminExistente = await prisma.usuario.findUnique({
      where: { email: adminEmail },
    });

    if (adminExistente) {
      console.log(`✓ Admin já existe: ${adminEmail}`);
      return;
    }

    // 2. Hash da senha
    const senhaHash = await bcrypt.hash(adminPassword, 10);

    // 3. Gerar UUID para o usuário
    const adminId = uuidv4();

    // 4. Criar usuário admin
    const usuarioAdmin = await prisma.usuario.create({
      data: {
        id: adminId,
        nome: adminName,
        email: adminEmail,
        senha: senhaHash,
        perfil: 'Admin',
        status: 'Ativo',
      },
    });

    console.log(`✓ Usuário Admin criado com sucesso!`);
    console.log(`  └─ ID: ${usuarioAdmin.id}`);
    console.log(`  └─ Email: ${usuarioAdmin.email}`);
    console.log(`  └─ Perfil: ${usuarioAdmin.perfil}`);

    // 5. Criar registro na tabela admin
    const adminRecord = await prisma.admin.create({
      data: {
        id: adminId,
        nivel_acesso: 'Super Admin',
        permissao_escopo: 'Global',
        ativo: true,
      },
    });

    console.log(`✓ Registro Admin criado com sucesso!`);
    console.log(`  └─ Nível: ${adminRecord.nivel_acesso}`);
    console.log(`  └─ Escopo: ${adminRecord.permissao_escopo}\n`);

    console.log('✅ Seed completado com sucesso!');
    console.log('\n📝 Credenciais de teste:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminPassword}\n`);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
