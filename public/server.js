const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve public folder
app.use(express.static("public"));

// Store player rooms
let players = {};

// Socket connection
io.on("connection", (socket) => {

    console.log("Player connected:", socket.id);

    // Join room
    socket.on("join-room", (room) => {

        socket.join(room);

        players[socket.id] = room;

        const playerCount =
            io.sockets.adapter.rooms.get(room)?.size || 0;

        io.to(room).emit("player-count", playerCount);

        console.log(`${socket.id} joined ${room}`);
    });

    // Controller movement
    socket.on("controller-move", (direction) => {

        const room = players[socket.id];

        if (room) {

            socket.to(room).emit(
                "controller-update",
                direction
            );

        }
    });

    // Disconnect
    socket.on("disconnect", () => {

        const room = players[socket.id];

        delete players[socket.id];

        if (room) {

            const playerCount =
                io.sockets.adapter.rooms.get(room)?.size || 0;

            io.to(room).emit("player-count", playerCount);

        }

        console.log("Disconnected:", socket.id);

    });

});

// IMPORTANT FOR RENDER
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log("Server running");

});