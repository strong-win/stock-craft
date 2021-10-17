import io from "socket.io-client";
import dotenv from "dotenv";
dotenv.config();

const SERVER_URI = process.env.REACT_APP_SERVER_URI;

const connectSocket = () => {
  const socket = io(SERVER_URI);
  return new Promise((resolve) => {
    resolve(socket);
  });
};

export default connectSocket;
