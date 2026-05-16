const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("join-room", (room) => {
        socket.join(room);

        players[socket.id] = room;

        io.to(room).emit("player-count", io.sockets.adapter.rooms.get(room)?.size || 0);

        console.log(`Player joined room ${room}`);
    });

    socket.on("controller-move", (data) => {
        const room = players[socket.id];

        if (room) {
            socket.to(room).emit("controller-update", data);
        }
    });

    socket.on("disconnect", () => {
        const room = players[socket.id];

        delete players[socket.id];

        if (room) {
            io.to(room).emit("player-count", io.sockets.adapter.rooms.get(room)?.size || 0);
        }

        console.log("Disconnected:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});