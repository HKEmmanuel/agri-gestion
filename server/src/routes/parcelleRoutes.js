const express = require('express');
const router = express.Router();
const { createParcelle, getParcelles, getParcelleById, updateParcelle, deleteParcelle } = require('../controllers/parcelleController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createParcelle);
router.get('/', authenticateToken, getParcelles);
router.get('/:id', authenticateToken, getParcelleById);
router.put('/:id', authenticateToken, updateParcelle);
router.delete('/:id', authenticateToken, deleteParcelle);

module.exports = router;
