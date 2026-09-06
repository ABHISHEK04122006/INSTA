import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { protect } from '../middleware/auth.js';
import { forgotPasswordSchema, registerSchema, resetPasswordSchema } from '../utils/validation.js';
import { sendPasswordResetOtp } from '../utils/email.js';

const router = express.Router();
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_INTERVAL_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const resetRequestMessage = 'If an account matches those details, a reset code has been sent to its email address.';

const getUserByIdentifier = (identifier, includeResetFields = false) => {
  const query = User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  return includeResetFields
    ? query.select('+resetPasswordOtpHash +resetPasswordOtpExpiresAt +resetPasswordOtpAttempts +resetPasswordLastSentAt')
    : query;
};

router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = data.username.trim().toLowerCase();

    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existing) {
      if (existing.email === cleanEmail) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }
      return res.status(400).json({ message: 'This username is already taken. Please choose another.' });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      fullName: data.fullName.trim(),
    });

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: user.toPublicJSON(), token });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Registration failed. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, username, loginIdentifier, password } = req.body;
    const identifier = (email || username || loginIdentifier || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please enter your username or email address and password.' });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(401).json({ message: 'No account found with this username or email.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password. Please check your credentials.' });
    }

    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: user.toPublicJSON(), token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed. Please try again.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier: rawIdentifier } = forgotPasswordSchema.parse(req.body);
    const identifier = rawIdentifier.toLowerCase();
    const user = await getUserByIdentifier(identifier, true);

    // Keep the response identical for unknown accounts so this endpoint cannot be used to discover users.
    if (!user) {
      return res.json({ message: resetRequestMessage });
    }

    const now = new Date();
    if (user.resetPasswordLastSentAt && now - user.resetPasswordLastSentAt < OTP_RESEND_INTERVAL_MS) {
      return res.json({ message: resetRequestMessage });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.resetPasswordOtpHash = await bcrypt.hash(otp, 12);
    user.resetPasswordOtpExpiresAt = new Date(now.getTime() + OTP_TTL_MS);
    user.resetPasswordOtpAttempts = 0;
    user.resetPasswordLastSentAt = now;
    await user.save();

    try {
      await sendPasswordResetOtp({ to: user.email, otp });
    } catch (mailError) {
      user.resetPasswordOtpHash = undefined;
      user.resetPasswordOtpExpiresAt = undefined;
      user.resetPasswordOtpAttempts = 0;
      user.resetPasswordLastSentAt = undefined;
      await user.save();
      console.error('Password reset email error:', mailError.message);
      return res.status(503).json({ message: 'Email service is temporarily unavailable. Please try again later.' });
    }

    res.json({ message: resetRequestMessage });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Could not start password reset. Please try again.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const identifier = data.identifier.toLowerCase();
    const user = await getUserByIdentifier(identifier, true);
    const invalidCodeMessage = 'This code is invalid or has expired. Request a new code and try again.';

    if (!user || !user.resetPasswordOtpHash || !user.resetPasswordOtpExpiresAt) {
      return res.status(400).json({ message: invalidCodeMessage });
    }

    if (user.resetPasswordOtpExpiresAt.getTime() < Date.now() || user.resetPasswordOtpAttempts >= MAX_OTP_ATTEMPTS) {
      user.resetPasswordOtpHash = undefined;
      user.resetPasswordOtpExpiresAt = undefined;
      user.resetPasswordOtpAttempts = 0;
      user.resetPasswordLastSentAt = undefined;
      await user.save();
      return res.status(400).json({ message: invalidCodeMessage });
    }

    const otpMatches = await bcrypt.compare(data.otp, user.resetPasswordOtpHash);
    if (!otpMatches) {
      user.resetPasswordOtpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: invalidCodeMessage });
    }

    user.passwordHash = await bcrypt.hash(data.password, 12);
    user.resetPasswordOtpHash = undefined;
    user.resetPasswordOtpExpiresAt = undefined;
    user.resetPasswordOtpAttempts = 0;
    user.resetPasswordLastSentAt = undefined;
    await user.save();

    res.json({ message: 'Your password has been reset. You can now log in.' });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Could not reset password. Please try again.' });
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

router.post('/logout', (req, res) => {
  res.cookie('token', '', { maxAge: 0 });
  res.json({ message: 'Logged out' });
});

export default router;
