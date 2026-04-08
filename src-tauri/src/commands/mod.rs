//! Tauri 命令处理 - 打开 cmd 窗口

use serde::{Deserialize, Serialize};
use std::fs;
use std::os::windows::process::CommandExt;
use std::process::Command;

/// 配置项：窗口标题 + 文件夹路径 + 执行指令
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigItem {
    pub title: String,
    pub dir: String,
    pub command: String,
}

/// 隐藏本进程的控制台窗口（wt 是 GUI 应用，此标志防止出现多余窗口）
const CREATE_NO_WINDOW: u32 = 0x08000000;

/// 构建 wt 命令行参数字符串
/// 使用 raw_arg 直接传递，避免 Rust Command::args() 的 Windows 参数转义问题
fn build_wt_args(title: &str, dir: &str, command: &str) -> String {
    let mut s = String::from("new-tab");

    // 设置选项卡标题
    if !title.is_empty() {
        s.push_str(&format!(" --title \"{}\"", title));
        // 关键：阻止 shell/应用覆盖选项卡标题
        // 否则 cmd.exe 或 claude 等程序启动后会立即覆盖 --title 的值
        s.push_str(" --suppressApplicationTitle");
    }

    // 工作目录
    s.push_str(&format!(" -d \"{}\"", dir));

    // 要执行的命令
    s.push_str(&format!(" cmd /k \"{}\"", command));

    s
}

/// 打开单个 cmd 窗口，切换到指定目录并执行指令
#[tauri::command]
pub fn launch_cmd(dir: String, command: String, title: String) -> Result<(), String> {
    let args = build_wt_args(&title, &dir, &command);

    Command::new("wt")
        .raw_arg(&args)
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .map_err(|e| format!("启动 cmd 失败: {}", e))?;
    Ok(())
}

/// 批量打开多个 cmd 窗口
#[tauri::command]
pub fn launch_all(items: Vec<ConfigItem>) -> Result<(), String> {
    for item in items {
        let args = build_wt_args(&item.title, &item.dir, &item.command);

        Command::new("wt")
            .raw_arg(&args)
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map_err(|e| format!("启动 cmd 失败 ({}): {}", item.dir, e))?;
    }
    Ok(())
}

/// 将文本内容写入指定路径的文件（自动创建父目录）
#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = std::path::Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| format!("创建目录失败: {}", e))?;
    }
    fs::write(&path, content).map_err(|e| format!("写入文件失败: {}", e))
}

/// 从指定路径读取文本文件内容
#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("读取文件失败: {}", e))
}

/// 获取当前程序所在目录的路径
#[tauri::command]
pub fn get_exe_dir() -> Result<String, String> {
    let exe = std::env::current_exe().map_err(|e| format!("获取程序路径失败: {}", e))?;
    let dir = exe
        .parent()
        .ok_or("无法获取程序目录")?;
    Ok(dir.to_string_lossy().to_string())
}
