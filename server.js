const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// direkt index.html ver
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

let pixels = {};

io.on("connection", (socket) => {
  console.log("Bir oyuncu bağlandı:", socket.id);

  socket.emit("init", pixels);

  // 🟢 PIXEL SİSTEMİ (AYNI)
  socket.on("placePixel", (data) => {
    pixels[`${data.x},${data.y}`] = data.color;
    io.emit("pixelUpdate", data);
  });

  // 🟣 IMAGE SİSTEMİ (YENİ EKLENDİ)
  socket.on("sendImage", (data) => {
    io.emit("showImage", data);
  });

  socket.on("disconnect", () => {
    console.log("Oyuncu çıktı:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("SERVER RUNNING on port " + PORT);
});
