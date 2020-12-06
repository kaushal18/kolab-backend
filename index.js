const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { getMessage, saveMessage } = require("./db/dbOperations");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// middleware to validate token
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (token === "") return next(new Error("invalid token"));
  else return next();
});

// when user connects
io.on("connection", (socket) => {
  const room = socket.handshake.query.token;
  socket.join(room);

  // when new client joins emit the existing content from db
  getMessage(room).then((msg) => {
    io.to(socket.id).emit("message", msg);
  });

  console.log(`user ${socket.id} joined, token ${room}`);

  // listen for changes in content from client
  socket.on("message", (msg) => {
    saveMessage(room, msg);
    // broadcast changes to all other clients
    socket.broadcast.to(room).emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log(`user ${socket.id} left`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`listening on port ${PORT}`));
