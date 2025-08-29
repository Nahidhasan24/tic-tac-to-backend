const roomService = require("../services/roomService");

function handleRoom(socket, io) {
  socket.on("joinRoom", (roomId, desiredSymbol) => {
    const assignedSymbol = roomService.assignSymbol(
      roomId,
      socket.id,
      desiredSymbol
    );

    socket.join(roomId);

    // Notify other players
    socket
      .to(roomId)
      .emit("receiveMessage", `Player ${assignedSymbol} has joined the room.`);
    socket.to(roomId).emit("playerJoined", "A new player has joined the room.");

    // Notify new player
    socket.emit("assignSymbol", assignedSymbol);

    console.log(`${socket.id} joined room ${roomId} as ${assignedSymbol}`);
  });

  socket.on("updateBoard", ({ roomId, board, isXNext }) => {
    socket.to(roomId).emit("boardUpdated", { board, isXNext });
  });

  socket.on("restartGame", (roomId) => {
    socket.to(roomId).emit("gameRestarted");
  });

  socket.on("sendMessage", ({ roomId, message }) => {
    socket.to(roomId).emit("receiveMessage", message);
  });

  socket.on("leaveRoom", (roomId) => {
    const symbol = roomService.getPlayerSymbol(roomId, socket.id);
    roomService.removePlayer(roomId, socket.id);
    socket.leave(roomId);
    if (symbol) {
      socket
        .to(roomId)
        .emit("receiveMessage", `Player ${symbol} has left the room.`);
    }
    console.log(`${socket.id} left room ${roomId}`);
  });

  socket.on("disconnect", () => {
    // Remove player from all rooms
    for (const roomId in roomService) {
      const symbol = roomService.getPlayerSymbol(roomId, socket.id);
      if (symbol) {
        roomService.removePlayer(roomId, socket.id);
        socket
          .to(roomId)
          .emit("receiveMessage", `Player ${symbol} has disconnected.`);
      }
    }
    console.log("Client disconnected:", socket.id);
  });
}

module.exports = { handleRoom };
