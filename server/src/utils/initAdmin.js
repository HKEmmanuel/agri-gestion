const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const initAdmin = async () => {
  try {
    const adminEmail = 'admin@agri-gestion.com';
    const adminPassword = 'admin123';
    
    const accounts = [
      { email: 'admin@agri-gestion.com', password: 'admin123', name: 'Admin Principal' },
      { email: 'admin@test.com', password: 'admin123', name: 'Admin de Secours' }
    ];

    for (const acc of accounts) {
      const user = await prisma.user.findUnique({ where: { email: acc.email } });
      const hashedPassword = await bcrypt.hash(acc.password, 10);

      if (user) {
        await prisma.user.update({
          where: { email: acc.email },
          data: { role: 'admin', password: hashedPassword }
        });
        console.log(`[INIT] Compte synchronisé : ${acc.email}`);
      } else {
        await prisma.user.create({
          data: { email: acc.email, password: hashedPassword, name: acc.name, role: 'admin' }
        });
        console.log(`[INIT] Compte créé : ${acc.email}`);
      }
    }
  } catch (error) {
    console.error('Erreur lors de l’initialisation de l’administrateur:', error.message);
  }
};

module.exports = initAdmin;
