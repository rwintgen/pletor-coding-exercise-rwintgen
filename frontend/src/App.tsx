import { useEffect, useState } from 'react'
import './App.css'

// Define the Image type based on usage
interface Image {
  id: string
  title: string
  user: string
  url: string
  created_at: string
}

const API_URL = 'http://localhost:8000/images/'

function App() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [form, setForm] = useState({ title: '', user: '', url: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchImages = () => {
    setLoading(true)
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch images')
        return res.json()
      })
      .then(setImages)
      .catch(setError)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to add image')
      setForm({ title: '', user: '', url: '' })
      fetchImages()
    } catch (err: any) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setError(null)
    try {
      const res = await fetch(API_URL + id, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete image')
      fetchImages()
    } catch (err: any) {
      setError(err)
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ textAlign: 'center', fontSize: '3rem', fontWeight: 700, marginBottom: 40, letterSpacing: '-2px', color: '#222' }}>Image Gallery</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 40, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'center' }}>
        <div>
          <label style={{ fontWeight: 500, color: '#333' }}>Title<br /><input name="title" value={form.title} onChange={handleChange} required style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', minWidth: 120 }} /></label>
        </div>
        <div>
          <label style={{ fontWeight: 500, color: '#333' }}>User<br /><input name="user" value={form.user} onChange={handleChange} required style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', minWidth: 120 }} /></label>
        </div>
        <div>
          <label style={{ fontWeight: 500, color: '#333' }}>Image URL<br /><input name="url" value={form.url} onChange={handleChange} required style={{ padding: 8, borderRadius: 6, border: '1px solid #bbb', minWidth: 220 }} /></label>
        </div>
        <button type="submit" disabled={submitting} style={{ padding: '10px 22px', borderRadius: 6, background: '#222', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 16, boxShadow: '0 2px 8px #0001', transition: 'background 0.2s' }}>Add Image</button>
      </form>
      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>Error: {error.message}</p>}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2rem',
        alignItems: 'stretch',
      }}>
        {images.length === 0 && !loading && <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>No images found.</p>}
        {images.map((img) => (
          <div key={img.id} style={{ boxShadow: '0 4px 24px #0002', borderRadius: 16, padding: 0, background: '#fff', overflow: 'hidden', border: '1px solid #eee', maxWidth: 500, margin: '0 auto', transition: 'box-shadow 0.2s', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <img src={img.url} alt={img.title} style={{ width: '100%', display: 'block', borderTopLeftRadius: 16, borderTopRightRadius: 16, objectFit: 'cover', maxHeight: 350, minHeight: 200, background: '#eee' }} />
            <div style={{ padding: 24, paddingTop: 18, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#222', textAlign: 'center' }}>{img.title}</h2>
                <p style={{ margin: '0.5rem 0 0 0', color: '#555', textAlign: 'center', fontWeight: 500 }}>By: <span style={{ color: '#0077cc' }}>{img.user}</span></p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>Created: {new Date(img.created_at).toLocaleString()}</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>ID: {img.id}</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: 13, color: '#888', textAlign: 'center' }}>URL: <a href={img.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0077cc', wordBreak: 'break-all' }}>{img.url}</a></p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
                <button onClick={() => handleDelete(img.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: 6, padding: '8px 24px', cursor: 'pointer', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px #e74c3c22', transition: 'background 0.2s' }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
