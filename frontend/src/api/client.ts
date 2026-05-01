export const API_URL = 'http://localhost:8000'

export interface Image {
  id: number
  title: string
  user: string
  url: string
  created_at: string
  file_size: number | null
  content_type: string | null
}

export const getImageUrl = (url: string): string =>
  url.startsWith('http') ? url : `${API_URL}${url}`

export async function listImages(): Promise<Image[]> {
  const res = await fetch(`${API_URL}/images/`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch images')
  return res.json()
}

export async function uploadImage(form: FormData): Promise<Image> {
  const res = await fetch(`${API_URL}/images/upload`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to upload image')
  }
  return res.json()
}

export async function deleteImage(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/images/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to delete image')
}
