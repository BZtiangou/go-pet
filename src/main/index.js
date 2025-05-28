//主进程

import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, is } from '@electron-toolkit/utils'


//const fs = require('fs');

//const isWin = process.platform === 'win32';

//const path = require('path');
//const { spawn } = require('child_process');



let mainWindow

function createWindow() {
// 获取主显示器工作区尺寸（全屏展示）
const { width, height } = screen.getPrimaryDisplay().workAreaSize

// 创建全屏、无边框、透明的窗口
mainWindow = new BrowserWindow({
width,
height,
x: 0,
y: 0,
frame: false, // 无系统边框
transparent: true, // 背景全透明
resizable: false,
hasShadow: false,
alwaysOnTop: true,
skipTaskbar: true,
// fullscreen 可选，如需要真正全屏方式可以添加 fullscreen: true,
fullscreenable: false,
focusable: false, // 默认不聚焦（辅助鼠标穿透）
backgroundColor: '#00000000',
webPreferences: {
preload: join(__dirname, '../preload/index.js'),
contextIsolation: true,
sandbox: false
}
})

// 初始设置窗口忽略鼠标事件，实现点击穿透
mainWindow.setIgnoreMouseEvents(true, { forward: true })

mainWindow.once('ready-to-show', () => {
mainWindow.show()
})

// 根据环境加载 URL 或本地文件
if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
} else {
mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
}

// 退出应用的 IPC 事件
ipcMain.on('exit-app', () => {
app.quit()
})

// 切换鼠标事件状态的 IPC 事件
ipcMain.on('set-ignore-mouse-events', (_, ignore) => {
mainWindow.setIgnoreMouseEvents(ignore, { forward: true })
// 切换 focusable 状态，保证需要交互时窗口能接收事件
mainWindow.setFocusable(!ignore)
})
}

app.whenReady().then(() => {
electronApp.setAppUserModelId('com.electron.dogpet')
createWindow()

app.on('activate', () => {
if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
})

app.on('window-all-closed', () => {
if (process.platform !== 'darwin') app.quit()
})

/*
ipcMain.on('launch-python', (_e, feature) => {
  if (feature !== 'goal') return;    // 仅处理 Fun‑3

  const script = path.resolve(__dirname, '../../src/renderer/views/function/fun3/goal_manager.vue');


  if (!fs.existsSync(script)) {
    console.error('[Python‑GUI] script not found:', script);
    return;
  }

  const pythonCmd = isWin ? 'python' : 'python3';
  spawn(pythonCmd, [script], {
    detached: true,
    stdio: 'ignore'
  }).unref();
});
*/