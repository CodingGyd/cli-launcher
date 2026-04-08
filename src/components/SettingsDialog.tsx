import { useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useThemeStore } from '@/stores/useThemeStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { writeFile } from '@/services/tauri'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FolderOpen, Sun, Moon } from 'lucide-react'

const CONFIG_FILENAME = 'clilauncher-config.json'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open: isOpen, onOpenChange }: SettingsDialogProps) {
  const { dataDir, setDataDir } = useSettingsStore()
  const { theme, toggleTheme } = useThemeStore()
  const items = useConfigStore((s) => s.items)
  const [loading, setLoading] = useState(false)

  const handleBrowse = async () => {
    const selected = await open({ directory: true, multiple: false })
    if (!selected) return

    setLoading(true)
    try {
      const filePath = `${selected}\\${CONFIG_FILENAME}`
      await writeFile(filePath, JSON.stringify(items, null, 2))
      setDataDir(selected)
    } catch (e) {
      console.error('切换数据目录失败:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setDataDir(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} style={{ maxWidth: 480, padding: 0, gap: 0 }}>
        {/* 标题栏 */}
        <div style={{ padding: '24px 28px 16px' }}>
          <DialogTitle style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>设置</DialogTitle>
          <DialogDescription style={{ fontSize: 12, marginTop: 4 }}>
            管理应用配置和数据存储
          </DialogDescription>
        </div>

        <Separator />

        {/* 设置项 */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* 数据存储 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, overflow: 'hidden' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>数据存储</span>
              {dataDir ? (
                <code style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {dataDir}
                </code>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>默认存储</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <Button variant="outline" size="sm" onClick={handleBrowse} disabled={loading} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FolderOpen style={{ width: 14, height: 14 }} />
                {dataDir ? '更改' : '选择'}
              </Button>
              {dataDir && (
                <Button variant="ghost" size="sm" onClick={handleReset} style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                  重置
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* 外观 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px', gap: 24 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>外观</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', borderRadius: 8, background: 'var(--muted)', padding: 3, gap: 2 }}>
              <button
                onClick={() => { if (theme === 'dark') toggleTheme() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
                  background: theme === 'light' ? 'var(--card)' : 'transparent',
                  color: theme === 'light' ? 'var(--foreground)' : 'var(--muted-foreground)',
                  boxShadow: theme === 'light' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <Sun style={{ width: 14, height: 14 }} />
                浅色
              </button>
              <button
                onClick={() => { if (theme === 'light') toggleTheme() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
                  background: theme === 'dark' ? 'var(--card)' : 'transparent',
                  color: theme === 'dark' ? 'var(--foreground)' : 'var(--muted-foreground)',
                  boxShadow: theme === 'dark' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <Moon style={{ width: 14, height: 14 }} />
                深色
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
