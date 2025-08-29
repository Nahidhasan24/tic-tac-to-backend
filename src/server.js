// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { handleRoom } = require("./controllers/roomController");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  handleRoom(socket, io);
});

const PORT = 4000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
