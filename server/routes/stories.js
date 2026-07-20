import express from 'express';
import Story from '../models/Story.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadToCloudinary } from '../utils/uploadHelper.js';

const router = express.Router();

router.get('/feed', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const followingIds = [...user.following, req.user._id];

    const stories = await Story.find({
      author: { $in: followingIds },
      expiresAt: { $gt: new Date() },
    })
      .populate('author', 'username avatar fullName')
      .sort({ createdAt: -1 });

    const grouped = {};
    for (const story of stories) {
      const authorId = story.author._id.toString();
      if (!grouped[authorId]) {
        grouped[authorId] = {
          author: story.author,
          stories: [],
          hasUnviewed: false,
        };
      }
      const viewed = story.viewers.some((v) => v.toString() === req.user._id.toString());
      if (!viewed) grouped[authorId].hasUnviewed = true;
      grouped[authorId].stories.push(story);
    }

    res.json({ storyGroups: Object.values(grouped) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Media is required' });

    const isVideo = req.file.mimetype.startsWith('video/');
    const result = await uploadToCloudinary(
      req.file.buffer,
      'stories',
      isVideo ? 'video' : 'image',
      req.file.mimetype
    );

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await Story.create({
      author: req.user._id,
      mediaUrl: result.secure_url,
      mediaType: isVideo ? 'video' : 'image',
      expiresAt,
    });

    const populated = await Story.findById(story._id).populate('author', 'username avatar fullName');
    res.status(201).json({ story: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/view', protect, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found' });

    const viewed = story.viewers.some((v) => v.toString() === req.user._id.toString());
    if (!viewed) {
      story.viewers.push(req.user._id);
      await story.save();
    }

    res.json({ message: 'Viewed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
