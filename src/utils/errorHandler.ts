// src/utils/errorHandler.ts
// Utility to extract user-facing error messages from API errors

import axios from 'axios';
import {
  ERROR_MESSAGES,
  DEFAULT_ERROR_MESSAGE,
  FORCE_LOGOUT_CODES,
  PASSTHROUGH_CODES,
} from '../constants/errorCodes';

interface ApiError {
  code: string;
  message: string;
}

/**
 * Extract the error payload from an Axios error response.
 */
function extractApiError(error: unknown): ApiError | null {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: ApiError }
      | undefined;
    
    // Log for debugging backend issues
    console.error('[Back-end Error Details:]', JSON.stringify(error.response?.data, null, 2));

    return data?.error ?? null;
  }
  return null;
}

/**
 * Get a user-facing error message from an error code.
 * Returns empty string for force-logout codes (no toast should be shown).
 */
export function getErrorMessage(code: string): string {
  if (FORCE_LOGOUT_CODES.has(code)) {
    return '';
  }
  return ERROR_MESSAGES[code] ?? DEFAULT_ERROR_MESSAGE;
}

/**
 * Get the user-facing error message from any caught error.
 * Handles Axios errors, plain strings, and unknown errors.
 */
export function getErrorFromResponse(error: unknown): string {
  const apiError = extractApiError(error);

  if (apiError) {
    // Force logout codes — caller should handle logout, no message
    if (FORCE_LOGOUT_CODES.has(apiError.code)) {
      return '';
    }

    // Passthrough codes — show backend message directly
    if (PASSTHROUGH_CODES.has(apiError.code)) {
      return apiError.message || DEFAULT_ERROR_MESSAGE;
    }

    // Known code — show mapped Indonesian message
    if (ERROR_MESSAGES[apiError.code]) {
      return ERROR_MESSAGES[apiError.code];
    }
  }

  // Fallback for non-API errors
  if (error instanceof Error) {
    return error.message || DEFAULT_ERROR_MESSAGE;
  }

  return DEFAULT_ERROR_MESSAGE;
}

/**
 * Check whether an error is a force-logout error.
 */
export function isForceLogoutError(error: unknown): boolean {
  const apiError = extractApiError(error);
  if (!apiError) return false;
  return FORCE_LOGOUT_CODES.has(apiError.code);
}
