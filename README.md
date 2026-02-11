# 🌾 Agri-Gestion - Plateforme de Gestion Agricole

Une application web moderne pour la gestion d'exploitations agricoles en Côte d'Ivoire.

## 📋 Fonctionnalités

### Pour les Exploitants
- ✅ Gestion des exploitations agricoles
- ✅ Gestion des parcelles et cultures
- ✅ Suivi des charges et dépenses
- ✅ Enregistrement des récoltes et revenus
- ✅ Tableaux de bord avec graphiques
- ✅ Génération de rapports PDF
- ✅ Calcul automatique des marges bénéficiaires

### Pour les Administrateurs
- ✅ Gestion des utilisateurs (CRUD)
- ✅ Validation des cultures
- ✅ Statistiques globales de la plateforme
- ✅ Filtres par région et période
- ✅ Export Excel des données
- ✅ Vue d'ensemble de toutes les exploitations

## 🛠️ Technologies Utilisées

### Frontend
- **React** 19.2 - Interface utilisateur
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Recharts** - Graphiques
- **jsPDF** - Génération de PDF
- **XLSX** - Export Excel
- **Lucide React** - Icônes

### Backend
- **Node.js** + **Express** - Serveur API
- **Prisma** - ORM
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **bcryptjs** - Hashage des mots de passe

## 🚀 Installation Locale

### Prérequis
- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

### 1. Cloner le projet
```bash
git clone https://github.com/VOTRE_USERNAME/agri-gestion.git
cd agri-gestion
```

### 2. Configuration du Backend

```bash
cd server
npm install

# Créer le fichier .env
echo "DATABASE_URL=postgresql://user:password@localhost:5432/agri_gestion
JWT_SECRET=votre_cle_secrete_tres_longue
PORT=3000" > .env

# Initialiser la base de données
npx prisma migrate dev
npx prisma generate

# Démarrer le serveur
npm run dev
```

### 3. Configuration du Frontend

```bash
cd ../client
npm install

# Créer le fichier .env
echo "VITE_API_URL=http://localhost:3000" > .env

# Démarrer l'application
npm run dev
```

### 4. Accéder à l'application

Ouvrez votre navigateur sur : `http://localhost:5173`

## 📦 Déploiement en Production

Consultez le fichier **[DEPLOIEMENT.md](./DEPLOIEMENT.md)** pour un guide complet de déploiement sur :
- **Render.com** (Backend + Base de données)
- **Vercel** (Frontend)

## 👥 Comptes de Test

### Exploitant
- Email: `exploitant@test.com`
- Mot de passe: `password123`

### Administrateur
- Email: `admin@test.com`
- Mot de passe: `admin123`

## 📸 Captures d'Écran

### Tableau de Bord Exploitant
![Dashboard](./screenshots/dashboard.png)

### Panel Administrateur
![Admin](./screenshots/admin.png)

## 🗂️ Structure du Projet

```
agri-gestion/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── context/       # Context API (Auth)
│   │   └── services/      # Services API
│   └── package.json
│
├── server/                # Backend Express
│   ├── src/
│   │   ├── controllers/  # Logique métier
│   │   ├── routes/       # Routes API
│   │   ├── middleware/   # Middlewares (auth, etc.)
│   │   └── app.js        # Configuration Express
│   ├── prisma/
│   │   └── schema.prisma # Schéma de base de données
│   └── package.json
│
└── DEPLOIEMENT.md        # Guide de déploiement
```

## 🔐 Sécurité

- ✅ Authentification JWT
- ✅ Mots de passe hashés avec bcrypt
- ✅ Protection CORS
- ✅ Validation des données avec Zod
- ✅ Séparation des rôles (exploitant/admin)

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 License

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Développé avec ❤️ pour la modernisation de l'agriculture en Côte d'Ivoire

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation dans `/docs`

---

**⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile sur GitHub !**
