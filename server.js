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

  socket.on("joinRoom", (roomId, playerSymbol) => {
    const clients = io.sockets.adapter.rooms.get(roomId);
    // const playerSymbol = !clients || clients.size === 0 ? "X" : "O";
    socket.join(roomId);
    //show an new player joined the room to other players in the room
    socket.to(roomId).emit("playerJoined", "A new player has joined the room.");
    // //send an message to the new player about the current players in the room
    // socket.to(roomId).emit("receiveMessage", message);
    socket
      .to(roomId)
      .emit(
        "receiveMessage",
        "Player " + playerSymbol + " has joined the room."
      );

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
