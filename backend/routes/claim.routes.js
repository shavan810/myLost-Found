import express from 'express';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
// Claim routes are handled via match routes
export default router;
