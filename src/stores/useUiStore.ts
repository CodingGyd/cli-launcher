import { create } from 'zustand'

interface UiState {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export const useUiStore = create<UiState>()((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
