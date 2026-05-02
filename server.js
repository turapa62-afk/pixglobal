const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ===== WORLD CONFIG =====
const WORLD = 800;

// pixel storage
let pixels = {};

// 🧠 (opsiyonel) pastel başlangıç world
function generateSoftWorld() {
  for (let x = 0; x < WORLD; x++) {
    for (let y = 0; y < WORLD; y++) {
      // çok hafif pastel random dünya
      const r = 200 + Math.floor(Math.random() * 55);
      const g = 200 + Math.floor(Math.random() * 55);
      const b = 200 + Math.floor(Math.random() * 55);

      pixels[`${x},${y}`] = `rgb(${r},${g},${b})`;
    }
  }
}

// ilk dünya
generateSoftWorld();

io.on("connection", (socket) => {
  console.log("🟢 Oyuncu bağlandı:", socket.id);

  // init world
  socket.emit("init", pixels);

  socket.on("placePixel", (data) => {
    const key = `${data.x},${data.y}`;

    pixels[key] = data.color;

    // herkese yay
    io.emit("pixelUpdate", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Oyuncu çıktı:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("🚀 SERVER RUNNING:", PORT);
});
