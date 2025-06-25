import io from "./src/utils/io.js";

export default function socketServer(server, origin = "*") {
  let socketIo = io(server, origin);

  let activeUsers = [];

  socketIo.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    //recieve active user data from client
    socket.on("activeUser", (user) => {
      // Check if the user is already in the activeUsers array
      const existingUser = activeUsers.find((u) => u.userId === user.id);
      if (!existingUser) {
        activeUsers.push({
          userId: user.id,
          socketId: socket.id,
          name: user.name,
          email: user.email,
        });
      }

      socketIo.emit("activeUsers", activeUsers);

      console.log("Active users updated:", activeUsers);
    });

    // Handle incoming messages
    socket.on("message", (msg) => {
      // console.log("Message received from client:", msg.receiverId);

      // console.log("Active users:", activeUsers);

      const receiver = activeUsers.find(
        (user) => user.userId === msg.receiverId
      );
      if (receiver) {
        socketIo.to(receiver.socketId).emit("message", msg);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      // Remove the user from activeUsers on disconnect
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      console.log("User disconnected:", socket.id);
    });
  });
}
