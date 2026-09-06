import express from 'express';
import { getNotifications, markRead, deleteNotification } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/', protect, getNotifications);
router.put('/mark-read', protect, markRead);
router.delete('/:id', protect, deleteNotification);
export default router;
