const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// timestamp
function getTimeStamp() {
    return (new Date()).getHours() + ":" + (new Date()).getMinutes();
}

// usernames of all users. structure --> {socketRef, username, color}
let allUsers = [];
let userCount = 0;
function getUserName(socket) {
    const username = "User" + userCount++;
    allUsers.push({socketRef: socket, username: username, color: "FFFFFF"});
    console.table(allUsers);
    return username;
}

// socket operations
io.on("connection", socket => {
    console.log("a user connected");

    // handle giving user a unique username
    socket.emit("own username", getUserName(socket));
    
    // handle giving socket list of all connected users
    socket.emit("other users' names", allUsers.map(user => delete user.socketRef));

    // handle giving all other sockets list of all users
    socket.broadcast.emit("other users' names", allUsers.map(user => delete user.socketRef));

    // handle chat messages from users
    socket.on("chat message", (socketMsg, username) => {
        console.log("message: " +  socketMsg);
        socket.broadcast.emit("chat message", {
            chatMessage: socketMsg, timestamp: getTimeStamp(), username: username
        });
    });

    // handle giving user's own message a timestamp
    socket.on("single timestamp", usersMessage => {
        console.log("Single timestamp reached")
        socket.emit("single timestamp", getTimeStamp(), usersMessage);
    });

    socket.on("disconnect", () => {
        console.log("user has disconnected");
        const indexToRemove = allUsers.findIndex(user => user.socketRef === socket);
        allUsers.splice(indexToRemove, 1);
        socket.broadcast.emit("other users' names", allUsers.map(user => delete user.socketRef));
    });
});



http.listen(5000, () => {
    console.log("listening on *:5000")
});

