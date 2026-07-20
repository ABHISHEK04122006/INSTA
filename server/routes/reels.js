import express from 'express';
import Reel from '../models/Reel.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadToCloudinary } from '../utils/uploadHelper.js';
import { commentSchema } from '../utils/validation.js';
import { createNotification } from '../utils/notifications.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reels = await Reel.find()
      .populate('author', 'username avatar fullName')
      .populate('comments.author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Reel.countDocuments();

    res.json({ reels, page, totalPages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Video is required' });

    const result = await uploadToCloudinary(req.file.buffer, 'reels', 'video', req.file.mimetype);

    const reel = await Reel.create({
      author: req.user._id,
      videoUrl: result.secure_url,
      thumbnail: result.secure_url.replace('/upload/', '/upload/w_400,h_600,c_fill/'),
      caption: req.body.caption || '',
    });

    const populated = await Reel.findById(reel._id).populate('author', 'username avatar fullName');
    res.status(201).json({ reel: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/like', protect, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    const userId = req.user._id.toString();
    const liked = reel.likes.some((id) => id.toString() === userId);

    if (liked) {
      reel.likes = reel.likes.filter((id) => id.toString() !== userId);
    } else {
      reel.likes.push(req.user._id);
      await createNotification({
        recipient: reel.author,
        type: 'like',
        actor: req.user._id,
        targetId: reel._id,
        targetType: 'reel',
        io: req.app.get('io'),
      });
    }

    await reel.save();
    res.json({ likes: reel.likes.length, liked: !liked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/view', protect, async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    const viewed = reel.viewedBy.some((v) => v.toString() === req.user._id.toString());
    if (!viewed) {
      reel.viewedBy.push(req.user._id);
      reel.views += 1;
      await reel.save();
    }

    res.json({ views: reel.views });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/comments', protect, async (req, res) => {
  try {
    const data = commentSchema.parse(req.body);
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ message: 'Reel not found' });

    reel.comments.push({ author: req.user._id, text: data.text });
    await reel.save();

    await createNotification({
      recipient: reel.author,
      type: 'comment',
      actor: req.user._id,
      targetId: reel._id,
      targetType: 'reel',
      io: req.app.get('io'),
    });

    const populated = await Reel.findById(reel._id)
      .populate('author', 'username avatar fullName')
      .populate('comments.author', 'username avatar');

    res.status(201).json({ reel: populated });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;
