const roomService = require("../services/roomService");

function handleRoom(socket, io) {
  socket.on("joinRoom", (roomId, desiredSymbol) => {
    const assignedSymbol = roomService.assignSymbol(
      roomId,
      socket.id,
      desiredSymbol
    );

    socket.join(roomId);

    // Get current player count
    const room = io.sockets.adapter.rooms.get(roomId);
    const playerCount = room ? room.size : 1;

    // Notify other players
    socket
      .to(roomId)
      .emit("receiveMessage", `Player ${assignedSymbol} has joined the room.`);
    socket
      .to(roomId)
      .emit("playerJoined", {
        message: `A new player has joined the room.`,
        count: playerCount,
      });

    // Notify new player
    socket.emit("assignSymbol", assignedSymbol);
    socket.emit("playerJoined", {
      message: `You joined the room.`,
      count: playerCount,
    });

    console.log(`${socket.id} joined room ${roomId} as ${assignedSymbol}`);
  });

  socket.on("updateBoard", ({ roomId, board, isXNext }) => {
    socket.to(roomId).emit("boardUpdated", { board, isXNext });
  });

  socket.on("restartGame", (roomId, nextStarter) => {
    socket.to(roomId).emit("gameRestarted", { nextStarter });
    socket.emit("gameRestarted", { nextStarter });
  });

  socket.on("sendMessage", ({ roomId, message }) => {
    socket.to(roomId).emit("receiveMessage", message);
  });

  socket.on("leaveRoom", (roomId) => {
    const symbol = roomService.getPlayerSymbol(roomId, socket.id);
    roomService.removePlayer(roomId, socket.id);
    socket.leave(roomId);

    // Get updated player count
    const room = io.sockets.adapter.rooms.get(roomId);
    const playerCount = room ? room.size : 0;

    if (symbol) {
      socket
        .to(roomId)
        .emit("receiveMessage", `Player ${symbol} has left the room.`);
      socket
        .to(roomId)
        .emit("playerLeft", {
          message: `Player ${symbol} has left the room.`,
          count: playerCount,
        });
    }

    console.log(`${socket.id} left room ${roomId}`);
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue; // Skip personal socket room
      const symbol = roomService.getPlayerSymbol(roomId, socket.id);
      roomService.removePlayer(roomId, socket.id);

      // Get updated player count
      const room = io.sockets.adapter.rooms.get(roomId);
      const playerCount = room ? room.size : 0;

      if (symbol) {
        socket
          .to(roomId)
          .emit("receiveMessage", `Player ${symbol} has disconnected.`);
        socket
          .to(roomId)
          .emit("playerLeft", {
            message: `Player ${symbol} has disconnected.`,
            count: playerCount,
          });
      }
    }
    console.log("Client disconnected:", socket.id);
  });
}

module.exports = { handleRoom };
