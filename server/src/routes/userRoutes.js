const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  updateUserRole, 
  deleteUser, 
  getMe, 
  updateMe, 
  adminCreateUser, 
  adminUpdateUser 
} = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, updateMe);
router.get('/', authenticateToken, getAllUsers);
router.post('/', authenticateToken, adminCreateUser);
router.put('/:id', authenticateToken, adminUpdateUser);
router.put('/:id/role', authenticateToken, updateUserRole);
router.delete('/:id', authenticateToken, deleteUser);

module.exports = router;
