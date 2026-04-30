const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let pixels = {};

io.on("connection", (socket) => {

  socket.emit("init", pixels);

  socket.on("placePixel", (data) => {
    pixels[`${data.x},${data.y}`] = data.color;

    io.emit("pixelUpdate", data);
  });

});

server.listen(3000, () => {
  console.log("SERVER RUNNING http://localhost:3000");
});