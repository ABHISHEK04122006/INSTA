import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadToCloudinary } from '../utils/uploadHelper.js';
import { createPostSchema, commentSchema } from '../utils/validation.js';
import { createNotification } from '../utils/notifications.js';

const router = express.Router();

router.get('/feed', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id);
    const followingIds = [...user.following, req.user._id];

    const posts = await Post.find({ author: { $in: followingIds } })
      .populate('author', 'username avatar fullName')
      .populate('comments.author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: { $in: followingIds } });

    res.json({ posts, page, totalPages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/explore', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: { $ne: req.user._id } })
      .populate('author', 'username avatar fullName')
      .populate('comments.author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: { $ne: req.user._id } });

    res.json({ posts, page, totalPages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/hashtag/:tag', protect, async (req, res) => {
  try {
    const tag = req.params.tag.toLowerCase();
    const posts = await Post.find({ hashtags: tag })
      .populate('author', 'username avatar fullName')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar fullName')
      .populate('comments.author', 'username avatar');

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, upload.array('media', 10), async (req, res) => {
  try {
    const data = createPostSchema.parse(req.body);
    if (!req.files?.length) {
      return res.status(400).json({ message: 'At least one media file is required' });
    }

    const mediaUrls = [];
    let mediaType = 'image';

    for (const file of req.files) {
      const isVideo = file.mimetype.startsWith('video/');
      const result = await uploadToCloudinary(
        file.buffer,
        'posts',
        isVideo ? 'video' : 'image',
        file.mimetype
      );
      mediaUrls.push(result.secure_url);
      if (isVideo) mediaType = 'video';
    }

    const post = await Post.create({
      author: req.user._id,
      mediaUrl: mediaUrls,
      mediaType,
      caption: data.caption || '',
    });

    const populated = await Post.findById(post._id).populate('author', 'username avatar fullName');
    res.status(201).json({ post: populated });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id.toString();
    const liked = post.likes.some((id) => id.toString() === userId);

    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(req.user._id);
      await createNotification({
        recipient: post.author,
        type: 'like',
        actor: req.user._id,
        targetId: post._id,
        targetType: 'post',
        io: req.app.get('io'),
      });
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/comments', protect, async (req, res) => {
  try {
    const data = commentSchema.parse(req.body);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ author: req.user._id, text: data.text });
    await post.save();

    await createNotification({
      recipient: post.author,
      type: 'comment',
      actor: req.user._id,
      targetId: post._id,
      targetType: 'post',
      io: req.app.get('io'),
    });

    const populated = await Post.findById(post._id)
      .populate('author', 'username avatar fullName')
      .populate('comments.author', 'username avatar');

    res.status(201).json({ post: populated });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;
