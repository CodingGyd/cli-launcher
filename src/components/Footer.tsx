import { useConfigStore } from '@/stores/useConfigStore'

export function Footer() {
  const { items } = useConfigStore()
  const validCount = items.filter((i) => i.dir.trim() !== '').length

  return (
    <footer
      className="border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground/50 shrink-0 select-none"
      style={{ padding: '10px 24px' }}
    >
      <span>
        {items.length} 个配置，{validCount} 个可用
      </span>
      <span>CliLauncher v1.0.0</span>
    </footer>
  )
}
