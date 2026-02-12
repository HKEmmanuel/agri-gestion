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
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://agri-gestion.vercel.app',  
      'https://agri-gestion.onrender.com',
      /\.vercel\.app$/,  // Allow all Vercel deployments
      /\.onrender\.com$/ // Allow Render deployments
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
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
