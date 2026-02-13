const { Client } = require('pg');
const url = "postgresql://agri_user:P1fi6nrUxkZaKTHWHY4NH7kAGmSxrnf6@dpg-d66et7bnv86c738pvbtg-a.frankfurt-postgres.render.com/agri_gestion";

async function test() {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log("Connecté !");
    await client.end();
  } catch (err) {
    console.error("Échec:", err.message);
  }
}
test();
