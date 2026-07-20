import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadToCloudinary } from '../utils/uploadHelper.js';
import { updateProfileSchema } from '../utils/validation.js';
import { createNotification } from '../utils/notifications.js';

const router = express.Router();

router.get('/search', protect, async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json({ users: [] });

    const currentUser = await User.findById(req.user._id).select('following');
    const followingIds = new Set(
      (currentUser?.following || []).map((id) => id.toString())
    );

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } },
      ],
    })
      .select('username fullName avatar bio followers following')
      .limit(20);

    res.json({
      users: users.map((u) => ({
        ...u.toPublicJSON(),
        isFollowing: followingIds.has(u._id.toString()),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/suggested', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const excludeIds = [req.user._id, ...user.following];

    const suggested = await User.find({ _id: { $nin: excludeIds } })
      .select('username fullName avatar bio followers following')
      .limit(5);

    res.json({
      users: suggested.map((u) => ({
        ...u.toPublicJSON(),
        isFollowing: false,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:username', protect, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username avatar fullName')
      .populate('following', 'username avatar fullName');

    if (!user) return res.status(404).json({ message: 'User not found' });

    const posts = await Post.find({ author: user._id })
      .select('mediaUrl mediaType likes comments createdAt')
      .sort({ createdAt: -1 });

    const isFollowing = user.followers.some((f) => f._id.toString() === req.user._id.toString());
    const isOwnProfile = user._id.toString() === req.user._id.toString();

    res.json({
      user: {
        ...user.toPublicJSON(),
        followers: user.followers,
        following: user.following,
      },
      posts,
      isFollowing,
      isOwnProfile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const updates = { ...data };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'avatars', 'image', req.file.mimetype);
      updates.avatar = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/follow', protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const currentUser = await User.findById(req.user._id);
    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetUser._id.toString()
    );

    if (alreadyFollowing) {
      return res.status(400).json({ message: 'Already following' });
    }

    currentUser.following.push(targetUser._id);
    targetUser.followers.push(currentUser._id);
    await currentUser.save();
    await targetUser.save();

    await createNotification({
      recipient: targetUser._id,
      type: 'follow',
      actor: req.user._id,
      io: req.app.get('io'),
    });

    res.json({ message: 'Followed', isFollowing: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id/follow', protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const currentUser = await User.findById(req.user._id);
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUser._id.toString()
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );
    await currentUser.save();
    await targetUser.save();

    res.json({ message: 'Unfollowed', isFollowing: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
