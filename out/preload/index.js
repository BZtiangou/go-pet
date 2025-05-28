"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  launchPython: (feature) => electron.ipcRenderer.send("launch-python", feature),
  exitApp: () => electron.ipcRenderer.send("exit-app"),
  setIgnoreMouseEvents: (ignore) => electron.ipcRenderer.send("set-ignore-mouse-events", ignore)
});
