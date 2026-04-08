import { useState } from 'react'
import { useConfigStore } from '@/stores/useConfigStore'
import { launchAll, writeFile } from '@/services/tauri'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Plus, Rocket, Download, Settings } from 'lucide-react'
import { save } from '@tauri-apps/plugin-dialog'
import { SettingsDialog } from '@/components/SettingsDialog'

export function Header() {
  const { items, addItem } = useConfigStore()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleLaunchAll = async () => {
    const validItems = items.filter((item) => item.dir.trim() !== '')
    if (validItems.length === 0) return
    try {
      await launchAll(validItems)
    } catch (e) {
      console.error('批量启动失败:', e)
    }
  }

  const handleExport = async () => {
    if (items.length === 0) return
    try {
      const path = await save({
        defaultPath: 'clilauncher-config.json',
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })
      if (!path) return
      const exportData = items.map(({ title, dir, command }) => ({ title, dir, command }))
      await writeFile(path, JSON.stringify(exportData, null, 2))
    } catch (e) {
      console.error('导出失败:', e)
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

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger>
            <Button variant="outline" size="icon-sm" onClick={addItem}>
              <Plus className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>添加配置</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={items.length === 0}
              onClick={handleExport}
            >
              <Download className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>导出配置</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!hasValid}
              onClick={handleLaunchAll}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950 dark:hover:border-emerald-700"
            >
              <Rocket className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>全部启动</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button variant="ghost" size="icon-sm" onClick={() => setSettingsOpen(true)}>
              <Settings className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>设置</TooltipContent>
        </Tooltip>

        {settingsOpen && <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />}
      </div>
    </header>
  )
}
