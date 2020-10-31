const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// timestamp
function getTimeStamp() {
    return (new Date()).getHours() + ":" + (new Date()).getMinutes();
}

// socket operations
io.on("connection", socket => {
    console.log("a user connected");
    
    socket.on("chat message", socketMsg => {
        console.log("message: " +  socketMsg);
        socket.broadcast.emit("chat message", {
            chatMessage: socketMsg, timestamp: getTimeStamp()
        });
    });

    socket.on("single timestamp", usersMessage => {
        console.log("Single timestamp reached")
        socket.emit("single timestamp", getTimeStamp(), usersMessage);
    });

    socket.on("disconnect", () => {
        console.log("user has disconnected");
    });
});

http.listen(5000, () => {
    console.log("listening on *:5000")
});

