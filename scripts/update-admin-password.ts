import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const NEW_PASSWORD = 'Admin@2026';
const ADMIN_EMAILS = [
  'vedararetreat@gmail.com',
  'admin@vedara.com',
];

async function main() {
  console.log('Updating admin passwords...');

  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 12);

  for (const email of ADMIN_EMAILS) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`  ${email} — not found, creating...`);
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: email === 'vedararetreat@gmail.com' ? 'Vedara Admin' : 'Vedara Admin (alt)',
          role: 'SUPER_ADMIN',
          phone: '+91-9118882242',
          isActive: true,
        },
      });
      console.log(`  ${email} — created with password ${NEW_PASSWORD}`);
    } else {
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          isActive: true,
          lockoutUntil: null,
        },
      });
      console.log(`  ${email} — password updated to ${NEW_PASSWORD}`);
    }
  }

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
