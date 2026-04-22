import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME ?? 'System Admin';

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required to run seed',
    );
  }

  const roleNames = ['ADMIN', 'CAJERO', 'INVENTARIO'];

  await prisma.$transaction(
    roleNames.map((roleName) =>
      prisma.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      }),
    ),
  );

  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  if (!adminRole) {
    throw new Error('ADMIN role could not be created');
  }

  const normalizedEmail = adminEmail.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      name: adminName,
      password: passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
    create: {
      name: adminName,
      email: normalizedEmail,
      password: passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed completed: roles ensured and admin user upserted');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
