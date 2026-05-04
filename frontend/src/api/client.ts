export const API_URL = 'http://localhost:8000'

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

/** Resolves an image URL to a full path (handles relative upload paths) */
export const getImageUrl = (url: string): string =>
  url.startsWith('http') ? url : `${API_URL}${url}`

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

