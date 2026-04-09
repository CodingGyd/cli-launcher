import { useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import type { ConfigItem as ConfigItemType } from '@/types'
import { launchCmd, createDir, openFolder } from '@/services/tauri'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Play, FolderOpen, Trash2, GripVertical, Loader2, Check, FolderPlus, ExternalLink } from 'lucide-react'

const GRADIENTS = [
  'from-blue-500 to-cyan-400',
  'from-violet-500 to-purple-400',
  'from-orange-500 to-amber-400',
  'from-emerald-500 to-teal-400',
  'from-rose-500 to-pink-400',
  'from-indigo-500 to-blue-400',
  'from-fuchsia-500 to-pink-400',
  'from-teal-500 to-emerald-400',
]

interface Props {
  item: ConfigItemType
  index: number
  total: number
  onUpdate: (id: string, field: 'title' | 'dir' | 'command', value: string) => void
  onRemove: (id: string) => void
  dragHandleProps?: Record<string, unknown>
}

export function ConfigItemRow({
  item,
  index,
  onUpdate,
  onRemove,
  dragHandleProps,
}: Props) {
  const [launching, setLaunching] = useState(false)
  const [launched, setLaunched] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(false)
  const [dirExists, setDirExists] = useState(false)
  const gradient = GRADIENTS[index % GRADIENTS.length]

  const handleBrowse = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: item.dir.trim() || undefined,
      })
      if (selected && typeof selected === 'string') {
        onUpdate(item.id, 'dir', selected)
      }
    } catch {
      // 用户取消选择
    }
  }

  const handleLaunch = async () => {
    if (!item.dir.trim()) return
    setLaunching(true)
    try {
      await launchCmd(item.dir, item.command || 'claude', item.title)
      setLaunched(true)
      setTimeout(() => setLaunched(false), 1500)
    } catch (e) {
      console.error('启动失败:', e)
    } finally {
      setLaunching(false)
    }
  }

  const handleDelete = () => {
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    onRemove(item.id)
    setDeleteOpen(false)
  }

  const handleCreateDir = async () => {
    if (!item.dir.trim()) return
    setCreating(true)
    try {
      const ok = await createDir(item.dir)
      if (ok) {
        setCreated(true)
        setDirExists(false)
        setTimeout(() => setCreated(false), 1500)
      } else {
        setDirExists(true)
      }
    } catch (e) {
      window.alert(String(e))
    } finally {
      setCreating(false)
    }
  }

  const handleOpenFolder = async () => {
    if (!item.dir.trim()) return
    try {
      await openFolder(item.dir)
    } catch (e) {
      console.error('打开文件夹失败:', e)
    }
  }

  return (
    <div className="group relative rounded-xl border border-border/50 bg-card text-card-foreground transition-all duration-200 hover:border-border hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/20 overflow-hidden">
      {/* 渐变顶部条 */}
      <div className={`h-[3px] bg-gradient-to-r ${gradient}`} />

      {/* 顶部：拖拽 + 标题 + 操作 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 24px 10px 24px' }}>
        <Tooltip>
          <TooltipTrigger
            {...dragHandleProps}
            className="flex items-center justify-center w-5 cursor-grab active:cursor-grabbing text-muted-foreground/25 hover:text-muted-foreground/60 transition-colors shrink-0 select-none"
          >
            <GripVertical className="size-4" />
          </TooltipTrigger>
          <TooltipContent side="right">拖拽排序</TooltipContent>
        </Tooltip>

        <Input
          value={item.title}
          onChange={(e) => onUpdate(item.id, 'title', e.target.value)}
          placeholder="未命名配置"
          className="flex-1 h-8 border-transparent bg-transparent font-semibold text-sm shadow-none px-1 placeholder:text-muted-foreground/35 placeholder:font-normal"
        />

        {/* 启动按钮 */}
        <Button
          size="icon-sm"
          disabled={!item.dir.trim() || launching}
          onClick={handleLaunch}
          className={`shrink-0 border-0 transition-all duration-300 ${
            launched
              ? 'bg-emerald-500 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-md hover:shadow-emerald-500/25 text-white'
          }`}
        >
          {launching ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : launched ? (
            <Check className="size-3.5" />
          ) : (
            <Play className="size-3.5" />
          )}
        </Button>

        {/* 删除按钮 */}
        <Button
          size="icon-sm"
          onClick={handleDelete}
          className="shrink-0 border-0 bg-muted text-muted-foreground hover:bg-destructive hover:text-white transition-colors"
        >
          <Trash2 className="size-3.5" />
        </Button>

        {/* 删除确认弹框 */}
        {deleteOpen && (
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent showCloseButton={false} style={{ maxWidth: 360, padding: 0, gap: 0 }}>
              <div style={{ padding: '24px 28px 20px' }}>
                <DialogTitle style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>确认删除</DialogTitle>
                <DialogDescription style={{ fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
                  确定要删除「{item.title || '未命名配置'}」吗？此操作不可撤销。
                </DialogDescription>
              </div>
              <div className="flex justify-end gap-2" style={{ padding: '12px 28px 20px' }}>
                <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(false)}>
                  取消
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={confirmDelete}
                >
                  删除
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* 字段区域 */}
      <div style={{ padding: '8px 24px 20px 52px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 工作目录 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="text-[10px] font-medium text-muted-foreground/50 tracking-wide select-none uppercase">
            工作目录
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Input
              value={item.dir}
              onChange={(e) => onUpdate(item.id, 'dir', e.target.value)}
              placeholder="文件夹路径"
              className="flex-1 min-w-0 h-9 text-[13px]"
            />
            <Button variant="outline" size="sm" onClick={handleBrowse} className="shrink-0 gap-1.5 px-3">
              <FolderOpen className="size-3" />
              浏览
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!item.dir.trim()}
              onClick={handleOpenFolder}
              className="shrink-0 gap-1.5 px-3"
            >
              <ExternalLink className="size-3" />
              打开
            </Button>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!item.dir.trim() || creating}
                  onClick={handleCreateDir}
                  className={`shrink-0 gap-1.5 px-3 border-0 transition-all duration-300 ${
                    created
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : ''
                  }`}
                >
                  {creating ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : created ? (
                    <Check className="size-3" />
                  ) : (
                    <FolderPlus className="size-3" />
                  )}
                  新建
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {created ? '已新建' : dirExists ? '目录已存在，无需重复新建' : '新建文件夹'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 执行指令 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="text-[10px] font-medium text-muted-foreground/50 tracking-wide select-none uppercase">
            执行指令
          </label>
          <Input
            value={item.command}
            onChange={(e) => onUpdate(item.id, 'command', e.target.value)}
            placeholder="例如: claude"
            className="h-9 text-[13px] font-mono"
          />
        </div>
      </div>
    </div>
  )
}
