import Socket from "socket.io";

let io;

export function setIo(server) {
  io = Socket(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });
  return io;
}

export function getIo(server) {
  if (!io) {
    throw new Error("not init io");
  }
  return io;
}
