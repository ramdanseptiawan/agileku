// Konfigurasi API terpusat
const PRODUCTION_API_URL = 'https://api.mindshiftlearning.id';
const DEVELOPMENT_API_URL = 'http://localhost:8080';

// Deteksi environment
const isDevelopment = process.env.NODE_ENV === 'development' || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost');

// Base URL yang akan digunakan
const BASE_URL = isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : `${BASE_URL}/api`;

// Helper function untuk membuat URL endpoint
export const createApiUrl = (endpoint) => {
  // Pastikan endpoint dimulai dengan /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

// Export individual URLs untuk backward compatibility
export { PRODUCTION_API_URL, DEVELOPMENT_API_URL, isDevelopment };