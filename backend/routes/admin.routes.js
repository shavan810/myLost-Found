import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';
import {
  adminLogin, adminForgotPassword, adminResetPassword,
  getDashboardStats, getAllUsers, deleteUser, banUser,
  getAllItems, deleteItem
} from '../controllers/admin.controller.js';

const router = express.Router();

// Public admin auth routes
router.post('/login', adminLogin);
router.post('/forgot-password', adminForgotPassword);
router.post('/reset-password', adminResetPassword);

// Protected admin routes
router.use(protect, isAdmin);
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/ban', banUser);
router.get('/items', getAllItems);
router.delete('/items/:id', deleteItem);

export default router;
