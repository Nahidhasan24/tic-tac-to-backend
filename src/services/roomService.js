const roomSymbols = {}; // { roomId: { socketId: "X"|"O" } }

function assignSymbol(roomId, socketId, desiredSymbol) {
  const clients = roomSymbols[roomId] ? Object.keys(roomSymbols[roomId]) : [];
  const takenSymbols = clients.map((id) => roomSymbols[roomId][id] || null);

  let assignedSymbol = desiredSymbol;
  if (takenSymbols.includes(desiredSymbol)) {
    assignedSymbol = desiredSymbol === "X" ? "O" : "X";
  }

  if (!roomSymbols[roomId]) roomSymbols[roomId] = {};
  roomSymbols[roomId][socketId] = assignedSymbol;

  return assignedSymbol;
}

function removePlayer(roomId, socketId) {
  if (roomSymbols[roomId]) {
    delete roomSymbols[roomId][socketId];
    // If room is empty, clean up
    if (Object.keys(roomSymbols[roomId]).length === 0)
      delete roomSymbols[roomId];
  }
}

function getPlayerSymbol(roomId, socketId) {
  return roomSymbols[roomId]?.[socketId] || null;
}

module.exports = {
  assignSymbol,
  removePlayer,
  getPlayerSymbol,
};
