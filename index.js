const http = require("http");
const express = require("express");
const cors = require("cors");
const migrate = require("./routes/migrate");
const passwordCheck = require("./routes/passwordCheck");
const register = require("./routes/register");
const login = require("./routes/login");
const socketio = require("socket.io");
const {  saveOrUpdate, getDataForToken } = require("./db/dbOperations");
const { SOCKET_CONNECT, 
        SOCKET_DISCONNECT, 
        TRANSFER_DOCUMENT, 
        ERROR 
      } = require("./constants.js");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/migrate", migrate);
app.use("/api/verify", passwordCheck);
app.use("/api/register", register);
app.use("/api/auth", login);

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
io.on(SOCKET_CONNECT, (socket) => {
  const room = socket.handshake.query.token;
  socket.join(room);

  console.log(`token:${room} - in:socket - joined`);
  // when new client joins emit the existing content from db
  getDataForToken(room).then((response) => {
    if(response instanceof Error)
      io.to(socket.id).emit(ERROR, response);
    else
      io.to(socket.id).emit(TRANSFER_DOCUMENT, response);
  });

  // listen for changes in content from client
  socket.on(TRANSFER_DOCUMENT, (msg) => {
    console.log(`token:${room} - in:socket - received: ${msg}`);
    // broadcast changes to all other clients
    socket.broadcast.to(room).emit(TRANSFER_DOCUMENT, msg);
    saveOrUpdate(room, msg);
  });

  socket.on(SOCKET_DISCONNECT, () => {
    console.log(`token:${room} - in:scoket - left`);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Kolab backend server started and listening on port - ${PORT}`));
