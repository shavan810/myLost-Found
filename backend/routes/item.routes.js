import express from 'express';
import { createItem, getItems, getItem, updateItem, deleteItem, getMyItems, getStats } from '../controllers/item.controller.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();
router.get('/stats', getStats);
router.get('/my', protect, getMyItems);
router.get('/', getItems);
router.get('/:id', optionalAuth, getItem);
router.post('/', protect, upload.array('images', 5), createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);
export default router;
