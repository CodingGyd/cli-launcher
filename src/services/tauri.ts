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

/** 将文本内容写入文件 */
export async function writeFile(path: string, content: string): Promise<void> {
  await invoke('write_file', { path, content })
}

/** 从文件读取文本内容 */
export async function readFile(path: string): Promise<string> {
  return await invoke<string>('read_file', { path })
}

/** 获取当前程序所在目录 */
export async function getExeDir(): Promise<string> {
  return await invoke<string>('get_exe_dir')
}
