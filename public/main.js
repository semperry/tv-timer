require("@electron/remote/main").initialize();
const { app, BrowserWindow, ipcMain } = require("electron");

let clockWindow;
let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,
		},
	});

	mainWindow.loadURL("http://localhost:3000");
	mainWindow.webContents.openDevTools();

	ipcMain.on("reset-timer-send", (e, args) => {
		mainWindow.webContents.send("reset-timer-receive", args);
	});
}

function createClock() {
	clockWindow = new BrowserWindow({
		title: "Clock",
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			contextIsolation: false,
		},
	});
	clockWindow.setMenu(null);
	clockWindow.webContents.openDevTools();
	clockWindow.loadURL("http://localhost:3000/#clock");
	clockWindow.fullScreenable = true;

	ipcMain.on("time-send", (e, args) => {
		clockWindow.webContents.send("time-receive", args);
	});

	ipcMain.on("fullscreen-send", (e, args) => {
		clockWindow.webContents.send("fullscreen-receive", args);
		clockWindow.fullScreen = args;
	});

	ipcMain.on("start-timer-send", (e, args) => {
		clockWindow.webContents.send("start-timer-receive", args);
	});

	ipcMain.on("display-options-send", (e, args) => {
		clockWindow.webContents.send("display-options-receive", args);
	});

	ipcMain.on("coordinates-send", (e, args) => {
		clockWindow.webContents.send("coordinates-receive", args);
	});

	clockWindow.on("close", (e) => {
		mainWindow.webContents.send("close-clock");
	});
}

app.whenReady().then(createWindow);

ipcMain.on("open-clock", (e, arg) => {
	if (BrowserWindow.getAllWindows().length < 2) createClock();
	else if (clockWindow) clockWindow.show();
});

ipcMain.on("close-clock", (e, arg) => {
	clockWindow.hide();
	mainWindow.webContents.send("close-clock");
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
