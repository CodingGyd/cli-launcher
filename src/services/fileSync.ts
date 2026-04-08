import { useSettingsStore } from '@/stores/useSettingsStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { readFile, writeFile, getExeDir } from '@/services/tauri'

const CONFIG_FILENAME = 'clilauncher-config.json'

let debounceTimer: ReturnType<typeof setTimeout> | null = null

/** 初始化文件同步 */
export async function initFileSync() {
  let { dataDir } = useSettingsStore.getState()

  // 如果未设置自定义目录，默认使用程序安装目录下的 data 子目录
  if (!dataDir) {
    try {
      const exeDir = await getExeDir()
      dataDir = `${exeDir}\\data`
      useSettingsStore.getState().setDataDir(dataDir)
    } catch {
      return
    }
  }

  // 从文件加载配置
  const filePath = `${dataDir}\\${CONFIG_FILENAME}`
  try {
    const content = await readFile(filePath)
    const items = JSON.parse(content)
    if (Array.isArray(items)) {
      useConfigStore.getState().setItems(items)
    }
  } catch {
    // 文件不存在，将现有数据写入文件
    const { items } = useConfigStore.getState()
    if (items.length > 0) {
      try {
        await writeFile(filePath, JSON.stringify(items, null, 2))
      } catch {
        // 写入失败，忽略
      }
    }
  }

  // 订阅配置变更，写入文件
  useConfigStore.subscribe((state) => {
    const { dataDir } = useSettingsStore.getState()
    if (!dataDir) return

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const filePath = `${dataDir}\\${CONFIG_FILENAME}`
      writeFile(filePath, JSON.stringify(state.items, null, 2)).catch((e) =>
        console.error('同步配置文件失败:', e)
      )
    }, 300)
  })
}
