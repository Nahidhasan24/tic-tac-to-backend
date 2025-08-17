// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    const clients = io.sockets.adapter.rooms.get(roomId);
    const playerSymbol = !clients || clients.size === 0 ? "X" : "O";
    socket.join(roomId);
    socket.emit("assignSymbol", playerSymbol);
    console.log(`${socket.id} joined room ${roomId} as ${playerSymbol}`);
  });

  socket.on("updateBoard", ({ roomId, board, isXNext }) => {
    socket.to(roomId).emit("boardUpdated", { board, isXNext });
  });

  socket.on("restartGame", (roomId) => {
    socket.to(roomId).emit("gameRestarted");
  });

  // Chat messaging
  socket.on("sendMessage", ({ roomId, message }) => {
    socket.to(roomId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

const PORT = 4000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
