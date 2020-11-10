const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// usernames of all users. structure --> {socketRef, username, color}
const connectedUsers = [];
// structure --> {sessionID, socketRef}
const usersConnectedThroughoutHistory = [];
// list of all msgs, max of 200. structure --> {socketRef, message, timestamp, username, color}
const chatLog = [];
let userCount = 0;
const defaultColor = "FFFFFF";

let sessionID = 0;

// socket operations
io.on("connection", socket => {
    console.log("a user connected. displaying all users throughout history: ", usersConnectedThroughoutHistory);

    // see if socket connection previously was connected
    // usersConnectedThroughoutHistory.find(entry => entry)

    // handle giving user a unique username (upon first connect)
    socket.emit("own username", getUserName(socket), defaultColor);
    
    // handle giving socket list of all connected users (upon first connect)
    socket.emit("other users' names", sendAllUsers());

    // handle giving all other sockets list of all users (upon first connect)
    socket.broadcast.emit("other users' names", sendAllUsers());

    // handle giving users the entire chatLog (upon first connect)
    socket.emit("chat message", sendChatLog());

    // handle giving client their cookie
    socket.emit("cookie", sessionID);

    // handle clien'ts responce to the cookie emit command
    socket.on("increment session count", cookieAdded => {
        if(cookieAdded) {
            sessionID++;
            usersConnectedThroughoutHistory.push({sessionID: sessionID, socketRef: socket.id})
            console.log("new User added")
        }
        console.log("Current list of all users throughout server history: ", usersConnectedThroughoutHistory)
    });

    socket.on("cookie", sessionID => {
        console.log(sessionID)
        const value = usersConnectedThroughoutHistory.find(entry => entry.sessionID === sessionID);
        if (value) {
            console.log("User tha connected joined previously");
            console.log(value)
        }
        else {
            console.log("Brand new user joined")
            usersConnectedThroughoutHistory.push({sessionID: sessionID, socketRef: socket.id});
        }
    });

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
        const indexToRemove = connectedUsers.findIndex(user => user.socketRef === socket);
        connectedUsers.splice(indexToRemove, 1);
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
    connectedUsers.push({socketRef: socket.id, username: username, color: defaultColor});
    console.table(connectedUsers);
    return username;
}

// send allUsers array, but without the socketRef (dont want client to meddle with that)
function sendAllUsers() {
    return connectedUsers.map(user => {
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
    const indexToUpdate = connectedUsers.findIndex(user => user.socketRef === socket.id);
    connectedUsers[indexToUpdate].color = color;
    
    chatLog.map(entry => {
        if (entry.socketRef === socket.id) {
            entry.color = color;
        }
    });
}

function isUniqueUsername(username) {
    if (connectedUsers.find(user => user.username === username))
        return false;
    return true;
}
function updateUsernames(socket, username) {
    const indexToUpdate = connectedUsers.findIndex(user => user.socketRef === socket.id);
    connectedUsers[indexToUpdate].username = username;
    console.table(chatLog);
    chatLog.map(entry => {
        if (entry.socketRef === socket.id) {
            entry.username = username;
        }
    });
    console.table(chatLog);
}

function getTimeStamp() {
    const date = new Date();
    return (date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + "-" +  date.getHours() + ":" + date.getMinutes());
}

function addMessageToChatLog(socket, msg, username, color) {
    if (chatLog.length === 200) chatLog.splice(0, 1);
    chatLog.push({socketRef: socket.id, message: msg, timestamp: getTimeStamp(), username: username, color: color})
}