const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { getMessage, saveMessage } = require("./db");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// when user connects
io.on("connection", (socket) => {
  // when new client joins emit the existing content from db
  getMessage().then((msg) => {
    io.to(socket.id).emit("message", msg);
  });

  console.log(`user ${socket.id} joined`);

  // listen for changes in content from client
  socket.on("message", (msg) => {
    saveMessage(msg);
    // console.log(`${socket.id} says ${msg}`);

    // broadcast changes to all other clients
    socket.broadcast.emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log(`user ${socket.id} left`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`listening on port ${PORT}`));
