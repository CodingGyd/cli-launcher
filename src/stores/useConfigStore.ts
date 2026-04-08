import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ConfigItem } from '@/types'

interface ConfigState {
  items: ConfigItem[]
  addItem: () => void
  removeItem: (id: string) => void
  updateItem: (id: string, field: keyof Omit<ConfigItem, 'id'>, value: string) => void
  moveItem: (fromIndex: number, toIndex: number) => void
  reorderItems: (activeId: string, overId: string) => void
  setItems: (items: ConfigItem[]) => void
}

const createId = () => crypto.randomUUID()

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      items: [],

      addItem: () =>
        set((state) => ({
          items: [
            ...state.items,
            { id: createId(), title: '', dir: '', command: 'claude' },
          ],
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateItem: (id, field, value) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, [field]: value } : item
          ),
        })),

      moveItem: (fromIndex, toIndex) =>
        set((state) => {
          const newItems = [...state.items]
          const [removed] = newItems.splice(fromIndex, 1)
          newItems.splice(toIndex, 0, removed)
          return { items: newItems }
        }),

      reorderItems: (activeId, overId) =>
        set((state) => {
          const oldIndex = state.items.findIndex((i) => i.id === activeId)
          const newIndex = state.items.findIndex((i) => i.id === overId)
          if (oldIndex === -1 || newIndex === -1) return state
          const newItems = [...state.items]
          const [removed] = newItems.splice(oldIndex, 1)
          newItems.splice(newIndex, 0, removed)
          return { items: newItems }
        }),

      setItems: (items) => set({ items }),
    }),
    {
      name: 'cli-launcher-config',
    }
  )
)
