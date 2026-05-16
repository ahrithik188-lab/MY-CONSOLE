const socket = io();

const room = "HRI123";

socket.emit("join-room", room);

const box = document.getElementById("box");

let x = 220;
let y = 120;

socket.on("player-count", (count) => {
    document.getElementById("players").innerText = "Players: " + count;
});

socket.on("controller-update", (direction) => {

    if(direction === "left") x -= 20;
    if(direction === "right") x += 20;
    if(direction === "up") y -= 20;
    if(direction === "down") y += 20;

    box.style.left = x + "px";
    box.style.top = y + "px";
});