import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { messageSchema } from '../utils/validation.js';
import { createNotification } from '../utils/notifications.js';

const router = express.Router();

router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'username avatar fullName')
      .sort({ lastMessageAt: -1 });

    const result = await Promise.all(
      conversations.map(async (conv) => {
        const other = conv.participants.find(
          (p) => p._id.toString() !== req.user._id.toString()
        );
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user._id },
          readBy: { $ne: req.user._id },
        });
        return {
          _id: conv._id,
          participant: other,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount,
        };
      })
    );

    res.json({ conversations: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/conversations', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const otherUser = await User.findById(userId);
    if (!otherUser) return res.status(404).json({ message: 'User not found' });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, userId],
      });
    }

    const populated = await Conversation.findById(conversation._id).populate(
      'participants',
      'username avatar fullName'
    );

    const other = populated.participants.find(
      (p) => p._id.toString() !== req.user._id.toString()
    );

    res.json({
      conversation: {
        _id: populated._id,
        participant: other,
        lastMessage: populated.lastMessage,
        lastMessageAt: populated.lastMessageAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'username avatar fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    await Message.updateMany(
      {
        conversation: req.params.id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id },
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json({ messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const data = messageSchema.parse(req.body);
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ message: 'Not authorized' });

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      text: data.text,
      readBy: [req.user._id],
    });

    conversation.lastMessage = data.text;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await Message.findById(message._id).populate(
      'sender',
      'username avatar fullName'
    );

    const io = req.app.get('io');
    conversation.participants.forEach((participantId) => {
      io.to(participantId.toString()).emit('new_message', {
        conversationId: conversation._id,
        message: populated,
      });
    });

    const recipient = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );
    if (recipient) {
      await createNotification({
        recipient,
        type: 'dm',
        actor: req.user._id,
        targetId: conversation._id,
        targetType: 'conversation',
        io,
      });
    }

    res.status(201).json({ message: populated });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;
