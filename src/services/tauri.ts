import { invoke } from '@tauri-apps/api/core'
import type { ConfigItem } from '@/types'

/** 打开单个 cmd 窗口 */
export async function launchCmd(dir: string, command: string, title: string): Promise<void> {
  await invoke('launch_cmd', { dir, command, title })
}

/** 批量打开所有 cmd 窗口 */
export async function launchAll(items: ConfigItem[]): Promise<void> {
  await invoke('launch_all', { items })
}
