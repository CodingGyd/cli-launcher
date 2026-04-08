# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 语言要求

**始终使用中文与用户交流**，包括代码注释、提交信息、PR 描述等所有非代码内容。

## 项目概述

命令行窗口唤醒小助手 — 基于 Tauri v2 的桌面应用，用于批量打开 cmd 窗口并自动执行预配置的文件夹路径和指令。主要使用场景：快速启动多个 Claude CLI 会话。

## 技术栈

- **桌面框架**: Tauri v2 (Rust 后端 + React 前端)
- **前端**: React 19 + TypeScript + Vite
- **样式**: Tailwind CSS v4 + CSS 自定义变量（无外部 UI 组件库，UI 全部内联样式引用 CSS 变量）
- **状态管理**: Zustand + localStorage 持久化
- **平台**: 仅 Windows（依赖 `wt.exe`、Windows `CommandExt`）

## 常用命令

```bash
npm run tauri:dev      # 启动开发模式（前端 :23457 + Rust 热重载）
npm run tauri:build    # 生产构建（NSIS 安装包，SimpChinese + English）
npm run dev             # 仅启动前端开发服务器
npm run build           # TypeScript 检查 + Vite 构建
cargo check --manifest-path src-tauri/Cargo.toml  # 仅检查 Rust 编译
```

## 架构

### 前后端通信

前端通过 `src/services/tauri.ts` 统一调用后端（封装 `invoke`）。后端在 `src-tauri/src/lib.rs` 注册命令和插件。

### Rust 后端（`src-tauri/src/commands/mod.rs`）

两个 Tauri 命令通过 `wt.exe` 打开 Windows Terminal 选项卡：
- `launch_cmd(dir, command, title)` — 单个启动
- `launch_all(items)` — 批量启动

关键实现细节：
- 使用 `raw_arg` 而非 `args` 传递命令行，避免 Windows 参数转义问题
- 使用 `CREATE_NO_WINDOW` 标志（`wt` 是 GUI 应用，此标志防止多余窗口）
- 设置选项卡标题时**必须**加 `--suppressApplicationTitle`，否则 shell/应用会覆盖标题

### 前端组件层级

`App` → `Header`（添加/全部启动/主题切换）+ `ConfigList` → `ConfigItem`（单行配置）+ `Footer`

### 状态持久化

两个 Zustand store 均使用 `persist` 中间件：
- `useConfigStore`（key: `cli-launcher-config`）— 配置项列表，新项默认 command 为 `claude`
- `useThemeStore`（key: `cmd-launcher-theme`）— 明暗主题，重新加载时立即应用 `dark` class 到 `<html>`

### 主题系统

`src/index.css` 中通过 `:root` 和 `.dark` 定义 CSS 变量（`--bg-primary`, `--accent` 等），UI 组件通过内联 `style` 引用这些变量。无 Tailwind 配置文件（v4 使用 CSS-first 配置）。

## 开发约定

- 路径别名：`@` 映射到 `./src`
- Tauri 权限配置在 `src-tauri/capabilities/default.json`
- 单实例插件已启用（`tauri-plugin-single-instance`）
