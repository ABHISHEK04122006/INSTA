import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._]+$/),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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
