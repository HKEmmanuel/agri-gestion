const express = require('express');
const router = express.Router();
const { createCharge, getCharges, updateCharge, deleteCharge } = require('../controllers/chargeController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createCharge);
router.get('/', authenticateToken, getCharges);
router.put('/:id', authenticateToken, updateCharge);
router.delete('/:id', authenticateToken, deleteCharge);

module.exports = router;
