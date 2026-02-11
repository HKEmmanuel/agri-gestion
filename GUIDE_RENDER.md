# 🔗 Guide : Connecter GitHub à Render

## Étape par Étape avec Captures d'Écran

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :
- ✅ Un compte GitHub avec votre code poussé
- ✅ Un compte Render.com (gratuit)

---

## 🎯 Partie 1 : Créer la Base de Données PostgreSQL sur Render

### Étape 1.1 : Accéder à Render
1. Allez sur **https://render.com**
2. Cliquez sur **"Sign In"** ou **"Get Started"**
3. Connectez-vous avec GitHub (recommandé) ou email

### Étape 1.2 : Créer une Base de Données
1. Une fois connecté, vous verrez le **Dashboard Render**
2. Cliquez sur le bouton **"New +"** en haut à droite
3. Dans le menu déroulant, sélectionnez **"PostgreSQL"**

```
┌─────────────────────────────────────┐
│  Dashboard                    New + │
│                                  ▼  │
│  ┌──────────────────────────────┐  │
│  │  Web Service                 │  │
│  │  Static Site                 │  │
│  │  PostgreSQL          ◄────── │  │ Cliquez ici
│  │  Redis                       │  │
│  │  Cron Job                    │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Étape 1.3 : Configurer la Base de Données
Remplissez le formulaire :

| Champ | Valeur à entrer |
|-------|-----------------|
| **Name** | `agri-gestion-db` |
| **Database** | `agri_gestion` |
| **User** | `agri_user` (ou laissez par défaut) |
| **Region** | `Frankfurt (EU Central)` ou le plus proche |
| **PostgreSQL Version** | Laissez la dernière version |
| **Plan** | **Free** ⚠️ IMPORTANT |

4. Cliquez sur **"Create Database"**

### Étape 1.4 : Récupérer l'URL de Connexion
1. Attendez 1-2 minutes que la base soit créée
2. Sur la page de la base de données, cherchez la section **"Connections"**
3. Copiez l'**"Internal Database URL"** (commence par `postgresql://`)

```
┌──────────────────────────────────────────────────────────┐
│  agri-gestion-db                                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Connections                                       │ │
│  │                                                    │ │
│  │  Internal Database URL                            │ │
│  │  postgresql://agri_user:XXXXX@dpg-...render.com  │ │
│  │  [Copy] ◄───────────────────────────────────────  │ │ Copiez ceci !
│  │                                                    │ │
│  │  External Database URL                            │ │
│  │  postgresql://agri_user:XXXXX@dpg-...render.com  │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

⚠️ **IMPORTANT** : Gardez cette URL dans un fichier texte, vous en aurez besoin !

---

## 🚀 Partie 2 : Connecter GitHub et Déployer le Backend

### Étape 2.1 : Autoriser Render à Accéder à GitHub

1. Retournez au **Dashboard Render**
2. Cliquez sur **"New +"** → **"Web Service"**

```
┌─────────────────────────────────────────────────────────┐
│  Create a new Web Service                               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  You build it. We run it.                          │ │
│  │                                                     │ │
│  │  [Connect GitHub]  ◄──────────────────────────────  │ │ Cliquez ici
│  │                                                     │ │
│  │  Or deploy from a Git repository                   │ │
│  │  [Public Git repository]                           │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

3. Une fenêtre GitHub s'ouvre vous demandant d'autoriser Render
4. Cliquez sur **"Authorize Render"**

### Étape 2.2 : Sélectionner Votre Dépôt

1. Vous verrez la liste de vos dépôts GitHub
2. Cherchez **"agri-gestion"** (ou le nom que vous avez donné)
3. Cliquez sur **"Connect"** à côté du dépôt

```
┌─────────────────────────────────────────────────────────┐
│  Select a repository                                    │
│                                                          │
│  Search: [agri-gestion____________]  [🔍]               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  📁 VOTRE_USERNAME/agri-gestion                    │ │
│  │     Updated 5 minutes ago                          │ │
│  │                                    [Connect] ◄────  │ │ Cliquez ici
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  📁 VOTRE_USERNAME/autre-projet                    │ │
│  │     Updated 2 days ago                             │ │
│  │                                    [Connect]        │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Étape 2.3 : Configurer le Web Service

Remplissez le formulaire de configuration :

#### Section "General"

| Champ | Valeur |
|-------|--------|
| **Name** | `agri-gestion-api` |
| **Region** | `Frankfurt (EU Central)` (même région que la DB) |
| **Branch** | `main` |
| **Root Directory** | `server` ⚠️ IMPORTANT |
| **Runtime** | `Node` |

#### Section "Build & Deploy"

| Champ | Valeur |
|-------|--------|
| **Build Command** | `npm install && npx prisma generate && npx prisma migrate deploy` |
| **Start Command** | `npm start` |

```
┌──────────────────────────────────────────────────────────┐
│  Build & Deploy                                          │
│                                                           │
│  Build Command                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ npm install && npx prisma generate &&               │ │
│  │ npx prisma migrate deploy                           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Start Command                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ npm start                                            │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Étape 2.4 : Ajouter les Variables d'Environnement

1. Descendez jusqu'à la section **"Environment Variables"**
2. Cliquez sur **"Add Environment Variable"**
3. Ajoutez ces 4 variables :

#### Variable 1 : DATABASE_URL
```
Key:   DATABASE_URL
Value: postgresql://agri_user:XXXXX@dpg-...render.com/agri_gestion
       ↑ Collez l'Internal Database URL de l'Étape 1.4
```

#### Variable 2 : JWT_SECRET
```
Key:   JWT_SECRET
Value: agri_secret_key_2024_production_secure_123456789
       ↑ Créez une clé aléatoire longue et complexe
```

#### Variable 3 : NODE_ENV
```
Key:   NODE_ENV
Value: production
```

#### Variable 4 : PORT
```
Key:   PORT
Value: 3000
```

Votre écran devrait ressembler à :

```
┌──────────────────────────────────────────────────────────┐
│  Environment Variables                                   │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Key: DATABASE_URL                                   │ │
│  │ Value: postgresql://agri_user:XXXXX@dpg-...        │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Key: JWT_SECRET                                     │ │
│  │ Value: agri_secret_key_2024_production_secure_...  │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Key: NODE_ENV                                       │ │
│  │ Value: production                                   │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Key: PORT                                           │ │
│  │ Value: 3000                                         │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  [+ Add Environment Variable]                            │
└──────────────────────────────────────────────────────────┘
```

### Étape 2.5 : Choisir le Plan Gratuit

1. Descendez jusqu'à **"Instance Type"**
2. Sélectionnez **"Free"** (0$/mois)

```
┌──────────────────────────────────────────────────────────┐
│  Instance Type                                           │
│                                                           │
│  ○ Starter      $7/month                                 │
│  ● Free         $0/month  ◄────────────────────────────  │ Sélectionnez
│                                                           │
│  ⚠️ Free instances spin down after 15 minutes of         │
│     inactivity. First request may take 30-60 seconds.   │
└──────────────────────────────────────────────────────────┘
```

### Étape 2.6 : Créer le Service

1. Cliquez sur le bouton **"Create Web Service"** en bas
2. Render va commencer le déploiement automatiquement

```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│                    [Create Web Service]  ◄──────────────  │ Cliquez ici
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## ⏳ Partie 3 : Suivre le Déploiement

### Étape 3.1 : Observer les Logs

Vous serez redirigé vers la page de logs :

```
┌──────────────────────────────────────────────────────────┐
│  agri-gestion-api                                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Logs                                              │  │
│  │                                                     │  │
│  │  ==> Cloning from https://github.com/...          │  │
│  │  ==> Checking out commit abc123...                │  │
│  │  ==> Running build command...                     │  │
│  │  ==> npm install                                  │  │
│  │      added 245 packages                           │  │
│  │  ==> npx prisma generate                          │  │
│  │      ✔ Generated Prisma Client                    │  │
│  │  ==> npx prisma migrate deploy                    │  │
│  │      1 migration applied                          │  │
│  │  ==> Build successful!                            │  │
│  │  ==> Starting service...                          │  │
│  │      Server running on port 3000                  │  │
│  │  ==> Service is live! 🎉                          │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Étape 3.2 : Récupérer l'URL de l'API

1. Une fois le déploiement terminé (5-10 minutes)
2. En haut de la page, vous verrez l'URL de votre API
3. Copiez cette URL (ex: `https://agri-gestion-api.onrender.com`)

```
┌──────────────────────────────────────────────────────────┐
│  agri-gestion-api                    ● Live              │
│                                                           │
│  https://agri-gestion-api.onrender.com  [Copy] ◄──────   │ Copiez ceci !
│                                                           │
│  [Logs] [Events] [Environment] [Settings]                │
└──────────────────────────────────────────────────────────┘
```

### Étape 3.3 : Tester l'API

1. Ouvrez un nouvel onglet de navigateur
2. Allez sur : `https://agri-gestion-api.onrender.com`
3. Vous devriez voir :

```json
{
  "message": "Welcome to Agri-Management API"
}
```

✅ **Félicitations ! Votre backend est en ligne !**

---

## 🎯 Récapitulatif

Vous avez maintenant :
- ✅ Une base de données PostgreSQL sur Render
- ✅ Un backend Node.js connecté à GitHub
- ✅ Une API accessible publiquement

### 📝 Informations à Noter

Gardez ces informations dans un fichier texte :

```
Base de données :
- Nom : agri-gestion-db
- URL : postgresql://agri_user:XXXXX@dpg-...render.com/agri_gestion

Backend API :
- Nom : agri-gestion-api
- URL : https://agri-gestion-api.onrender.com
- Dépôt : https://github.com/VOTRE_USERNAME/agri-gestion
```

---

## 🔄 Mises à Jour Automatiques

Maintenant, chaque fois que vous poussez du code sur GitHub :

```bash
git add .
git commit -m "Nouvelle fonctionnalité"
git push
```

Render détectera automatiquement le changement et redéploiera votre API ! 🚀

---

## ➡️ Prochaine Étape

Maintenant que votre backend est en ligne, passez au déploiement du frontend sur Vercel.

Consultez la section **"Étape 3 : Déployer le Frontend sur Vercel"** dans le fichier `DEPLOIEMENT.md`

---

## 🆘 Problèmes Courants

### Le build échoue
- Vérifiez que `Root Directory` est bien `server`
- Vérifiez que toutes les variables d'environnement sont définies

### Erreur de migration Prisma
- Vérifiez que `DATABASE_URL` est correct
- Assurez-vous que la base de données est bien créée

### Le service ne démarre pas
- Vérifiez les logs pour voir l'erreur exacte
- Vérifiez que `Start Command` est `npm start`

---

**Besoin d'aide ? Vérifiez les logs dans Render ou consultez la documentation complète !**
