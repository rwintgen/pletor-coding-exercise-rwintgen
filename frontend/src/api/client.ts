/**
 * Base URL of the backend API. Sourced from `VITE_API_URL` so the same build
 * artifact can target dev/staging/prod, falling back to localhost for the
 * default Docker compose setup.
 */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

/** Image as returned by the backend API */
export interface Image {
  id: number
  title: string
  user_id: number
  username: string
  url: string
  created_at: string
  file_size: number | null
  content_type: string | null
}

/** Quota status for the current authenticated user */
export interface QuotaStatus {
  user_uploads_today: number
  user_limit: number
  user_remaining: number
  global_uploads_today: number
  global_limit: number
  global_remaining: number
  can_upload: boolean
}

/** Auth token response from login */
export interface TokenResponse {
  access_token: string
  token_type: string
}

/** User info from /auth/me */
export interface UserInfo {
  id: number
  username: string
  created_at: string
}

import { useSettingsStore } from '../stores/settings'

/** Original Unsplash photo IDs from the exercise seed data. */
const UNSPLASH_IDS = [
  'photo-1506744038136-46273834b3fb', 'photo-1465101046530-73398c7f28ca',
  'photo-1465101178521-c1a9136a3b99', 'photo-1470071459604-3b5ec3a7fe05',
  'photo-1441974231531-c6227db76b6e', 'photo-1469474968028-56623f02e42e',
  'photo-1426604966848-d7adac402bff', 'photo-1472214103451-9374bd1c798e',
  'photo-1500534314263-0869cef50735', 'photo-1501785888041-af3ef285b470',
  'photo-1418065460487-3e41a6c84dc5', 'photo-1414609245224-afa02bfb3fda',
  'photo-1470770903676-69b98201ea1c', 'photo-1446776811953-b23d57bd21aa',
  'photo-1447752875215-b2761acb3c5d', 'photo-1433086966358-54859d0ed716',
  'photo-1482938289607-e9573fc25ebb', 'photo-1475924156734-496f6cac6ec1',
  'photo-1470252649378-9c29740c9fa8', 'photo-1490682143684-14369e18dce8',
  'photo-1507525428034-b723cf961d3e', 'photo-1519681393784-d120267933ba',
  'photo-1439853949127-fa647821eba0', 'photo-1484591974057-265bb767ef71',
  'photo-1493246507139-91e8fad9978e', 'photo-1505765050516-f72dcac9c60e',
  'photo-1476514525535-07fb3b4ae5f1', 'photo-1494500764479-0c8f2919a3d8',
  'photo-1504893524553-b855bce32c67', 'photo-1464822759023-fed622ff2c3b',
  'photo-1486870591958-9b9d0d1dda99', 'photo-1510414842594-a61c69b5ae57',
  'photo-1500259783852-0ca9ce8a64dc', 'photo-1540202404-a2f29016b523',
  'photo-1531366936337-7c912a4589a7', 'photo-1491002052546-bf38f186af56',
  'photo-1508739773434-c26b3d09e071', 'photo-1505144808419-1957a94ca61e',
  'photo-1470114716159-e389f8712861', 'photo-1497436072909-60f360e1d4b1',
  'photo-1501854140801-50d01698950b', 'photo-1518173946687-a1e2a18a563e',
  'photo-1517483000871-1dbf64a6e1c6', 'photo-1490750967868-88aa4f44baee',
  'photo-1431794062232-2a99a5431c6c', 'photo-1518098268026-4e89f1a2cd8e',
  'photo-1502082553048-f009c37129b9', 'photo-1429552077091-836152271555',
  'photo-1540979388789-6cee28a1cdc9', 'photo-1506260408121-e353d10b87c7',
  'photo-1536431311719-398b6704d4cc', 'photo-1523712999610-f77fbcfc3843',
  'photo-1477346611705-65d1883cee1e', 'photo-1504700610630-ac6edd918cc0',
  'photo-1509316975850-ff9c5deb0cd9',
]

/**
 * Resolves an image URL to a full path.
 * When the user setting is "unsplash", remaps picsum.photos URLs to the
 * original Unsplash photo URLs from the exercise. Some may 404 intentionally.
 */
export const getImageUrl = (url: string): string => {
  if (!url.startsWith('http')) return `${API_URL}${url}`

  const source = useSettingsStore.getState().imageSource
  if (source === 'unsplash' && url.includes('picsum.photos')) {
    // Extract seed index from picsum URL: .../seed/picto{N}/...
    const match = url.match(/seed\/picto(\d+)/)
    if (match) {
      const idx = parseInt(match[1], 10) - 10 // seed.py uses picto{idx+10}
      if (idx >= 0 && idx < UNSPLASH_IDS.length) {
        return `https://images.unsplash.com/${UNSPLASH_IDS[idx]}`
      }
    }
  }
  return url
}

import { useAuthStore } from '../stores/auth'

/** Builds auth headers if a token is present in the auth store */
function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const PAGE_SIZE = 50

/** Options for listing images (search, filter, sort). */
export interface ListImagesParams {
  search?: string
  user?: string
  sort?: 'newest' | 'oldest' | 'title'
}

/** Fetches images with optional search/filter/sort and pagination. */
export async function listImages(params?: ListImagesParams, offset = 0): Promise<Image[]> {
  const url = new URL(`${API_URL}/images/`)
  if (params?.search) url.searchParams.set('search', params.search)
  if (params?.user) url.searchParams.set('user', params.user)
  if (params?.sort) url.searchParams.set('sort', params.sort)
  url.searchParams.set('limit', String(PAGE_SIZE))
  url.searchParams.set('offset', String(offset))
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Failed to fetch images')
  return res.json()
}

/** Fetches a user's public profile. */
export async function getUserProfile(username: string): Promise<UserInfo> {
  const res = await fetch(`${API_URL}/users/${encodeURIComponent(username)}`)
  if (!res.ok) throw new Error('User not found')
  return res.json()
}

/** Fetches all images uploaded by a specific user. */
export async function getUserImages(username: string): Promise<Image[]> {
  const res = await fetch(`${API_URL}/users/${encodeURIComponent(username)}/images`)
  if (!res.ok) throw new Error('Failed to fetch user images')
  return res.json()
}

/** Uploads an image (requires auth) */
export async function uploadImage(form: FormData): Promise<Image> {
  const res = await fetch(`${API_URL}/images/upload`, {
    method: 'POST',
    body: form,
    headers: authHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to upload image')
  }
  return res.json()
}

/** Deletes an image by ID (requires auth, owner only) */
export async function deleteImage(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/images/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to delete image')
  }
}

/** Renames an image (requires auth, owner only) */
export async function renameImage(id: number, title: string): Promise<Image> {
  const res = await fetch(`${API_URL}/images/${id}`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to rename image')
  }
  return res.json()
}

/** Fetches current quota status (requires auth) */
export async function getQuota(): Promise<QuotaStatus> {
  const res = await fetch(`${API_URL}/images/quota`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch quota')
  return res.json()
}

/** Registers a new user */
export async function register(username: string, password: string): Promise<UserInfo> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Registration failed')
  }
  return res.json()
}

/** Logs in; returns the token response. Caller is responsible for storing it. */
export async function login(username: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Login failed')
  }
  return res.json()
}

/** Fetches current user info (requires auth) */
export async function getMe(): Promise<UserInfo> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Not authenticated')
  return res.json()
}

/** Deletes the current user's account and all their images (requires auth) */
export async function deleteAccount(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/account`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to delete account')
  }
}

