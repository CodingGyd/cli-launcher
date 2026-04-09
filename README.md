# CliLauncher

命令行窗口唤醒助手 — 基于 Tauri v2 的 Windows 桌面应用，用于批量打开 Windows Terminal 选项卡并自动执行预配置的命令。主要使用场景：快速启动多个 Claude CLI 会话。

## 功能特性

- 批量配置工作目录和启动命令
- 一键启动所有配置项，自动在 Windows Terminal 中打开对应选项卡
- 拖拽排序配置项
- 配置导入/导出（JSON 格式）
- 明暗主题切换
- 系统托盘驻留，关闭窗口不退出
- 支持自定义数据存储目录
- 快速用资源管理器打开工作目录

## 技术栈

- **桌面框架**: [Tauri v2](https://v2.tauri.app/) (Rust + React)
- **前端**: React 19 + TypeScript + Vite
- **样式**: Tailwind CSS v4 + shadcn/ui
- **状态管理**: Zustand
- **平台**: 仅 Windows（依赖 Windows Terminal）

## 开发

```bash
# 安装依赖
npm install

# 启动开发模式
npm run tauri:dev

# 生产构建
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/`，包含 NSIS 安装包和 MSI 安装包。

## License

[MIT](LICENSE)
