const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@agri.com';
  const password = 'admin123';
  const name = 'Administrateur Principal';
  const role = 'admin';

  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, role, name }
    });
    console.log('Utilisateur existant mis à jour en Admin :', updatedUser.email);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    });
    console.log('Nouvel Administrateur créé :', newUser.email);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
