import { app, BrowserWindow, ipcMain, screen, Menu } from 'electron'
import contextMenu from 'electron-context-menu'
import debounce from 'lodash/debounce'

import menu from './menu'

import {
  MIN_HEIGHT,
  MIN_WIDTH,
  DEFAULT_WINDOW_WIDTH,
  DEFAULT_WINDOW_HEIGHT,
} from '~/config/constants'

let mainWindow = null

const isDev = __DEV__

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }

      mainWindow.focus()
    }
  })
}

contextMenu({
  showInspectElement: isDev,
  showCopyImageAddress: false,
  // TODO: i18n for labels
  labels: {
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    copyLink: 'Copy Link',
    inspect: 'Inspect element',
  },
})

const getWindowPosition = (width, height, display = screen.getPrimaryDisplay()) => {
  const { bounds } = display

  return {
    x: Math.ceil(bounds.x + (bounds.width - width) / 2),
    y: Math.ceil(bounds.y + (bounds.height - height) / 2),
  }
}

const saveWindowSettings = window => {
  const windowParamsHandler = () => {
    const [width, height] = window.getSize()
    const [x, y] = window.getPosition()
    // USE DB TO SAVE POSITION
  }

  window.on('resize', debounce(windowParamsHandler, 100))
  window.on('move', debounce(windowParamsHandler, 100))
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = true // process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS']
  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload)),
  ).catch(console.log)
}

const defaultWindowOptions = {
  // icons: 'path/to/icon'
  backgroundColor: '#fff',
  webPreferences: {
    blinkFeatures: 'OverlayScrollbars',
    devTools: isDev,
    experimentalFeatures: true,
    nodeIntegration: true,
  },
}

async function createMainWindow() {
  // TODO use DB to retrieve users params
  //  const savedDimensions = await db.getKey('windowParams', 'MainWindow.dimensions', {})
  //  const savedPositions = await db.getKey('windowParams', 'MainWindow.positions', null)
  const width = /* savedDimensions.width || */ DEFAULT_WINDOW_WIDTH
  const height = /* savedDimensions.height || */ DEFAULT_WINDOW_HEIGHT

  const windowOptions = {
    ...defaultWindowOptions,
    ...getWindowPosition(width, height),
    /* eslint-disable indent */
    ...(process.platform === 'darwin'
      ? {
          frame: false,
          titleBarStyle: 'hiddenInset',
        }
      : {}),
    /* eslint-enable indent */
    width,
    height,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  }

  mainWindow = new BrowserWindow(windowOptions)

  mainWindow.name = 'MainWindow'

  ipcMain.once('main-window-ready', () => {
    mainWindow.show()
  })

  saveWindowSettings(mainWindow)

  if (isDev) {
    mainWindow.loadURL(INDEX_URL)
  } else {
    mainWindow.loadURL(`file://${__dirname}/index.html`)
  }

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => (mainWindow = null))
}

app.on('ready', async () => {
  if (isDev) {
    await installExtensions()
  }

  Menu.setApplicationMenu(menu)

  await createMainWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow()
  }
})
