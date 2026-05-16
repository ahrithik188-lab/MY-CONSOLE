const express = require("express");
const app = express();

const http = require("http").createServer(app);

const io = require("socket.io")(http, {
    cors: {
        origin: "*"
    }
});

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let room = {
    code: Math.floor(100000 + Math.random() * 900000),
    players: [],
    menuIndex: 0
};

const games = [
    "🏎️ Racing",
    "🃏 UNO",
    "🐍 Snake"
];

io.on("connection", (socket) => {

    console.log("NEW CONNECTION:", socket.id);

    // SEND ROOM DATA
    socket.emit("roomData", room);

    // PLAYER JOIN
    socket.on("joinRoom", (name) => {

        const playerExists =
            room.players.find(
                p => p.id === socket.id
            );

        if(!playerExists){

            room.players.push({
                id: socket.id,
                name
            });
        }

        console.log(room.players);

        io.emit("updatePlayers", room.players);
    });

    // START TEST
    socket.on("startSetup", () => {

        io.emit("changeState", {
            state: "testing"
        });
    });

    // BUTTON TEST
    socket.on("buttonPress", (button) => {

        io.emit("buttonDetected", button);
    });

    // MENU MOVEMENT
    socket.on("menuMove", (dir) => {

        if(dir === "right"){

            room.menuIndex++;

            if(room.menuIndex >= games.length)
                room.menuIndex = 0;
        }

        if(dir === "left"){

            room.menuIndex--;

            if(room.menuIndex < 0)
                room.menuIndex = games.length - 1;
        }

        io.emit("updateMenu", {
            index: room.menuIndex,
            games
        });
    });

    // DISCONNECT
    socket.on("disconnect", () => {

        console.log("Disconnected");

        room.players =
            room.players.filter(
                p => p.id !== socket.id
            );

        io.emit("updatePlayers", room.players);
    });

});

http.listen(PORT, "0.0.0.0", () => {

    console.log("RUNNING ON PORT " + PORT);
});
