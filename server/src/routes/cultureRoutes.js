const express = require('express');
const router = express.Router();
const { createCulture, getCultures, getCultureById, updateCulture, deleteCulture } = require('../controllers/cultureController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createCulture);
router.get('/', authenticateToken, getCultures);
router.get('/:id', authenticateToken, getCultureById);
router.put('/:id', authenticateToken, updateCulture);
router.delete('/:id', authenticateToken, deleteCulture);

module.exports = router;
