// src/validations/auth.schema.ts
// Zod schemas for auth forms

import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus memiliki minimal 1 huruf kapital')
    .regex(/[0-9]/, 'Password harus memiliki minimal 1 angka'),
  fullName: z
    .string()
    .max(255, 'Nama maksimal 255 karakter')
    .optional()
    .or(z.literal('')),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
