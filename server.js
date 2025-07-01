const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// ✅ Allowed frontend origins (local + vercel)
const allowedOrigins = [
  "https://chatlog-nine.vercel.app" // Vercel frontend
];

// ✅ Enable CORS for Express
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// ✅ Setup Socket.IO with proper CORS
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
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log("✅ MongoDB connection confirmed by Mongoose");
})
.catch((err) => {
  console.error("❌ Mongoose connection failed:", err.message);
});


// ✅ Health check route
app.get("/api/health", (req, res) => {
  res.send("✅ Backend is running!");
});

// ✅ API Routes
const posts = require("./routes/posts");
const users = require("./routes/users");
const comments = require("./routes/comments");
const messages = require("./routes/messages");

app.use("/api/posts", posts);
app.use("/api/users", users);
app.use("/api/comments", comments);
app.use("/api/messages", messages);

// ✅ Serve static files in production (Render)
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "/client/build")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "client/build", "index.html"));
//   });
// }

// ✅ Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
