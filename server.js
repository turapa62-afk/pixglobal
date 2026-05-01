const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// public klasörünü servis et
app.use(express.static("public"));

let pixels = {};

io.on("connection", (socket) => {
  console.log("Bir oyuncu bağlandı:", socket.id);

  // İlk girişte tüm pixelleri gönder
  socket.emit("init", pixels);

  // Pixel koyma
  socket.on("placePixel", (data) => {
    pixels[`${data.x},${data.y}`] = data.color;

    // Herkese gönder
    io.emit("pixelUpdate", data);
  });

  socket.on("disconnect", () => {
    console.log("Oyuncu çıktı:", socket.id);
  });
});

// Render uyumlu port
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("SERVER RUNNING on port " + PORT);
});
