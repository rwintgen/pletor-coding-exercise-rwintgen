import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ImageSource = 'picsum' | 'unsplash'

interface SettingsState {
  imageSource: ImageSource
  setImageSource: (source: ImageSource) => void
}

/** Persisted app settings. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      imageSource: 'picsum',
      setImageSource: (imageSource) => set({ imageSource }),
    }),
    { name: 'settings' },
  ),
)
