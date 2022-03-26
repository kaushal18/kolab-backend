const http = require("http");
const express = require("express");
const cors = require("cors");
const migrate = require("./routes/migrate");
const passwordCheck = require("./routes/passwordCheck");
const socketio = require("socket.io");
const { getMessage, saveMessage } = require("./db/dbOperations");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/migrate", migrate);
app.use("/api/auth", passwordCheck);

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    methods: ["GET", "POST"],
  },
});

// middleware to validate token
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (token.trim() === "") {
    console.error(`token:${token} - in:socket - invalid token`);
    return next(new Error("invalid token"));
  } else return next();
});

// when user connects
io.on("connection", (socket) => {
  const room = socket.handshake.query.token;
  socket.join(room);

  console.log(`token:${room} - in:socket - joined`);
  // when new client joins emit the existing content from db
  
  // TODO - do not send entire response over network
  getDataForToken(room).then((response) => {
    if(response instanceof Error)
      io.to(socket.id).emit("error", response);
    else
      io.to(socket.id).emit("message", response);
  });

  // listen for changes in content from client
  socket.on("message", (msg) => {
    console.log(`token:${room} - in:socket - received: ${msg}`);
    // broadcast changes to all other clients
    socket.broadcast.to(room).emit("message", msg);
    saveOrUpdate(room, msg);
  });

  socket.on("disconnect", () => {
    console.log(`token:${room} - in:scoket - left`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`PasteBin Backend server started and listening on port - ${PORT}`));
