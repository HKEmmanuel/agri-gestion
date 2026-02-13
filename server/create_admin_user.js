require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@agri-gestion.com';
    const password = 'admin123';
    const name = 'Administrateur';
    const role = 'admin';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`L'utilisateur ${email} existe déjà.`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    console.log('Compte administrateur créé avec succès !');
    console.log('Email:', user.email);
    console.log('Mot de passe:', password);
    console.log('Role:', user.role);

  } catch (error) {
    console.error('Erreur lors de la création du compte administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
