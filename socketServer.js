const jwt = require("jsonwebtoken");
let users = [];

const authSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.log("❌ Socket auth failed: No token");
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    socket.decoded = decoded;
    next();
  } catch (err) {
    console.log("❌ Socket auth failed: Invalid token");
    next(new Error("Authentication error"));
  }
};

const socketServer = (socket) => {
  const userId = socket.decoded.userId;
  users.push({ userId, socketId: socket.id });

  socket.on("send-message", (recipientUserId, username, content) => {
    const recipient = users.find((user) => user.userId == recipientUserId);
    if (recipient) {
      socket
        .to(recipient.socketId)
        .emit("receive-message", userId, username, content);
    }
  });

  socket.on("disconnect", () => {
    users = users.filter((user) => user.userId != userId);
  });
};

module.exports = { socketServer, authSocket };
