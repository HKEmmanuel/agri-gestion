# 🌾 Guide de Déploiement - Agri-Gestion

Ce guide vous explique comment déployer votre application en ligne gratuitement.

## 📋 Prérequis

1. Un compte GitHub (gratuit)
2. Un compte Render.com (gratuit)
3. Un compte Vercel (gratuit)

---

## 🗂️ Étape 1 : Préparer le Code sur GitHub

### 1.1 Créer un dépôt GitHub

1. Allez sur https://github.com et connectez-vous
2. Cliquez sur le bouton **"New"** (nouveau dépôt)
3. Nommez-le `agri-gestion` ou un nom de votre choix
4. Laissez-le **Public** (ou Private si vous préférez)
5. Cliquez sur **"Create repository"**

### 1.2 Pousser votre code

Ouvrez un terminal dans le dossier `d:\agri_projet_tutore` et exécutez :

```bash
# Initialiser git (si pas déjà fait)
git init

# Créer un fichier .gitignore
echo "node_modules/
.env
dist/
*.log
.DS_Store" > .gitignore

# Ajouter tous les fichiers
git add .

# Faire un commit
git commit -m "Initial commit - Agri-Gestion"

# Lier au dépôt GitHub (remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/VOTRE_USERNAME/agri-gestion.git

# Pousser le code
git branch -M main
git push -u origin main
```

---

## 🗄️ Étape 2 : Déployer la Base de Données et le Backend sur Render

### 2.1 Créer la base de données PostgreSQL

1. Allez sur https://render.com et connectez-vous
2. Cliquez sur **"New +"** → **"PostgreSQL"**
3. Configurez :
   - **Name** : `agri-gestion-db`
   - **Database** : `agri_gestion`
   - **User** : `agri_user` (ou laissez par défaut)
   - **Region** : Choisissez la plus proche (ex: Frankfurt)
   - **Plan** : **Free**
4. Cliquez sur **"Create Database"**
5. **IMPORTANT** : Copiez l'**Internal Database URL** (elle commence par `postgresql://`)

### 2.2 Déployer le Backend (API)

1. Sur Render, cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre dépôt GitHub
3. Configurez :
   - **Name** : `agri-gestion-api`
   - **Region** : Même région que la base de données
   - **Branch** : `main`
   - **Root Directory** : `server`
   - **Runtime** : `Node`
   - **Build Command** : 
     ```
     npm install && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command** : 
     ```
     npm start
     ```
   - **Plan** : **Free**

4. **Variables d'environnement** (cliquez sur "Advanced" puis "Add Environment Variable") :
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Collez l'Internal Database URL de l'étape 2.1 |
   | `JWT_SECRET` | Générez une clé aléatoire (ex: `votre_cle_secrete_tres_longue_123456`) |
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |

5. Cliquez sur **"Create Web Service"**

6. **Attendez** que le déploiement se termine (5-10 minutes)

7. **Copiez l'URL** de votre API (ex: `https://agri-gestion-api.onrender.com`)

---

## 🌐 Étape 3 : Déployer le Frontend sur Vercel

### 3.1 Créer le fichier .env.production

Dans le dossier `client`, créez un fichier `.env.production` :

```bash
VITE_API_URL=https://agri-gestion-api.onrender.com
```

**Remplacez** `https://agri-gestion-api.onrender.com` par l'URL de votre API Render.

### 3.2 Déployer sur Vercel

1. Allez sur https://vercel.com et connectez-vous
2. Cliquez sur **"Add New..."** → **"Project"**
3. Importez votre dépôt GitHub `agri-gestion`
4. Configurez :
   - **Framework Preset** : `Vite`
   - **Root Directory** : `client`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
5. **Variables d'environnement** :
   
   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://agri-gestion-api.onrender.com` |

6. Cliquez sur **"Deploy"**

7. **Attendez** 2-3 minutes

8. **Votre application est en ligne !** 🎉

---

## 🔗 Étape 4 : Obtenir le Lien de Test

Une fois le déploiement terminé :

1. Vercel vous donnera une URL comme : `https://agri-gestion.vercel.app`
2. **C'est ce lien que vous enverrez à vos collaborateurs !**

---

## 👥 Étape 5 : Créer des Comptes de Test

### Option 1 : Via l'interface (si vous avez une page d'inscription)

Vos collaborateurs peuvent s'inscrire directement.

### Option 2 : Via la base de données (pour créer un admin)

1. Allez sur Render → Votre base de données
2. Cliquez sur **"Connect"** → **"External Connection"**
3. Utilisez un client PostgreSQL ou exécutez :

```sql
-- Se connecter à la base et créer un utilisateur admin
INSERT INTO "User" (name, email, password, role) 
VALUES ('Admin Test', 'admin@test.com', '$2a$10$HASH_DU_MOT_DE_PASSE', 'admin');
```

**Note** : Pour hasher le mot de passe, vous pouvez utiliser un script Node.js :

```javascript
const bcrypt = require('bcryptjs');
const password = 'motdepasse123';
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

---

## 🎯 Résumé des URLs

| Service | URL |
|---------|-----|
| **Frontend (Application)** | `https://agri-gestion.vercel.app` |
| **Backend (API)** | `https://agri-gestion-api.onrender.com` |
| **Base de données** | Interne à Render |

---

## ⚠️ Notes Importantes

1. **Plan Gratuit Render** : L'API s'endort après 15 minutes d'inactivité. Le premier accès peut prendre 30-60 secondes.

2. **Mise à jour** : Pour mettre à jour l'application :
   ```bash
   git add .
   git commit -m "Description des changements"
   git push
   ```
   Vercel et Render redéploieront automatiquement.

3. **Logs** : Pour voir les erreurs :
   - **Backend** : Render Dashboard → Logs
   - **Frontend** : Vercel Dashboard → Deployments → View Function Logs

---

## 🆘 Problèmes Courants

### L'API ne répond pas
- Vérifiez que `DATABASE_URL` est bien configuré
- Vérifiez les logs sur Render

### Erreur CORS
- Assurez-vous que le backend autorise l'origine Vercel dans `server/src/server.js`

### La page est blanche
- Vérifiez que `VITE_API_URL` est bien configuré sur Vercel
- Vérifiez les logs de la console du navigateur (F12)

---

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
1. Les logs Render (backend)
2. Les logs Vercel (frontend)
3. La console du navigateur (F12)

Bonne chance ! 🚀
