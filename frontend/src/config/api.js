/**
 * Centralized API base URL configuration.
 * Set VITE_API_URL in your .env file for production deployments.
 * Falls back to localhost:5000 for local development.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
