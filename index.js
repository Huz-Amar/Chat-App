const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

//* This socket connection is unique to the client that sent it. If the user reconnected, the same socket will be sent (?)
io.on("connection", (socket) => {
    console.log("a user connected");
    
    // socket.on("chat message", (msg) => {
    //     console.log("message: " +  msg);
    //     socket.broadcast.emit("chat message", msg);
    // });

    socket.emit("chat message", "connected");

    socket.on("disconnect", () => {
        console.log("user has disconnected");
    });
});

http.listen(5000, () => {
    console.log("listening on *:5000")
});