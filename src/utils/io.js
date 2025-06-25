import { Server } from "socket.io";

export default function io(server, origin = "*") {
  return new Server(server, {
    cors: {
      origin: origin,
      credentials: true, // Add this
    },
  });
}
