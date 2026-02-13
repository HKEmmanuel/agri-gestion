const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const initAdmin = async () => {
  try {
    const adminEmail = 'admin@agri-gestion.com';
    const adminPassword = 'admin123';
    
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: adminEmail },
          { role: 'admin' }
        ]
      }
    });

    if (!existingAdmin) {
      console.log('--- Initialisation du compte administrateur ---');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Administrateur',
          role: 'admin'
        }
      });
      console.log('Compte administrateur créé avec succès.');
      console.log('Email:', adminEmail);
      console.log('Mot de passe:', adminPassword);
    } else {
      console.log('Compte administrateur déjà présent.');
    }
  } catch (error) {
    console.error('Erreur lors de l’initialisation de l’administrateur:', error.message);
  }
};

module.exports = initAdmin;
