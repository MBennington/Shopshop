/**
 * Centralized configuration for backend API URL
 * 
 * Usage:
 * - Server-side (API routes): import { BACKEND_URL } from '@/lib/config'
 * - Client-side (components): import { API_BASE_URL } from '@/lib/config'
 * 
 * Environment variables:
 * - NEXT_PUBLIC_BACKEND_URL: For client-side access (exposed to browser)
 * - BACKEND_URL: For server-side only (API routes)
 * 
 * If NEXT_PUBLIC_BACKEND_URL is not set, it will fallback to BACKEND_URL
 * If neither is set, defaults to 'http://localhost:5000'
 */

// Server-side backend URL (for API routes)
export const BACKEND_URL = 
  process.env.BACKEND_URL || 
  process.env.NEXT_PUBLIC_BACKEND_URL || 
  'http://localhost:5000';

// Client-side backend URL (for components)
// Must use NEXT_PUBLIC_ prefix to be accessible in browser
export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_BACKEND_URL || 
  process.env.BACKEND_URL || 
  'http://localhost:5000';

