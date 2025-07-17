# Konfigurasi API Terpusat

File ini menjelaskan sistem konfigurasi API terpusat yang telah diimplementasikan untuk menghindari kebingungan antara URL development dan production.

## File Konfigurasi Utama

### `src/config/api.js`

File ini berisi konfigurasi terpusat untuk semua URL API:

```javascript
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
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
```

## Penggunaan

### Import Konfigurasi

```javascript
import { API_BASE_URL, createApiUrl } from '../config/api';
```

### Penggunaan Langsung

```javascript
// Untuk endpoint yang memerlukan base URL dengan /api
const response = await fetch(`${API_BASE_URL}/protected/courses`);

// Untuk endpoint yang memerlukan base URL tanpa /api
const backendUrl = API_BASE_URL.replace('/api', '');
const response = await fetch(`${backendUrl}/api/protected/courses`);
```

### Menggunakan Helper Function

```javascript
// Membuat URL endpoint dengan helper
const apiUrl = createApiUrl('/protected/courses');
const response = await fetch(apiUrl);
```

## File yang Telah Diperbarui

Berikut adalah daftar file yang telah diperbarui untuk menggunakan konfigurasi API terpusat:

1. **`src/components/CourseCard.js`** - Menggunakan `API_BASE_URL`
2. **`src/services/api.js`** - Menggunakan `API_BASE_URL`
3. **`src/api/quizEnhancedAPI.js`** - Menggunakan `API_BASE_URL` dengan `/protected`
4. **`src/components/FeedbackManager.js`** - Menggunakan `API_BASE_URL`
5. **`src/components/CourseConfigManager.js`** - Menggunakan `API_BASE_URL`
6. **`src/hooks/useLearningProgress.js`** - Menggunakan `API_BASE_URL`
7. **`src/contexts/AuthContext.js`** - Menggunakan `API_BASE_URL`
8. **`src/components/CourseView.js`** - Menggunakan `API_BASE_URL`

## Keuntungan

1. **Konsistensi**: Semua file menggunakan konfigurasi yang sama
2. **Maintainability**: Perubahan URL hanya perlu dilakukan di satu tempat
3. **Environment Detection**: Otomatis mendeteksi environment development/production
4. **Flexibility**: Mendukung environment variable `NEXT_PUBLIC_API_URL`
5. **Error Prevention**: Menghindari kesalahan hardcoded URL yang berbeda-beda

## Environment Variables

Anda dapat menggunakan environment variable untuk override URL:

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://custom-api.example.com
```

## Troubleshooting

Jika masih ada masalah dengan URL API:

1. Pastikan semua file mengimport dari `../config/api`
2. Periksa apakah endpoint memerlukan `/api` atau tidak
3. Gunakan `API_BASE_URL.replace('/api', '')` untuk endpoint yang tidak memerlukan `/api`
4. Periksa console browser untuk melihat URL yang digunakan

## Migrasi File Lain

Jika ada file lain yang masih menggunakan hardcoded URL, ikuti pola ini:

```javascript
// Sebelum
const backendUrl = process.env.NODE_ENV === 'production'
  ? 'https://api.mindshiftlearning.id'
  : 'http://localhost:8080';

// Sesudah
import { API_BASE_URL } from '../config/api';
const backendUrl = API_BASE_URL.replace('/api', ''); // jika tidak perlu /api
// atau
const backendUrl = API_BASE_URL; // jika perlu /api
```