const jwt = require("jsonwebtoken");

let users = [];

const authSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;

  // ✅ Allow socket to connect even without token
  if (!token) {
    console.log("⚠️ Socket connected without token:", socket.id);
    socket.decoded = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    socket.decoded = decoded;
    next();
  } catch (err) {
    console.log("❌ Invalid socket token:", socket.id);
    socket.decoded = null;
    next(); // ❗ do NOT reject connection
  }
};

const socketServer = (socket) => {
  // 🔒 If not authenticated, block messaging only
  if (!socket.decoded) {
    console.log("⚠️ Anonymous` socket connected:", socket.id);
    return;
  }

  const userId = socket.decoded.userId;

  // Remove existing socket for same user
  users = users.filter((u) => u.userId !== userId);

  users.push({
    userId,
    socketId: socket.id,
  });

  console.log("✅ User connected:", userId);

  socket.on("send-message", (recipientUserId, username, content) => {
    const recipient = users.find(
      (user) => user.userId === recipientUserId
    );

    if (recipient) {
      socket
        .to(recipient.socketId)
        .emit("receive-message", userId, username, content);
    }
  });

  socket.on("disconnect", () => {
    users = users.filter((u) => u.socketId !== socket.id);
    console.log("❌ User disconnected:", userId);
  });
};

module.exports = { authSocket, socketServer };
