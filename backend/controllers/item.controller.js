import Item from '../models/Item.model.js';
import Match from '../models/Match.model.js';
import Notification from '../models/Notification.model.js';
import { calculateMatchScore } from '../utils/matching.util.js';
import { sendMatchNotification } from '../utils/email.util.js';
import cloudinary from '../config/cloudinary.js';

export const createItem = async (req, res) => {
  try {
    const { type, title, description, category, hiddenDetails, color, brand,
            location, date, reward, contactPreference, tags } = req.body;
    // const images = req.files?.map(f => `/uploads/items/${f.filename}`) || [];
const images = [];

if (req.files && req.files.length > 0) {
  for (const file of req.files) {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'lost-found/items',
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(file.buffer);
    });

    images.push(result.secure_url);
  }
}


    // Step 1: parse location safely (separate line)
    const parsedLocation = location ? JSON.parse(location) : {};

    // Step 2: use parsedLocation in Item.create
    const item = await Item.create({
      type, title, description, category, hiddenDetails, color, brand,
      images, location: parsedLocation, date, reward, contactPreference,
      tags: tags ? JSON.parse(tags) : [],
      reporter: req.user._id
    });

    await runAutoMatch(item, req.user);

    req.user.itemsReported += 1;
    await req.user.save();

    res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('❌ Create item error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
const runAutoMatch = async (newItem, reporter) => {
  const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
  const candidates = await Item.find({
    type: oppositeType,
    status: 'active',
    category: newItem.category
  }).populate('reporter');

  for (const candidate of candidates) {
    const { score, reasons } = calculateMatchScore(
      newItem.type === 'lost' ? newItem : candidate,
      newItem.type === 'found' ? newItem : candidate
    );

    if (score >= 40) {
      const lostItem = newItem.type === 'lost' ? newItem : candidate;
      const foundItem = newItem.type === 'found' ? newItem : candidate;

      const existingMatch = await Match.findOne({ lostItem: lostItem._id, foundItem: foundItem._id });
      if (!existingMatch) {
        await Match.create({ lostItem: lostItem._id, foundItem: foundItem._id, score, matchReasons: reasons });

        // Notify both parties
        const lostReporter = newItem.type === 'lost' ? reporter : candidate.reporter;
        const foundReporter = newItem.type === 'found' ? reporter : candidate.reporter;

        await Notification.create({
          user: lostReporter._id,
          type: 'match_found',
          title: '🎯 Potential Match Found!',
          message: `We found a ${score}% match for your lost item "${lostItem.title}"`,
          relatedItem: lostItem._id,
          link: `/matches`
        });

        if (score >= 60) {
          await sendMatchNotification(lostReporter.email, lostItem.title, score);
        }
      }
    }
  }
};

export const getItems = async (req, res) => {
  try {
    const { type, category, city, status = 'active', search, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('reporter', 'name avatar reputation')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-hiddenDetails');

    res.json({ success: true, items, total, pages: Math.ceil(total / limit), currentPage: Number(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('reporter', 'name avatar reputation itemsReturned createdAt')
      .select('-hiddenDetails');

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    item.views += 1;
    await item.save();

    // Show hidden details only to the reporter
    let itemData = item.toObject();
    if (req.user && req.user._id.toString() === item.reporter._id.toString()) {
      const fullItem = await Item.findById(req.params.id);
      itemData.hiddenDetails = fullItem.hiddenDetails;
    }

    res.json({ success: true, item: itemData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.reporter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await item.deleteOne();
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ reporter: req.user._id }).sort('-createdAt');
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const [totalLost, totalFound, totalResolved, recentItems] = await Promise.all([
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: 'resolved' }),
      Item.find({ status: 'active' }).sort('-createdAt').limit(6).populate('reporter', 'name avatar').select('-hiddenDetails')
    ]);
    res.json({ success: true, stats: { totalLost, totalFound, totalResolved, successRate: totalResolved }, recentItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
