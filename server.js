const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ===========================
   ALLOWED ORIGINS
=========================== */
const allowedOrigins = [
  "http://localhost:3000",
  "https://flowlinemessanger.netlify.app",
];

/* ===========================
   EXPRESS MIDDLEWARE
=========================== */
app.use(express.json());

/* ===========================
   EXPRESS CORS (FIXED)
=========================== */
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, health checks, curl, etc.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ===========================
   SOCKET.IO (FIXED)
=========================== */
const { authSocket, socketServer } = require("./socketServer");

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ["websocket", "polling"], // IMPORTANT for Render
});

io.use(authSocket);
io.on("connection", socketServer);

/* ===========================
   MONGODB (CRITICAL FIX)
=========================== */
mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

/* ===========================
   ROUTES
=========================== */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/api/posts", require("./routes/posts"));
app.use("/api/users", require("./routes/users"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/messages", require("./routes/messages"));

/* ===========================
   START SERVER
=========================== */
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
