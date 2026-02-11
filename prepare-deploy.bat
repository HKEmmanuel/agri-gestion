@echo off
echo ========================================
echo   PREPARATION DU DEPLOIEMENT
echo ========================================
echo.

echo Etape 1: Verification de Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Git n'est pas installe. Telechargez-le sur https://git-scm.com
    pause
    exit /b 1
)
echo [OK] Git est installe

echo.
echo Etape 2: Initialisation du depot Git...
if not exist .git (
    git init
    echo [OK] Depot Git initialise
) else (
    echo [OK] Depot Git deja initialise
)

echo.
echo Etape 3: Configuration Git...
set /p username="Entrez votre nom d'utilisateur GitHub: "
set /p email="Entrez votre email GitHub: "

git config user.name "%username%"
git config user.email "%email%"
echo [OK] Configuration Git terminee

echo.
echo Etape 4: Ajout des fichiers...
git add .
echo [OK] Fichiers ajoutes

echo.
echo Etape 5: Premier commit...
git commit -m "Initial commit - Agri-Gestion Platform"
echo [OK] Commit effectue

echo.
echo ========================================
echo   PROCHAINES ETAPES
echo ========================================
echo.
echo 1. Creez un depot sur GitHub: https://github.com/new
echo 2. Nommez-le: agri-gestion
echo 3. Executez ces commandes (remplacez VOTRE_USERNAME):
echo.
echo    git remote add origin https://github.com/VOTRE_USERNAME/agri-gestion.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 4. Consultez le fichier DEPLOIEMENT.md pour la suite
echo.
pause
