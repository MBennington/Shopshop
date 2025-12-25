# Backend URL Configuration

This project uses a centralized configuration for the backend API URL, similar to how database URLs are configured in the backend.

## Configuration File

The backend URL is configured in `src/lib/config.ts`. This file exports:
- `BACKEND_URL`: For server-side use (API routes)
- `API_BASE_URL`: For client-side use (React components)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# For client-side access (browser) - must use NEXT_PUBLIC_ prefix
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# For server-side only (API routes) - optional, will fallback to NEXT_PUBLIC_BACKEND_URL
BACKEND_URL=http://localhost:5000
```

### Production Example

```env
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

## Usage

### In API Routes (Server-side)

```typescript
import { BACKEND_URL } from '@/lib/config';

const response = await fetch(`${BACKEND_URL}/api/endpoint`);
```

### In React Components (Client-side)

```typescript
import { API_BASE_URL } from '@/lib/config';

const response = await fetch(`${API_BASE_URL}/api/endpoint`);
```

## Benefits

1. **Single Source of Truth**: All backend URLs are defined in one place
2. **Easy Environment Management**: Change URLs per environment via `.env.local`
3. **Type Safety**: Centralized configuration reduces typos and errors
4. **Maintainability**: Easy to update URLs across the entire application

## Migration

All hardcoded `http://localhost:5000` URLs have been replaced with the centralized config. The system will:
- Use `NEXT_PUBLIC_BACKEND_URL` if available (for client-side)
- Fallback to `BACKEND_URL` if `NEXT_PUBLIC_BACKEND_URL` is not set
- Default to `http://localhost:5000` if neither is set

