const http = require("http");
const express = require("express");
const cors = require("cors");
const migrate = require("./routes/migrate");
const passwordCheck = require("./routes/passwordCheck");
const register = require("./routes/register");
const login = require("./routes/login");
const refreshToken = require("./routes/refreshToken");
const socketio = require("socket.io");
const cookieParser = require("cookie-parser");
const {  saveOrUpdate, getDataForToken } = require("./db/dbOperations");
const { SOCKET_CONNECT, 
        SOCKET_DISCONNECT, 
        SYNC_DOCUMENT, 
        ERROR 
      } = require("./constants.js");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// routes
// migrate from URL1 to URL2
app.use("/api/migrate", migrate);
// check if given URL is password protected
app.use("/api/verify", passwordCheck);
// assign password to the given URL and return access and refresh token
app.use("/api/register", register);
// log in the user using provided password 
app.use("/api/auth", login);
// generate a new access token by providing a valid refresh token
app.use("/api/refresh", refreshToken);

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
    console.error(`token:${token} - invalid token`);
    return next(new Error("invalid token"));
  } else return next();
});

// when user connects
io.on(SOCKET_CONNECT, (socket) => {
  const room = socket.handshake.query.token;
  socket.join(room);

  console.log(`token:${room} - joined`);
  // when new client joins emit the existing content from db
  getDataForToken(room).then((response) => {
    if(response instanceof Error)
      io.to(socket.id).emit(ERROR, response);
    else
      io.to(socket.id).emit(SYNC_DOCUMENT, response);
  });

  // listen for changes in content from client
  socket.on(SYNC_DOCUMENT, (msg) => {
    console.log(`token:${room} - received: ${msg}`);
    // broadcast changes to all other clients
    socket.broadcast.to(room).emit(SYNC_DOCUMENT, msg);
    saveOrUpdate(room, msg);
  });

  socket.on(SOCKET_DISCONNECT, () => {
    console.log(`token:${room} - left`);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Kolab backend server started and listening on port - ${PORT}`));
