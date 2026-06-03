const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  const passwordHash = await bcrypt.hash('Admin1234', 10);

  // Usuario admin
  await prisma.usuario.upsert({
    where: { email: 'admin@techos.cl' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@techos.cl',
      passwordHash,
      rol: 'admin',
    },
  });

  // Usuario coordinador logística
  await prisma.usuario.upsert({
    where: { email: 'bodega@techos.cl' },
    update: {},
    create: {
      nombre: 'Coordinador Bodega',
      email: 'bodega@techos.cl',
      passwordHash,
      rol: 'coordinador_logistica',
    },
  });

  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
