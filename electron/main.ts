// The built directory structure
//
// ├─┬ dist
// │ ├─┬ electron
// │ │ ├── main.js
// │ │ └── preload.js
// │ ├── index.html
// │ ├── ...other-static-files-from-public
// │
process.env.DIST = join(__dirname, '..')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public')

import { join } from 'path'
import { app, BrowserWindow, ipcMain, nativeImage} from 'electron'

const Store = require('electron-store');

const schema = {
	volume: {
		type: 'number',
		maximum: 100,
		minimum: 0,
		default: 50
	},
	theme: {
		type: 'string',
		default: 'light'
	}
};
const store = new Store({schema});

let win: BrowserWindow | null
// Here, you can also use other preload
const preload = join(__dirname, './preload.js')
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const url = process.env['VITE_DEV_SERVER_URL']

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

const image_icon = nativeImage.createFromPath(
  app.getAppPath() + "/public/naxi.png"
);

function createWindow() {
  win = new BrowserWindow({
    icon: image_icon,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload,
      webSecurity: false,
      devTools: true
    },
    minWidth: 640,
    minHeight: 420,
    autoHideMenuBar: true,
  })

  win.setIcon(image_icon);

  win.setSize(1000,600)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  //win.webContents.openDevTools()

  if (app.isPackaged) {
    win.loadFile(join(process.env.DIST, 'index.html'))
  } else {
    win.loadURL(url)
  }
}

app.on('window-all-closed', () => {
  win = null
})

let save_cache = (_event, data) => {
  store.set('volume', data.volume)
  store.set('theme', data.theme)
}

let get_cache = () => {
  return {
    volume: store.get('volume'),
    theme: store.get('theme')
  }
}

app.whenReady().then(() => {
  ipcMain.on('save_cache', save_cache)
  ipcMain.handle('get_cache', get_cache)
  createWindow();
})
