import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await argon2.hash('Admin@123');

  const office = await prisma.office.upsert({
    where: { slug: 'escritorio-demo' },
    update: {},
    create: {
      name: 'Escritório Demo Contabilidade',
      slug: 'escritorio-demo',
      document: '11222333000181',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@fiscalflow.dev' },
    update: {},
    create: {
      officeId: office.id,
      name: 'Administrador Demo',
      email: 'admin@fiscalflow.dev',
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  await prisma.company.upsert({
    where: { officeId_cnpj: { officeId: office.id, cnpj: '11222333000181' } },
    update: {},
    create: {
      officeId: office.id,
      cnpj: '11222333000181',
      razaoSocial: 'Empresa Exemplo LTDA',
      nomeFantasia: 'Empresa Exemplo',
    },
  });

  console.log('Seed concluído. Login de teste: admin@fiscalflow.dev / Admin@123');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
