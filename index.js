const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// usernames of all users. structure --> {socketRef, username, color}
const connectedUsers = [];
// structure --> {sessionID, socketRef, username, color}
const usersConnectedThroughoutHistory = [];
// list of all msgs, max of 200. structure --> {socketRef, message, timestamp, username, color}
const chatLog = [];
let userCount = 0;
const defaultColor = "FFFFFF";

let sessionID = 1000;

// socket operations
io.on("connection", socket => {
    // the socket's ID that is to be passed to functions for organization purposes
    // it will be properly assigned in the below functions
    let socketID = null;

    socket.on("give cookie to server", clientSessionID => {
        console.log(clientSessionID)
        const value = usersConnectedThroughoutHistory.find(entry => entry.sessionID === clientSessionID);
        if (value) {
            console.log("User that connected previously joined");
            const userOldUsername = value.username;
            const userOldColor = value.color;
            // assign socketID to the client's previous value (will result in them getting all their old info back)
            socketID = value.socketRef;

            addUserBackIn(socketID, userOldUsername, userOldColor)

            socket.emit("own username", userOldUsername, userOldColor);
            socket.emit("other users' names", sendAllUsers());
            socket.broadcast.emit("other users' names", sendAllUsers());
            socket.emit("chat message", sendChatLog());
        }
        else {
            // assign socketID to the client's current socketID value 
            socketID = socket.id;

            console.log("Brand new user joined")
            socket.emit("set cookie on client", sessionID);

            // send new client information
            socket.emit("own username", addNewUser(socketID), defaultColor);
            socket.emit("other users' names", sendAllUsers());
            socket.broadcast.emit("other users' names", sendAllUsers());
            socket.emit("chat message", sendChatLog());
            // console.log("displaying all users throughout history: ", usersConnectedThroughoutHistory);

            // at the end of it all, increment sessionID to get it ready for the next one
            sessionID++;
        }
    });

    // handle chat messages from users
    socket.on("chat message", (socketMsg, username, color) => {
        console.log("message: " +  socketMsg);
        addMessageToChatLog(socketID, socketMsg, username, color);
        socket.broadcast.emit("chat message", sendChatLog());
        socket.emit("chat message", sendChatLog());
    });

    // handle user changing their color
    socket.on("change color", color => {
        if (isValidHexColor(color)){
            changeColor(socketID, color);
            socket.emit("change own color", color, sendChatLog());
            socket.broadcast.emit("change color", sendChatLog(), sendAllUsers());
        }
    });

    // handle user changing their username
    socket.on("change username", username => {
        if (isUniqueUsername(username)) {
            updateUsernames(socketID, username);
            socket.emit("change own username", username, sendChatLog());
            socket.broadcast.emit("change usernames", sendChatLog(), sendAllUsers());
        }
    });

    socket.on("disconnect", () => {
        console.log("--------------------------------------------------------------------------------------")
        console.log("user has disconnected");
        const indexToRemove = connectedUsers.findIndex(user => user.socketRef === socketID);
        connectedUsers.splice(indexToRemove, 1);
        socket.broadcast.emit("other users' names", sendAllUsers());
    });
});


http.listen(5000, () => {
    console.log("listening on *:5000")
});

//-----------------------------------
// Helper Functions

function addNewUser(socketID) {
    const username = "User" + userCount++;
    connectedUsers.push({socketRef: socketID, username: username, color: defaultColor});
    usersConnectedThroughoutHistory.push({sessionID: sessionID, socketRef: socketID, username: username, color: defaultColor});
    // console.table(connectedUsers);
    return username;
}

function addUserBackIn(socketID, userOldName, userOldColor) {
    connectedUsers.push({socketRef: socketID, username: userOldName, color: userOldColor});
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
function changeColor(socketID, color) {
    const indexToUpdate_ConnectedUsers = connectedUsers.findIndex(user => user.socketRef === socketID);
    // console.log("Connected Users ", connectedUsers)
    // console.log("Respective Index ", indexToUpdate_ConnectedUsers)
    // console.log("SocketID ", socketID)
    connectedUsers[indexToUpdate_ConnectedUsers].color = color;
    
    const indexToUpdate_UsersThroughoutHistory = usersConnectedThroughoutHistory.findIndex(user => user.socketRef === socketID)
    usersConnectedThroughoutHistory[indexToUpdate_UsersThroughoutHistory].color = color;

    chatLog.map(entry => {
        if (entry.socketRef === socketID) {
            entry.color = color;
        }
    });
}

function isUniqueUsername(username) {
    if (connectedUsers.find(user => user.username === username))
        return false;
    return true;
}
function updateUsernames(socketID, username) {
    const indexToUpdate = connectedUsers.findIndex(user => user.socketRef === socketID);
    connectedUsers[indexToUpdate].username = username;
    
    const indexToUpdate_UsersThroughoutHistory = usersConnectedThroughoutHistory.findIndex(user => user.socketRef === socketID)
    usersConnectedThroughoutHistory[indexToUpdate_UsersThroughoutHistory].username = username;
    
    chatLog.map(entry => {
        if (entry.socketRef === socketID) {
            entry.username = username;
        }
    });
}

function getTimeStamp() {
    const date = new Date();
    let minutes = date.getMinutes();
    if (minutes < 10) minutes = "0" + minutes.toString()
    return (date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + "-" +  date.getHours() + ":" + minutes);
}

function addMessageToChatLog(socketID, msg, username, color) {
    if (chatLog.length === 200) chatLog.splice(0, 1);
    chatLog.push({socketRef: socketID, message: msg, timestamp: getTimeStamp(), username: username, color: color})
}