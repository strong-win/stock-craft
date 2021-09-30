import io from "socket.io-client";

const connectSocket = () => {
  const socket = io("http://localhost:8080/");
  return new Promise((resolve) => {
    resolve(socket);
  });
};

export default connectSocket;
