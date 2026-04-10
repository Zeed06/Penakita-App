// src/constants/errorCodes.ts
// Backend error codes mapped to Indonesian user-facing messages

export type ErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_VERIFIED'
  | 'PASSWORD_NOT_SET'
  | 'RATE_LIMITED'
  | 'TOKEN_REVOKED'
  | 'TOKEN_REUSE_DETECTED'
  | 'POST_NOT_FOUND'
  | 'FORBIDDEN'
  | 'ALREADY_PUBLISHED'
  | 'COMMENT_NOT_FOUND'
  | 'COMMENT_DELETED'
  | 'USERNAME_TAKEN'
  | 'NO_CHANGES'
  | 'INVALID_CURRENT_PASSWORD'
  | 'AVATAR_BLOCKED'
  | 'VALIDATION_ERROR'
  | 'EMAIL_TAKEN';

/** Error codes that should trigger a force logout without any toast */
export const FORCE_LOGOUT_CODES: ReadonlySet<string> = new Set([
  'TOKEN_REVOKED',
  'TOKEN_REUSE_DETECTED',
]);

/** Error codes where the backend message should be shown directly */
export const PASSTHROUGH_CODES: ReadonlySet<string> = new Set([
  'VALIDATION_ERROR',
]);

export const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email atau password salah',
  EMAIL_NOT_VERIFIED: 'Email belum diverifikasi. Cek inbox-mu.',
  PASSWORD_NOT_SET: 'Akun ini hanya bisa login dengan Google',
  RATE_LIMITED: 'Terlalu banyak percobaan. Coba lagi dalam 5 menit.',
  TOKEN_REVOKED: '', // force logout, no message
  TOKEN_REUSE_DETECTED: '', // force logout, no message
  POST_NOT_FOUND: 'Artikel tidak ditemukan',
  FORBIDDEN: 'Kamu tidak punya izin untuk ini',
  ALREADY_PUBLISHED: 'Artikel sudah dipublikasikan',
  COMMENT_NOT_FOUND: 'Komentar tidak ditemukan',
  COMMENT_DELETED: 'Komentar sudah dihapus',
  USERNAME_TAKEN: 'Username sudah dipakai',
  NO_CHANGES: 'Tidak ada perubahan yang disimpan',
  INVALID_CURRENT_PASSWORD: 'Password saat ini salah',
  AVATAR_BLOCKED: 'Avatar mengandung konten yang tidak diizinkan',
  EMAIL_TAKEN: 'Email sudah terdaftar',
} as const;

export const DEFAULT_ERROR_MESSAGE = 'Terjadi kesalahan. Silakan coba lagi.';
