const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// 🔐 OWNER KEY (SADECE SEN)
const OWNER_KEY = "super-gizli-anahtar";

// direkt index.html ver
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

let pixels = {};

io.on("connection", (socket) => {
  console.log("Bir oyuncu bağlandı:", socket.id);

  socket.emit("init", pixels);

  socket.on("placePixel", (data) => {
    pixels[`${data.x},${data.y}`] = data.color;
    io.emit("pixelUpdate", data);
  });

  socket.on("disconnect", () => {
    console.log("Oyuncu çıktı:", socket.id);
  });
});


// 🖼️ OWNER PASTE (SADECE SEN KULLANIRSIN)
let images = [];

app.post("/paste-image", (req, res) => {
  const key = req.headers.authorization;

  // ❌ owner değilse engelle
  if (key !== OWNER_KEY) {
    return res.status(403).send("Yetkisiz");
  }

  const { image, x, y } = req.body;

  images.push({ image, x, y });

  // herkes görsün diye socket ile yayınlıyoruz
  io.emit("imagePasted", { image, x, y });

  res.send("OK");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("SERVER RUNNING on port " + PORT);
});
