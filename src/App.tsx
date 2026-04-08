import { useEffect } from 'react'
import { Header } from '@/components/Header'
import { ConfigList } from '@/components/ConfigList'
import { Footer } from '@/components/Footer'
import { useThemeStore } from '@/stores/useThemeStore'
import { TooltipProvider } from '@/components/ui/tooltip'
import { initFileSync } from '@/services/fileSync'
import '@/index.css'

export default function App() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    initFileSync()
  }, [])

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-background">
        <Header />
        <ConfigList />
        <Footer />
      </div>
    </TooltipProvider>
  )
}
