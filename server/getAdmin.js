const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { id: 1 }
  });
  console.log('EMAIL:', user.email);
  console.log('ROLE:', user.role);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
