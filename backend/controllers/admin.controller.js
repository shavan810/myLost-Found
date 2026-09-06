import User from '../models/User.model.js';
import Item from '../models/Item.model.js';
import Match from '../models/Match.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { generateOtp } from '../utils/matching.util.js';
import { sendOtpEmail } from '../utils/email.util.js';

const signAdminToken = (id) => jwt.sign({ id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1d' });

// ── Admin Login ─────────────────────────────────────────────────────
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isAdmin: true }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    if (user.isBanned) return res.status(403).json({ success: false, message: 'Account suspended' });
    const token = signAdminToken(user._id);
    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin Forgot Password ───────────────────────────────────────────
export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isAdmin: true });
    if (!user) return res.status(404).json({ success: false, message: 'No admin found with this email' });
    const otp = generateOtp();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = new Date(Date.now() + 10 * 60000);
    await user.save();
    await sendOtpEmail(email, otp, 'admin password reset');
    res.json({ success: true, message: 'OTP sent to admin email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email, isAdmin: true });
    if (!user || user.resetPasswordOtp !== otp || new Date() > user.resetPasswordOtpExpiry) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Dashboard Stats ─────────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalLost, totalFound, totalResolved, recentUsers, lostItems, foundItems] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: 'resolved' }),
      User.find({ isAdmin: false }).sort('-createdAt').limit(5).select('name email isVerified isBanned createdAt itemsReported'),
      Item.find({ type: 'lost', status: { $ne: 'resolved' } }).sort('-createdAt').limit(6).populate('reporter', 'name email'),
      Item.find({ type: 'found', status: { $ne: 'resolved' } }).sort('-createdAt').limit(6).populate('reporter', 'name email'),
    ]);

    const categoryStats = await Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalLost, totalFound, totalResolved },
      recentUsers, lostItems, foundItems, categoryStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── All Users ───────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, status } = req.query;
    const query = { isAdmin: { $ne: true } };
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (status === 'banned') query.isBanned = true;
    if (status === 'verified') query.isVerified = true;
    if (status === 'unverified') query.isVerified = false;
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)).select('-password -emailOtp -resetPasswordOtp');
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.isAdmin) return res.status(403).json({ success: false, message: 'Cannot delete admin' });
    await Item.deleteMany({ reporter: req.params.id });
    await user.deleteOne();
    res.json({ success: true, message: 'User and their items deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isAdmin) return res.status(403).json({ success: false, message: 'Cannot ban this user' });
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ success: true, message: user.isBanned ? 'User banned' : 'User unbanned', isBanned: user.isBanned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── All Items ───────────────────────────────────────────────────────
export const getAllItems = async (req, res) => {
  try {
    const { page = 1, limit = 12, type, category, status, search } = req.query;
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) query.$or = [{ title: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];
    const total = await Item.countDocuments(query);
    const items = await Item.find(query).populate('reporter', 'name email').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, items, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
