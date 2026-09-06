import Match from '../models/Match.model.js';
import Item from '../models/Item.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import { generateOtp } from '../utils/matching.util.js';
import { sendOtpEmail } from '../utils/email.util.js';

export const getMatches = async (req, res) => {
  try {
    const userItems = await Item.find({ reporter: req.user._id }).select('_id');
    const itemIds = userItems.map(i => i._id);
    const matches = await Match.find({
      $or: [{ lostItem: { $in: itemIds } }, { foundItem: { $in: itemIds } }]
    })
    .populate({ path: 'lostItem', populate: { path: 'reporter', select: 'name avatar' }, select: '-hiddenDetails' })
    .populate({ path: 'foundItem', populate: { path: 'reporter', select: 'name avatar' }, select: '-hiddenDetails' })
    .sort('-createdAt');
    res.json({ success: true, matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const initiateClaim = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate({ path: 'lostItem', populate: { path: 'reporter' } })
      .populate({ path: 'foundItem', populate: { path: 'reporter' } });

    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    if (match.status !== 'pending') return res.status(400).json({ success: false, message: 'Claim already initiated' });

    const lostOwner = match.lostItem.reporter;
    const foundOwner = match.foundItem.reporter;
    const isParty = [lostOwner._id.toString(), foundOwner._id.toString()].includes(req.user._id.toString());
    if (!isParty) return res.status(403).json({ success: false, message: 'Not authorized' });

    // Generate OTPs for both parties
    const lostOtp = generateOtp();
    const foundOtp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60000);

    match.status = 'acknowledged';
    match.initiatedBy = req.user._id;
    match.verificationData = {
      lostOwnerOtpSent: true,
      foundOwnerOtpSent: true,
      lostOwnerOtp: lostOtp,
      foundOwnerOtp: foundOtp,
      otpExpiry,
      lostOwnerVerified: false,
      foundOwnerVerified: false
    };
    await match.save();

    // Send OTPs to both parties
    await sendOtpEmail(lostOwner.email, lostOtp, 'claim verification');
    await sendOtpEmail(foundOwner.email, foundOtp, 'claim verification');

    // Notify both
    await Notification.create([
      { user: lostOwner._id, type: 'otp_sent', title: 'Claim Initiated', message: 'OTP sent to your email to verify your lost item claim', relatedMatch: match._id },
      { user: foundOwner._id, type: 'claim_received', title: 'Claim Received', message: 'Someone initiated a claim on your found item. OTP sent to your email.', relatedMatch: match._id }
    ]);

    res.json({ success: true, message: 'Claim initiated. OTP sent to both parties.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { matchId, otp } = req.body;
    const match = await Match.findById(matchId)
      .populate({ path: 'lostItem', populate: { path: 'reporter' } })
      .populate({ path: 'foundItem', populate: { path: 'reporter' } });

    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    const vd = match.verificationData;
    if (new Date() > vd.otpExpiry) return res.status(400).json({ success: false, message: 'OTP expired' });

    const userId = req.user._id.toString();
    const lostOwnerId = match.lostItem.reporter._id.toString();
    const foundOwnerId = match.foundItem.reporter._id.toString();

    if (userId === lostOwnerId && vd.lostOwnerOtp === otp) {
      match.verificationData.lostOwnerVerified = true;
    } else if (userId === foundOwnerId && vd.foundOwnerOtp === otp) {
      match.verificationData.foundOwnerVerified = true;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Both verified - resolve
    if (match.verificationData.lostOwnerVerified && match.verificationData.foundOwnerVerified) {
      match.status = 'resolved';
      match.resolvedAt = new Date();
      await Item.findByIdAndUpdate(match.lostItem._id, { status: 'resolved' });
      await Item.findByIdAndUpdate(match.foundItem._id, { status: 'resolved' });
      await User.findByIdAndUpdate(lostOwnerId, { $inc: { itemsReturned: 1 } });
      await User.findByIdAndUpdate(foundOwnerId, { $inc: { itemsReturned: 1 } });

      await Notification.create([
        { user: lostOwnerId, type: 'item_resolved', title: '✅ Item Recovered!', message: `Your lost item "${match.lostItem.title}" has been successfully returned!`, relatedMatch: match._id },
        { user: foundOwnerId, type: 'item_resolved', title: '✅ Item Returned!', message: `The found item has been returned to its owner.`, relatedMatch: match._id }
      ]);
    } else {
      match.status = 'verified';
    }

    await match.save();
    res.json({ success: true, message: 'OTP verified successfully', match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitProof = async (req, res) => {
  try {
    const { matchId, description } = req.body;
    const images = req.files?.map(f => `/uploads/items/${f.filename}`) || [];
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    match.proofSubmitted = { description, images, submittedAt: new Date() };
    await match.save();
    res.json({ success: true, message: 'Proof submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMatchDetails = async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate({ path: 'lostItem', populate: { path: 'reporter', select: 'name avatar' } })
      .populate({ path: 'foundItem', populate: { path: 'reporter', select: 'name avatar' } });
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
    res.json({ success: true, match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
