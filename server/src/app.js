const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const exploitationRoutes = require('./routes/exploitationRoutes');
const parcelleRoutes = require('./routes/parcelleRoutes');
const cultureRoutes = require('./routes/cultureRoutes');
const chargeRoutes = require('./routes/chargeRoutes');
const recolteRoutes = require('./routes/recolteRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// CORS configuration for production and development
const corsOptions = {
  origin: '*', // Allow all origins for debugging
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors()); // Use default CORS for now (allows all)
app.options('*', cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Agri-Management API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/exploitations', exploitationRoutes);
app.use('/api/parcelles', parcelleRoutes);
app.use('/api/cultures', cultureRoutes);
app.use('/api/charges', chargeRoutes);
app.use('/api/recoltes', recolteRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
