const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// usernames of all users. structure --> {socketRef, username, color}
const allUsers = [];
let userCount = 0;
const defaultColor = "FF0000";
function getUserName(socket) {
    const username = "User" + userCount++;
    allUsers.push({socketRef: socket, username: username, color: defaultColor});
    console.table(allUsers);
    return username;
}

// socket operations
io.on("connection", socket => {
    console.log("a user connected");

    // handle giving user a unique username (upon first connect)
    socket.emit("own username", getUserName(socket), defaultColor);
    
    // handle giving socket list of all connected users (upon first connect)
    socket.emit("other users' names", removeSocketRefBeforeSend());

    // handle giving all other sockets list of all users (upon first connect)
    socket.broadcast.emit("other users' names", removeSocketRefBeforeSend());

    // handle chat messages from users
    socket.on("chat message", (socketMsg, username, color) => {
        console.log("message: " +  socketMsg);
        socket.broadcast.emit("chat message", {
            chatMessage: socketMsg, timestamp: getTimeStamp(), username: username, color: color
        });
        socket.emit("chat message", {
            chatMessage: socketMsg, timestamp: getTimeStamp(), username: username, color: color
        });
    });

    // handle user changing his color
    socket.on("change color", color => {
        if (isValidHexColor(color)){
            changeColor(socket, color);
            socket.emit("change own color", color)
            socket.broadcast.emit("change color", removeSocketRefBeforeSend());
        }
    });

    socket.on("disconnect", () => {
        console.log("user has disconnected");
        const indexToRemove = allUsers.findIndex(user => user.socketRef === socket);
        allUsers.splice(indexToRemove, 1);
        socket.broadcast.emit("other users' names", removeSocketRefBeforeSend());
    });
});


http.listen(5000, () => {
    console.log("listening on *:5000")
});

//-----------------------------------
// Helper Functions

function removeSocketRefBeforeSend() {
    return allUsers.map(user => {
        return {username: user.username, color: user.color}
    })
}

function isValidHexColor(color) {
    if (/^#[0-9A-F]{6}$/i.test("#" + color)) 
        return true;
    return false;
}
function changeColor(socket, color) {
    const indexToUpdate = allUsers.findIndex(user => user.socketRef === socket);
    allUsers[indexToUpdate].color = color;
}

function getTimeStamp() {
    return (new Date()).getHours() + ":" + (new Date()).getMinutes();
}