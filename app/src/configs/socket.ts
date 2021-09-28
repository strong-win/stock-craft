import socketIO from "socket.io-client";

const io = socketIO("http://localhost:8080");

export default io;
