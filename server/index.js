var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cors = require('cors');

// Use CORS middleware
app.use(cors());

app.get('/view', (req, res) => {
    res.sendFile(__dirname + '/display.html');
});

io.on('connection', (socket) => {
    socket.on('join-message', (roomId) => {
        socket.join(roomId);
        console.log("User joined room: " + roomId);
    });

    socket.on('screen-data', (data) => {
        data = JSON.parse(data);
        var room = data.room;
        var imgStr = data.image;
        socket.broadcast.to(room).emit('screen-data', imgStr);
    });

    // Handle mouse events
    socket.on('mouse-move', (data) => {
        data = JSON.parse(data);
        var room = data.room;
        socket.broadcast.to(room).emit('mouse-move', data);
    });

    socket.on('mouse-click', (data) => {
        data = JSON.parse(data);
        var room = data.room;
        socket.broadcast.to(room).emit('mouse-click', data);
    });

    socket.on('mouse-down', (data) => {
        data = JSON.parse(data);
        var room = data.room;
        socket.broadcast.to(room).emit('mouse-down', data);
    });

    socket.on('mouse-up', (data) => {
        data = JSON.parse(data);
        var room = data.room;
        socket.broadcast.to(room).emit('mouse-up', data);
    });

    socket.on('mouse-dblclick', (data) => {
        data = JSON.parse(data);
        var room = data.room;
        socket.broadcast.to(room).emit('mouse-dblclick', data);
    });

    socket.on('mouse-right-click', (data) => {
        data = JSON.parse(data);
        var room = data.room;
        socket.broadcast.to(room).emit('mouse-right-click', data);
    });

    socket.on('mouse-wheel', (data) => {
        data = JSON.parse(data);
        var room = data.room;
        socket.broadcast.to(room).emit('mouse-wheel', data);
    });

    // Handle keyboard events
    socket.on('type', (data) => {
        data = JSON.parse(data);
        var room = data.room;
        socket.broadcast.to(room).emit('type', data);
    });

    socket.on('key-down', (data) => {
        data = JSON.parse(data);
        var room = data.room;
        socket.broadcast.to(room).emit('key-down', data);
    });

    socket.on('key-up', (data) => {
        data = JSON.parse(data);
        var room = data.room;
        socket.broadcast.to(room).emit('key-up', data);
    });

    socket.on('key-press', (data) => {
        data = JSON.parse(data);
        var room = data.room;
        socket.broadcast.to(room).emit('key-press', data);
    });
});

var server_port = process.env.YOUR_PORT || process.env.PORT || 5000;

http.listen(server_port, () => {
    console.log("Server started on port " + server_port);
});
