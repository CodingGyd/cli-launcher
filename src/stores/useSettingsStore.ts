import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  dataDir: string | null
  setDataDir: (dir: string | null) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      dataDir: null,
      setDataDir: (dir) => set({ dataDir: dir }),
    }),
    {
      name: 'cli-launcher-settings',
    }
  )
)
