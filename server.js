const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 📦 SAVE DOSYASI
const SAVE_FILE = "map.json";

// 🧠 pixel load (kalıcı sistem)
let pixels = {};

if (fs.existsSync(SAVE_FILE)) {
  try {
    pixels = JSON.parse(fs.readFileSync(SAVE_FILE));
    console.log("Map yüklendi");
  } catch (e) {
    console.log("Map yüklenemedi, sıfır başlatıldı");
    pixels = {};
  }
}

io.on("connection", (socket) => {
  console.log("Bir oyuncu bağlandı:", socket.id);

  socket.emit("init", pixels);

  socket.on("placePixel", (data) => {
    pixels[`${data.x},${data.y}`] = data.color;

    // 💾 her pixelde kaydet
    fs.writeFileSync(SAVE_FILE, JSON.stringify(pixels));

    io.emit("pixelUpdate", data);
  });

  socket.on("disconnect", () => {
    console.log("Oyuncu çıktı:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("SERVER RUNNING on port " + PORT);
});
