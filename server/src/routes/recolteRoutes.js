const express = require('express');
const router = express.Router();
const { createRecolte, getRecoltes, updateRecolte, deleteRecolte } = require('../controllers/recolteController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createRecolte);
router.get('/', authenticateToken, getRecoltes);
router.put('/:id', authenticateToken, updateRecolte);
router.delete('/:id', authenticateToken, deleteRecolte);

module.exports = router;
