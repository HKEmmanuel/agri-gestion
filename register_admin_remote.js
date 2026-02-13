async function createAdmin() {
  const apiUrl = 'https://agri-gestion-api.onrender.com'; // Probable backend URL
  const credentials = {
    email: 'admin@agri-gestion.com',
    password: 'admin123',
    name: 'Administrateur',
    role: 'admin'
  };

  try {
    console.log(`Tentative de création de l'admin sur ${apiUrl}...`);
    const response = await fetch(`${apiUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Succès ! Compte administrateur créé.');
      console.log('Email:', credentials.email);
      console.log('Mot de passe:', credentials.password);
    } else {
      console.error('Échec:', data.message || data.error);
    }
  } catch (err) {
    console.error('Erreur réseau:', err.message);
    console.log('Vérifiez si l\'URL de l\'API est correcte ou si le serveur est en veille.');
  }
}

createAdmin();
