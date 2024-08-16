const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');
const screenshot = require('screenshot-desktop');
const robot = require('robotjs'); // Import robotjs

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

        var obj = typeof data === 'string' ? JSON.parse(data) : data;

        var x = obj.x;
        var y = obj.y;
        console.log("Moving mouse to coordinates:", x, y);

        robot.moveMouse(x, y); // Use robotjs to move the mouse
    });

    // Handle mouse clicks
    socket.on('mouse-click', (data) => {
        console.log("Mouse click received");
        robot.mouseClick(); // Use robotjs to click the mouse
    });

    // Handle key presses
    socket.on('type', (data) => {
        console.log("Received type data:", data);

        var obj = typeof data === 'string' ? JSON.parse(data) : data;
        var key = obj.key;
        console.log("Typing key:", key);

        // Type the key using robotjs
        robot.keyTap(key);
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
            var imgStr = Buffer.from(img).toString('base64');
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
