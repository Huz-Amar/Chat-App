const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// timestamp
function getTimeStamp() {
    return (new Date()).getHours() + ":" + (new Date()).getMinutes();
}

// usernames. structure --> {socketRef, username}
let allUsers = [];
let userCount = 0;
function getUserName(socket) {
    const username = "User" + userCount++;
    allUsers.push({socketRef: socket, username: username});
    return username;
}

// socket operations
io.on("connection", socket => {
    console.log("a user connected");

    // handle giving user a unique username, and all other users
    socket.emit("usernames", getUserName(socket), allUsers.filter(user => user.socketRef !== socket));

    // handle chat messages from users
    socket.on("chat message", socketMsg => {
        console.log("message: " +  socketMsg);
        socket.broadcast.emit("chat message", {
            chatMessage: socketMsg, timestamp: getTimeStamp()
        });
    });

    // handle giving user's own message a timestamp
    socket.on("single timestamp", usersMessage => {
        console.log("Single timestamp reached")
        socket.emit("single timestamp", getTimeStamp(), usersMessage);
    });

    socket.on("disconnect", () => {
        console.log("user has disconnected");
        const indexToDelete = allUsers.findIndex(user => user.socketRef === socket);
        allUsers.splice(indexToDelete, 1);
        console.table(allUsers);
    });
});

http.listen(5000, () => {
    console.log("listening on *:5000")
});

