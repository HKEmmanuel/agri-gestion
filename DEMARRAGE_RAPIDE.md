# 🚀 Guide de Démarrage Rapide

## Option 1 : Déploiement Automatique (Recommandé)

### Étape 1 : Préparer Git
Double-cliquez sur `prepare-deploy.bat` et suivez les instructions.

### Étape 2 : Créer un dépôt GitHub
1. Allez sur https://github.com/new
2. Nom : `agri-gestion`
3. Cliquez sur "Create repository"

### Étape 3 : Pousser le code
```bash
git remote add origin https://github.com/VOTRE_USERNAME/agri-gestion.git
git branch -M main
git push -u origin main
```

### Étape 4 : Déployer sur Render (Backend)
1. Allez sur https://render.com
2. Créez une base PostgreSQL (Free)
3. Créez un Web Service lié à votre dépôt GitHub
4. Root Directory: `server`
5. Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
6. Start Command: `npm start`
7. Ajoutez les variables d'environnement (voir DEPLOIEMENT.md)

### Étape 5 : Déployer sur Vercel (Frontend)
1. Allez sur https://vercel.com
2. Importez votre dépôt GitHub
3. Root Directory: `client`
4. Framework: Vite
5. Ajoutez la variable: `VITE_API_URL=https://votre-api.onrender.com`
6. Déployez !

### Étape 6 : Partagez le lien !
Votre URL Vercel (ex: `https://agri-gestion.vercel.app`) est prête à être partagée !

---

## Option 2 : Test Local

### Backend
```bash
cd server
npm install
# Configurez .env avec votre base de données
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd client
npm install
# Créez .env avec VITE_API_URL=http://localhost:3000
npm run dev
```

Accédez à `http://localhost:5173`

---

## 🆘 Besoin d'aide ?

Consultez **DEPLOIEMENT.md** pour un guide détaillé étape par étape.
