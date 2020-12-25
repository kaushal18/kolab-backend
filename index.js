const http = require("http");
const express = require("express");
const cors = require("cors");
const migrate = require("./routes/migrate");
const socketio = require("socket.io");
const { getMessage, saveMessage } = require("./db/dbOperations");

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/api/migrate", migrate);

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
  getMessage(room).then((response) => {
    if (response instanceof Error) return console.log(response);
    io.to(socket.id).emit("message", response);
  });

  console.log(`user ${socket.id} joined, token ${room}`);

  // listen for changes in content from client
  socket.on("message", (msg) => {
    // broadcast changes to all other clients
    socket.broadcast.to(room).emit("message", msg);
    saveMessage(room, msg).then((response) => {
      if (response instanceof Error) return console.log(response);
    });
  });

  socket.on("disconnect", () => {
    console.log(`user ${socket.id} left`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`listening on port ${PORT}`));
