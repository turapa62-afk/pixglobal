const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// WORLD
let pixels = {};

// 👇 oyuncu pixel sayacı
const userPixels = {};
const MAX_PIXELS = 50;

io.on("connection", (socket) => {
  console.log("Bağlandı:", socket.id);

  userPixels[socket.id] = 0;

  // world gönder
  socket.emit("init", pixels);

  socket.on("placePixel", (data) => {
    if (!data) return;

    let count = userPixels[socket.id] || 0;

    // 🔥 50 LIMIT (PixUniverse tarzı)
    if (count >= MAX_PIXELS) {
      userPixels[socket.id] = MAX_PIXELS - 1;
      return;
    }

    userPixels[socket.id]++;

    pixels[`${data.x},${data.y}`] = data.color;

    io.emit("pixelUpdate", data);
  });

  socket.on("disconnect", () => {
    delete userPixels[socket.id];
    console.log("Çıktı:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("SERVER RUNNING:", PORT);
});
