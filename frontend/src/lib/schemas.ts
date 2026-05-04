import { z } from 'zod'

/** Login form validation schema */
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

/** Registration form validation schema */
export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(32),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

/** Image upload form validation schema */
export const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UploadInput = z.infer<typeof uploadSchema>
