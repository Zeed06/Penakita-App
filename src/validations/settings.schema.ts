// src/validations/settings.schema.ts
import { z } from 'zod';

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh berisi huruf, angka, dan underscore'),
  fullName: z
    .string()
    .min(1, 'Nama lengkap wajib diisi')
    .max(255, 'Nama lengkap terlalu panjang'),
});

export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf kapital')
    .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
