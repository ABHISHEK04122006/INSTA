import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, dots, and underscores'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required').max(100),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Please enter your username or email'),
  password: z.string().min(1, 'Please enter your password'),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(1, 'Please enter your username or email address').max(254),
});

export const resetPasswordSchema = z.object({
  identifier: z.string().trim().min(1, 'Please enter your username or email address').max(254),
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  bio: z.string().max(150).optional(),
  isPrivate: z.boolean().optional(),
});

export const createPostSchema = z.object({
  caption: z.string().max(2200).optional(),
});

export const commentSchema = z.object({
  text: z.string().min(1).max(500),
});

export const messageSchema = z.object({
  text: z.string().min(1).max(1000),
});
