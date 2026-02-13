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
      // On s'assure que l'utilisateur est admin ET que son mot de passe est réinitialisé par sécurité
      await prisma.user.update({
        where: { email: adminEmail },
        data: { 
          role: 'admin',
          password: hashedPassword 
        }
      });
      console.log(`Compte admin synchronisé : ${adminEmail}`);
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
