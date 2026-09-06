import express from 'express';
import { getMatches, initiateClaim, verifyOtp, submitProof, getMatchDetails } from '../controllers/match.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();
router.get('/', protect, getMatches);
router.get('/:matchId', protect, getMatchDetails);
router.post('/:matchId/initiate', protect, initiateClaim);
router.post('/verify-otp', protect, verifyOtp);
router.post('/proof', protect, upload.array('images', 3), submitProof);
export default router;
