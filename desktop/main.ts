import path from "node:path";
import { fileURLToPath } from "node:url";

import { app, BrowserWindow, Menu, shell } from "electron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === "development";

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			webSecurity: true,
		},
		icon: path.join(__dirname, "assets/icon.png"),
		show: false,
	});

	const startUrl = isDev
		? process.env.ELECTRON_START_URL || "http://localhost:5173"
		: `file://${path.join(__dirname, "../dist-web/index.html")}`;

	mainWindow.loadURL(startUrl);

	mainWindow.once("ready-to-show", () => {
		mainWindow.show();

		if (isDev) {
			mainWindow.webContents.openDevTools();
		}
	});

	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		shell.openExternal(url);
		return { action: "deny" };
	});

	// メニューを完全に無効化
	Menu.setApplicationMenu(null);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

app.on("web-contents-created", (event, contents) => {
	contents.on("new-window", (event, navigationUrl) => {
		event.preventDefault();
		shell.openExternal(navigationUrl);
	});
});
