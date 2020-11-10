const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const cookieParser = require("socket.io-cookie-parser");
const cookie = require("cookie");
io.use(cookieParser());

// usernames of all currently connected users. structure --> {socketRef, username, color}
let currentUsers = [];
// used to keep track of all users who joined while server was active --> {socketRef, username, color}
const allUsersThroughoutHistory = [];
// list of all msgs, max of 200. structure --> {socketRef, message, timestamp, username, color}
const chatLog = [];
let userCount = 0;
const defaultColor = "FFFFFF";

// socket operations
io.on("connection", socket => {
    // // handle giving client its socketID (for cookie purposes)
    socket.emit("cookie", socket.id);
    console.log("All users upon socket connect: ", allUsersThroughoutHistory)
    console.log("Current users upon socket connect: ", currentUsers)
    // // see if client is reconnecting by checking cookies for socketRef
    // const socketCookies = socket.request.cookies;
    // console.log("Cookies of connected socket are: ", socketCookies)
    // console.log("Current socket's id: ", socket.id)
    // console.log("Current socket's io: ", socketCookies["io"]);
    // // handleNewUser(cookies.socketID);

    // send client socket's id
    // socket.emit("cookie", socket.id)
    
    // handle giving user a unique username (upon first connect)
    socket.emit("own username", getUserName(socket), defaultColor);
    
    // handle giving socket list of all connected users (upon first connect)
    socket.emit("other users' names", sendCurrentUsers());

    // handle giving all other sockets list of all users (upon first connect)
    socket.broadcast.emit("other users' names", sendCurrentUsers());

    // handle giving users the entire chatLog (upon first connect)
    socket.emit("chat message", sendChatLog());

    // console.log("All users throughout history")
    // console.log(allUsersThroughoutHistory)

    socket.on("cookie", cookie => {
        console.log("User sent cookie with socket.id: ", cookie)
        console.log("All users before cookies", allUsersThroughoutHistory)
        console.log("Current users before cookies", currentUsers)
        const foundValue = allUsersThroughoutHistory.find(entry => entry.socketRef === cookie)
        console.log("Found value --> ", foundValue)
    });

    // handle chat messages from users
    socket.on("chat message", (socketMsg, username, color) => {
        console.log("message: " +  socketMsg);
        console.log("Message by: ", socket.id)
        addMessageToChatLog(socket, socketMsg, username, color);
        socket.broadcast.emit("chat message", sendChatLog());
        socket.emit("chat message", sendChatLog());
    });

    // handle user changing their color
    socket.on("change color", color => {
        if (isValidHexColor(color)){
            changeColor(socket, color);
            socket.emit("change own color", color, sendChatLog());
            socket.broadcast.emit("change color", sendChatLog(), sendCurrentUsers());
        }
    });

    // handle user changing their username
    socket.on("change username", username => {
        if (isUniqueUsername(username)) {
            updateUsernames(socket, username);
            socket.emit("change own username", username, sendChatLog());
            socket.broadcast.emit("change usernames", sendChatLog(), sendCurrentUsers());
        }
    });

    socket.on("disconnect", () => {
        console.log("---------------------------------")
        console.log("All users upon disconnect", allUsersThroughoutHistory)
        console.log('Current users', currentUsers)
        const indexToRemove = currentUsers.findIndex(user => user.socketRef === socket);
        currentUsers.splice(indexToRemove, 1);
        socket.broadcast.emit("other users' names", sendCurrentUsers());
    });
});


http.listen(5000, () => {
    console.log("listening on *:5000")
});

//-----------------------------------
// Helper Functions

function getUserName(socket) {
    console.log("getUserName")
    const username = "User" + userCount++;
    allUsersThroughoutHistory.push({socketRef: socket.id, username: username, color: defaultColor});
    currentUsers = allUsersThroughoutHistory;
    return username;
}

// send allUsers array, but without the socketRef (dont want client to meddle with that)
function sendCurrentUsers() {
    console.log("sendCurrentUsers")
    return currentUsers.map(user => {
        return {username: user.username, color: user.color}
    })
}

// send chatLog array, but without the socketRef (dont want client to meddle with that)
function sendChatLog() {
    console.log(sendChatLog)
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
    const indexToUpdate = allUsersThroughoutHistory.findIndex(user => user.socketRef === socket.id);
    allUsersThroughoutHistory[indexToUpdate].color = color;
    currentUsers = allUsersThroughoutHistory;
    
    chatLog.map(entry => {
        if (entry.socketRef === socket.id) {
            entry.color = color;
        }
    });
}

function isUniqueUsername(username) {
    if (currentUsers.find(user => user.username === username))
        return false;
    return true;
}
function updateUsernames(socket, username) {
    console.log("updateUsernames")
    const indexToUpdate = allUsersThroughoutHistory.findIndex(user => user.socketRef === socket.id);
    allUsersThroughoutHistory[indexToUpdate].username = username;
    currentUsers = allUsersThroughoutHistory;

    chatLog.map(entry => {
        if (entry.socketRef === socket.id) {
            entry.username = username;
        }
    });
}

function getTimeStamp() {
    const date = new Date();
    return (date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + "-" +  date.getHours() + ":" + date.getMinutes());
}

function addMessageToChatLog(socket, msg, username, color) {
    if (chatLog.length === 200) chatLog.splice(0, 1);
    chatLog.push({socketRef: socket.id, message: msg, timestamp: getTimeStamp(), username: username, color: color})
}

function handleNewUser(socketRef) {
    console.log("Handling new user --> ", socketRef)
    if (allUsersThroughoutHistory.find(user => user.socketRef === socketRef)){
        console.log("User was previously connected. Adding user back to list of current users")
        currentUsers.push(allUsersThroughoutHistory.find(user => user.socketRef === socketRef));
        console.log(currentUsers)
    }
}