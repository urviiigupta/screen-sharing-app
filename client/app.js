const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid');
const screenshot = require('screenshot-desktop');
const robot = require('robotjs'); // Import robotjs

let socket;
try {
    socket = require('socket.io-client')('http://192.168.1.18:5000');
    console.log('Socket connected');
} catch (error) {
    console.error('Failed to connect to server:', error);
}

let interval;

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

        const obj = typeof data === 'string' ? JSON.parse(data) : data;
        const { x, y } = obj;
        console.log("Moving mouse to coordinates:", x, y);

        robot.moveMouse(x, y); // Use robotjs to move the mouse
    });

    // Handle mouse clicks
    socket.on('mouse-click', (data) => {
        console.log("Mouse click received");
        robot.mouseClick(); // Use robotjs to click the mouse
    });

    // Handle mouse button down events
    socket.on('mouse-down', (data) => {
        console.log("Mouse down received");
        const button = data.button === 2 ? 'right' : 'left';
        robot.mouseToggle('down', button); // Use robotjs to press the mouse button
    });

    // Handle mouse button up events
    socket.on('mouse-up', (data) => {
        console.log("Mouse up received");
        const button = data.button === 2 ? 'right' : 'left';
        robot.mouseToggle('up', button); // Use robotjs to release the mouse button
    });

    // Handle double-click events
    socket.on('mouse-dblclick', (data) => {
        console.log("Mouse double-click received");
        robot.mouseClick(); // Use robotjs to perform a double-click
    });

    // Handle right-click events
    socket.on('mouse-right-click', (data) => {
        console.log("Mouse right-click received");
        robot.mouseClick('right'); // Use robotjs to perform a right-click
    });

    // Handle mouse wheel events
    socket.on('mouse-wheel', (data) => {
        console.log("Mouse wheel received");
        robot.scrollMouse(data.deltaX, data.deltaY); // Use robotjs to scroll the mouse
    });

    // Handle key presses
    socket.on('type', (data) => {
        console.log("Received type data:", data);

        const obj = typeof data === 'string' ? JSON.parse(data) : data;
        const { key } = obj;
        console.log("Typing key:", key);

        robot.keyTap(key);
    });

    // Handle key down events
    socket.on('key-down', (data) => {
        console.log("Key down received");
        const { key } = data;
        robot.keyToggle(key, 'down'); // Use robotjs to hold the key down
    });

    // Handle key up events
    socket.on('key-up', (data) => {
        console.log("Key up received");
        const { key } = data;
        robot.keyToggle(key, 'up'); // Use robotjs to release the key
    });

    // Handle key press events
    socket.on('key-press', (data) => {
        console.log("Key press received");
        const { key } = data;
        robot.keyTap(key); // Use robotjs to tap the key
    });

    // Additional events from display.html
    socket.on('window-blur', (data) => {
        console.log("Window blur event received:", data);
        // Handle window blur event
    });

    socket.on('window-focus', (data) => {
        console.log("Window focus event received:", data);
        // Handle window focus event
    });

    socket.on('window-resize', (data) => {
        console.log("Window resize event received:", data);
        // Handle window resize event
    });

    socket.on('window-scroll', (data) => {
        console.log("Window scroll event received:", data);
        // Handle window scroll event
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
    const uuid = "test";
    console.log('Generated UUID:', uuid);
    socket.emit('join-message', uuid);
    event.reply('uuid', uuid);

    interval = setInterval(() => {
        screenshot().then((img) => {
            const imgStr = Buffer.from(img).toString('base64');
            const obj = { room: uuid, image: imgStr };

            socket.emit('screen-data', JSON.stringify(obj));
        });
    }, 100);
});

ipcMain.on('stop-share', function (event, arg) {
    console.log('stop-share event received');
    clearInterval(interval);
});
