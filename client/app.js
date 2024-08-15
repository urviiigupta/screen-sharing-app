const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');
const screenshot = require('screenshot-desktop');

var socket;
try {
    socket = require('socket.io-client')('http://localhost:5000');
    console.log('Socket connected');
} catch (error) {
    console.error('Failed to connect to server:', error);
}

var interval;

function createWindow() {
    const win = new BrowserWindow({
        width: 500,
        height: 150,
        webPreferences: {
            nodeIntegration: true, // Enable Node.js integration
            contextIsolation: false // Disable context isolation
        }
    });
    win.removeMenu();
    win.loadFile('index.html');
    win.webContents.openDevTools();

    // Handle mouse movements
    socket.on('mouse-move', (data) => {
        console.log("Received mouse-move data:", data);

        // Ensure data is parsed only if it's a string
        var obj = typeof data === 'string' ? JSON.parse(data) : data;

        var x = obj.x;
        var y = obj.y;
        win.webContents.sendInputEvent({
            type: 'mousemove',
            x: x,
            y: y
        });
    });

    // Handle mouse clicks
    socket.on('mouse-click', (data) => {
        console.log("Received mouse-click data:", data);

        win.webContents.sendInputEvent({
            type: 'mouseDown',
            button: 'left',
            clickCount: 1
        });
        win.webContents.sendInputEvent({
            type: 'mouseUp',
            button: 'left',
            clickCount: 1
        });
    });

    // Handle key presses
    socket.on('type', (data) => {
        console.log("Received type data:", data);

        // Ensure data is parsed only if it's a string
        var obj = typeof data === 'string' ? JSON.parse(data) : data;

        var key = obj.key;
        win.webContents.sendInputEvent({
            type: 'keyDown',
            keyCode: key
        });
        win.webContents.sendInputEvent({
            type: 'keyUp',
            keyCode: key
        });
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on('start-share', function (event, arg) {
    console.log('start-share event received');
    var uuid = "test";
    console.log('Generated UUID:', uuid);
    socket.emit('join-message', uuid);
    event.reply('uuid', uuid);

    interval = setInterval(() => {
        screenshot().then((img) => {
            var imgStr = new Buffer(img).toString('base64');
            var obj = {};
            obj.room = uuid;
            obj.image = imgStr;

            socket.emit('screen-data', JSON.stringify(obj));
        });
    }, 100);
});

ipcMain.on('stop-share', function (event, arg) {
    console.log('stop-share event received');
    clearInterval(interval);
});
