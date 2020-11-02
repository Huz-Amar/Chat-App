const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// usernames of all users. structure --> {socketRef, username, color}
const allUsers = [];
// list of all msgs, max of 200. structure --> {socketRef, message, timestamp, username, color}
const chatLog = [];
let userCount = 0;
const defaultColor = "FFFFFF";


// socket operations
io.on("connection", socket => {
    console.log("a user connected");

    // handle giving user a unique username (upon first connect)
    socket.emit("own username", getUserName(socket), defaultColor);
    
    // handle giving socket list of all connected users (upon first connect)
    socket.emit("other users' names", sendAllUsers());

    // handle giving all other sockets list of all users (upon first connect)
    socket.broadcast.emit("other users' names", sendAllUsers());

    // handle giving users the entire chatLog
    socket.emit("chat message", sendChatLog());

    // handle chat messages from users
    socket.on("chat message", (socketMsg, username, color) => {
        console.log("message: " +  socketMsg);
        addMessageToChatLog(socket, socketMsg, username, color);
        socket.broadcast.emit("chat message", sendChatLog());
        socket.emit("chat message", sendChatLog());
    });

    // handle user changing their color
    socket.on("change color", color => {
        if (isValidHexColor(color)){
            changeColor(socket, color);
            socket.emit("change own color", color, sendChatLog());
            socket.broadcast.emit("change color", sendChatLog(), sendAllUsers());
        }
    });

    // handle user changing their username
    socket.on("change username", username => {
        if (isUniqueUsername(username)) {
            updateUsernames(socket, username);
            socket.emit("change own username", username, sendChatLog());
            socket.broadcast.emit("change usernames", sendChatLog(), sendAllUsers());
        }
    });

    socket.on("disconnect", () => {
        console.log("user has disconnected");
        const indexToRemove = allUsers.findIndex(user => user.socketRef === socket);
        allUsers.splice(indexToRemove, 1);
        socket.broadcast.emit("other users' names", sendAllUsers());
    });
});


http.listen(5000, () => {
    console.log("listening on *:5000")
});

//-----------------------------------
// Helper Functions

function getUserName(socket) {
    const username = "User" + userCount++;
    allUsers.push({socketRef: socket, username: username, color: defaultColor});
    console.table(allUsers);
    return username;
}

// send allUsers array, but without the socketRef (dont want client to meddle with that)
function sendAllUsers() {
    return allUsers.map(user => {
        return {username: user.username, color: user.color}
    })
}

// send chatLog array, but without the socketRef (dont want client to meddle with that)
function sendChatLog() {
    return chatLog.map(entry => {
        return {message: entry.message, timestamp: entry.timestamp, username: entry.username, color: entry.color}
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
    
    chatLog.map(entry => {
        if (entry.socketRef === socket) {
            entry.color = color;
        }
    });
}

function isUniqueUsername(username) {
    if (allUsers.find(user => user.username === username))
        return false;
    return true;
}
function updateUsernames(socket, username) {
    const indexToUpdate = allUsers.findIndex(user => user.socketRef === socket);
    allUsers[indexToUpdate].username = username;
    console.table(chatLog);
    chatLog.map(entry => {
        if (entry.socketRef === socket) {
            entry.username = username;
        }
    });
    console.table(chatLog);
}

function getTimeStamp() {
    const date = new Date();
    return (date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear() + "-" +  date.getHours() + ":" + date.getMinutes());
}

function addMessageToChatLog(socket, msg, username, color) {
    if (chatLog.length === 200) chatLog.splice(0, 1);
    chatLog.push({socketRef: socket, message: msg, timestamp: getTimeStamp(), username: username, color: color})
}