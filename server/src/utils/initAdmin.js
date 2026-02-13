const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const initAdmin = async () => {
  try {
    const adminEmail = 'admin@agri-gestion.com';
    const adminPassword = 'admin123';
    
    // Rechercher l'utilisateur spécifique
    const user = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (user) {
      // Si l'utilisateur existe déjà, on s'assure qu'il est admin
      if (user.role !== 'admin') {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: 'admin' }
        });
        console.log(`Rôle admin forcé pour : ${adminEmail}`);
      }
    } else {
      // S'il n'existe pas, on le crée
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Administrateur',
          role: 'admin'
        }
      });
      console.log(`Compte administrateur créé : ${adminEmail}`);
    }
  } catch (error) {
    console.error('Erreur lors de l’initialisation de l’administrateur:', error.message);
  }
};

module.exports = initAdmin;
