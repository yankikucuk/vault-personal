"use strict";

import {
  app,
  protocol,
  BrowserWindow,
  Tray,
  ipcMain,
  Menu,
  Notification,
} from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import path from "path";

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

const isDevelopment = process.env.NODE_ENV !== "production";
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  global.__static = path.join(__dirname, "/public").replace(/\\/g, "\\\\");
}

let tray = Tray || null;
let contextMenu = Menu || null;
let win = BrowserWindow || null;

autoUpdater.autoDownload = false;
autoUpdater.allowDowngrade = false;
autoUpdater.allowPrerelease = false;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.info("App starting...");
/* eslint-disable no-undef */
const iconpath = path.join(
  __static,
  `icon${process.platform === "win32" ? ".ico" : "-light.png"}`
);

function handleLinks(link) {
  if (win && win.webContents) {
    win.webContents.send("linkHandler", link);
  }
}

async function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    resizable: false,
    webPreferences: {
      webSecurity: process.env.NODE_ENV !== "development",
      allowRunningInsecureContent: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    win.loadURL(`app://./index.html`);
  }

  win.on("closed", () => {
    win = null;
  });

  win.webContents.once("dom-ready", () => {
    win.webContents.send("setAllowPrerelease", autoUpdater.allowPrerelease);
  });

  tray = new Tray(iconpath);

  contextMenu = Menu.buildFromTemplate([
    {
      label: "Uygulamayı Aç",
      click: () => {
        win.show();
        if (process.platform === "darwin") {
          app.dock.show();
        }
      },
    },
    {
      label: "Güncellemeleri Kontrol Et",
      click: () => {
        autoUpdater.checkForUpdates().then((UpdateCheckResult) => {
          win.webContents.send(
            "updaterHandler",
            "checkForUpdates",
            UpdateCheckResult
          );
          UpdateCheckResult;
        });
      },
    },
    {
      label: "Geliştirici Konsolu",
      click: () => {
        win.webContents.openDevTools({ mode: "detach" });
      },
    },
    { type: "separator" },
    {
      label: "Çıkış",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.on("right-click", () => tray.popUpContextMenu(contextMenu));

  // Ignore double click events for the tray icon
  tray.setIgnoreDoubleClickEvents(true);

  tray.on("click", () => {
    if (win.isVisible()) {
      win.hide();
      if (process.platform === "darwin") {
        app.dock.hide();
      }
    } else {
      win.show();
      if (process.platform === "darwin") {
        app.dock.show();
      }
    }
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.setAppUserModelId("playerberry.vault.personal");
app.setAsDefaultProtocolClient("vault-personal");

app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }

  createWindow();
});

// important for notifications on Windows
app.setAppUserModelId("playerberry.vault.personal");
app.setAsDefaultProtocolClient("vault-personal");

// Protocol handler for macOS
app.on("open-url", (event, url) => {
  event.preventDefault();
  handleLinks(url);
});

// event used when clicking on notifications
ipcMain.handle("open", () => {
  win.show();
  win.focus();
  if (process.platform === "darwin") {
    app.dock.show();
  }
});

ipcMain.handle("installUpdates", () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle("autoStart", (_event, enable) => {
  app.setLoginItemSettings({
    openAtLogin: enable,
  });
});

let lastNotificationBody = "";

ipcMain.handle("postFetchingNewUpdateNotification", (_event, news) => {
  const text = news.join("\n");

  if (text === "" || text === lastNotificationBody) return; // prevent notification spam

  const notification = new Notification({
    title: "New update ready to install",
    body: text,
    icon: path.join(
      __static,
      process.platform === "win32" ? "bigicon.png" : "icon.png"
    ),
  });

  notification.on("click", () => {
    win.show();
    win.focus();
  });

  notification.show();
  lastNotificationBody = text;
});

ipcMain.handle("checkUpdates", (_event, isBeta) => {
  autoUpdater.allowPrerelease = isBeta;

  autoUpdater.checkForUpdates().then((UpdateCheckResult) => {
    win.webContents.send(
      "updaterHandler",
      "checkForUpdates",
      UpdateCheckResult
    );
    UpdateCheckResult;
  });
});

// updater functions
autoUpdater.on("checking-for-update", () => {
  if (win && win.webContents) {
    win.webContents.send("updaterHandler", "checking-for-update");
  }
});

autoUpdater.on("update-available", (info) => {
  if (win && win.webContents) {
    win.webContents.send("updaterHandler", "update-available", info);
  }

  if (!installNagAlreadyShowed) {
    new Notification({
      title: "Yeni Bir Güncelleme Mevcut",
      body: `Vault: Personal ${info.version} sürümü indirilebilir durumda.`,
      icon: path.join(
        __static,
        process.platform === "win32" ? "bigicon.png" : "icon.png"
      ),
    }).show();

    // show install nag only once
    installNagAlreadyShowed = true;
  }
});

autoUpdater.on("update-not-available", () => {
  if (win && win.webContents) {
    win.webContents.send("updaterHandler", "update-not-available");
  }
});

autoUpdater.on("error", (err) => {
  if (win && win.webContents) {
    win.webContents.send("updaterHandler", "error", err);
    win.setProgressBar(-1);
  }
});

autoUpdater.on("download-progress", (progressObj) => {
  if (win && win.webContents) {
    win.webContents.send("updaterHandler", "download-progress", progressObj);
    win.setProgressBar(progressObj.percent / 100);
  }
});

let installNagAlreadyShowed = false;

/* eslint-disable no-unused-vars */
autoUpdater.on("update-downloaded", (info) => {
  if (!installNagAlreadyShowed) {
    if (win && win.webContents) {
      win.webContents.send("updaterHandler", "update-downloaded");
      win.setProgressBar(-1);
    }
  }
});

if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
