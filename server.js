const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// ✅ Setup allowed origins for both local dev and deployed frontend
const allowedOrigins = [
  "http://localhost:3000",
  "https://social-blog-app-cjxl.vercel.app",
];

// ✅ CORS middleware for Express
app.use(cors({
  origin: allowedOrigins,
  credentials: true, // needed for cookies or headers if used
}));

app.use(express.json());

// ✅ Socket.IO setup
const { authSocket, socketServer } = require("./socketServer");
const io = require("socket.io")(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.use(authSocket);
io.on("connection", (socket) => socketServer(socket));

// ✅ MongoDB connection
mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("MongoDB connected");
  }
);

// ✅ Health check route for debug
app.get("/api/health", (req, res) => {
  res.send("✅ Backend is live and working!");
});

// ✅ API routes
const posts = require("./routes/posts");
const users = require("./routes/users");
const comments = require("./routes/comments");
const messages = require("./routes/messages");

app.use("/api/posts", posts);
app.use("/api/users", users);
app.use("/api/comments", comments);
app.use("/api/messages", messages);

// ✅ Serve static files if in production (Vercel or Render frontend)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

// ✅ Start server (Render requires dynamic port from process.env.PORT)
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
