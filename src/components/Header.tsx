import { useThemeStore } from '@/stores/useThemeStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { launchAll } from '@/services/tauri'
import { Button } from '@/components/ui/button'
import { Plus, Rocket, Moon, Sun } from 'lucide-react'

export function Header() {
  const { theme, toggleTheme } = useThemeStore()
  const { items, addItem } = useConfigStore()

  const handleLaunchAll = async () => {
    const validItems = items.filter((item) => item.dir.trim() !== '')
    if (validItems.length === 0) return
    try {
      await launchAll(validItems)
    } catch (e) {
      console.error('批量启动失败:', e)
    }
  }

  const hasValid = items.some((i) => i.dir.trim())

  return (
    <header
      className="border-b border-border/50 bg-background/90 backdrop-blur-md flex items-center justify-between shrink-0"
      style={{ padding: '14px 24px' }}
    >
      <h1 className="text-[15px] font-semibold tracking-tight select-none">
        CliLauncher
      </h1>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="default" onClick={addItem} className="gap-1.5">
          <Plus className="size-3.5" />
          添加
        </Button>

        <Button
          size="default"
          disabled={!hasValid}
          onClick={handleLaunchAll}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
        >
          <Rocket className="size-3.5" />
          全部启动
        </Button>

        <Button variant="ghost" size="icon-sm" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </Button>
      </div>
    </header>
  )
}
