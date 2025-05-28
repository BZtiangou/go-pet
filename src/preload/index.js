import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
launchPython: (feature) => ipcRenderer.send('launch-python', feature),
exitApp: () => ipcRenderer.send('exit-app'),
setIgnoreMouseEvents: (ignore) => ipcRenderer.send('set-ignore-mouse-events', ignore)
})