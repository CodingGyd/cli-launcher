import { useState } from 'react'
import { useConfigStore } from '@/stores/useConfigStore'
import { useUiStore } from '@/stores/useUiStore'
import { launchAll, writeFile, readFile } from '@/services/tauri'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Plus, Rocket, Download, Upload, Settings } from 'lucide-react'
import { save, open } from '@tauri-apps/plugin-dialog'
import { SettingsDialog } from '@/components/SettingsDialog'

/** 为重复名称生成 "副本" / "副本 (2)" ... */
function dedupeTitle(title: string, existingTitles: Set<string>): string {
  if (!existingTitles.has(title)) return title
  let base = `${title} 副本`
  if (!existingTitles.has(base)) return base
  let i = 2
  while (existingTitles.has(`${base} (${i})`)) i++
  return `${base} (${i})`
}

export function Header() {
  const { items, addItem, setItems } = useConfigStore()
  const { searchQuery, setSearchQuery } = useUiStore()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleLaunchAll = async () => {
    const query = searchQuery.trim().toLowerCase()
    const source = query
      ? items.filter((i) =>
          i.title.toLowerCase().includes(query) ||
          i.dir.toLowerCase().includes(query) ||
          i.command.toLowerCase().includes(query)
        )
      : items
    const validItems = source.filter((item) => item.dir.trim() !== '')
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

  const handleImport = async () => {
    try {
      const path = await open({
        multiple: false,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })
      if (!path || typeof path !== 'string') return
      const content = await readFile(path)
      const imported = JSON.parse(content)
      if (!Array.isArray(imported)) return

      const existingTitles = new Set(items.map((i) => i.title))
      const newItems = imported.map((item: { title?: string; dir?: string; command?: string }) => {
        const title = dedupeTitle(item.title || '', existingTitles)
        existingTitles.add(title)
        return {
          id: crypto.randomUUID(),
          title,
          dir: item.dir || '',
          command: item.command || 'claude',
        }
      })
      setItems([...items, ...newItems])
    } catch (e) {
      console.error('导入失败:', e)
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

      <div className="flex-1 flex justify-center max-w-[240px]">
        <input
          type="text"
          placeholder="搜索配置..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-7 px-3 rounded-lg bg-muted/60 border-0 text-[12px] placeholder:text-muted-foreground/40 outline-none focus:ring-1 focus:ring-ring/30 transition-shadow"
        />
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="icon-sm" onClick={() => { setSearchQuery(''); addItem() }} />}>
            <Plus className="size-4" />
          </TooltipTrigger>
          <TooltipContent>添加配置</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="icon-sm" disabled={items.length === 0} onClick={handleExport} />}>
            <Download className="size-4" />
          </TooltipTrigger>
          <TooltipContent>导出配置</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="icon-sm" onClick={handleImport} />}>
            <Upload className="size-4" />
          </TooltipTrigger>
          <TooltipContent>导入配置</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="icon-sm" disabled={!hasValid} onClick={handleLaunchAll} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-950 dark:hover:border-emerald-700" />}>
            <Rocket className="size-4" />
          </TooltipTrigger>
          <TooltipContent>全部启动</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon-sm" onClick={() => setSettingsOpen(true)} />}>
            <Settings className="size-4" />
          </TooltipTrigger>
          <TooltipContent>设置</TooltipContent>
        </Tooltip>

        {settingsOpen && <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />}
      </div>
    </header>
  )
}
