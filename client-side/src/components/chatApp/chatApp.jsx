import React, { Component } from 'react';
import socketIOClient from "socket.io-client";
import MessageArea from '../messageArea/messageArea';
import "./chatApp.css";
import OnlineUsers from './../onlineUsers/onlineUsers';

class ChatApp extends Component {
    constructor() {
        super();
        this.state = {
            // structure --> {message, timestamp, username, color}
            messages: [],
            username: "",
            color: "",
            // structure --> {username, color}
            otherUsers: [],
            // list of all emojis the ChatApp can understand
            emojiList: [
                { emoji: ":)", decimalCode: 128512}, { emoji: ":(", decimalCode: 128577}, {emoji: ":o", decimalCode: 128558}, {emoji: ":O", decimalCode: 128558}
            ]
        }
    }

    componentDidMount() {
        this.socket = socketIOClient();

        // this.socket.emit("cookie", document.cookie);

        this.socket.emit("give cookie to server", this.getSessionIDCookie());

        this.socket.on("set cookie on client", sessionIDToSet => {
            document.cookie = `sessionID=${sessionIDToSet};max-age=31536000;path=/`
        });

        // this.socket.on("cookie", sessionID => {
        //     let cookieAdded;
        //     if (document.cookie.split(";")[0].indexOf("sessionID=") !== -1) {
        //         console.log("Client already has socketID cookie")
        //         cookieAdded = false;
        //     }
        //     else {
        //         console.log("Making new sessionID cookie")
        //         document.cookie = `sessionID=${sessionID};expires=${new Date(2021, 0, 1).toUTCString()}`
        //         cookieAdded = true;
        //     }
        //     this.socket.emit("increment session count", cookieAdded);
        // });

        this.socket.on("own username", (username, defaultColor) => {
            this.setState({username: username, color: defaultColor});
        });

        this.socket.on("other users' names", allUsers => {
            const otherUsers = this.filterAllUsers(allUsers);
            this.setState({otherUsers: otherUsers});
        });
        
        this.socket.on("chat message", chatLog => {
            console.log("Message recieved: ", chatLog)
            this.setState({messages: chatLog});
        });

        this.socket.on("change own color", (color, chatLog) => {
            this.setState({messages: chatLog, color: color});
        });

        this.socket.on("change color", (chatLog, allUsers) => {
            const otherUsers = this.filterAllUsers(allUsers);
            this.setState({messages: chatLog, otherUsers: otherUsers});
        });

        this.socket.on("change own username", (username, chatLog) => {
            console.table(this.state.messages);
            this.setState({messages: chatLog, username: username});
            console.table(this.state.messages);
        });

        this.socket.on("change usernames", (chatLog, allUsers) => {
            const otherUsers = this.filterAllUsers(allUsers);
            this.setState({messages: chatLog, otherUsers: otherUsers});
        });
    }

    componentWillUnmount() {
        // manually close it just in case
        this.socket.close();
    }

    // handles sending sessionID cookie to server (if the client has it)
    getSessionIDCookie(){
        const cookies = document.cookie.split(";");
        const sessionIDIndex = cookies.findIndex(cookie => cookie.includes("sessionID="))
        console.log(sessionIDIndex)
        if (sessionIDIndex !== -1) {
            const sessionID = parseInt(cookies[sessionIDIndex].split("=")[1]);
            if (isNaN(sessionID))
                return null 
            return sessionID
        }
        else {
            return null;
        }
    }

    // filters incoming user data to exclude own
    filterAllUsers(allUsers) {
        return allUsers.filter(user => user.username !== this.state.username);
    }

    // responsible for sending messages to server
    handleSendingMessages(message) {
        console.log("Action Recognized --> ", message)
        if (message) {
            if (this.isColorCommand(message)) {
                this.socket.emit("change color", message.split(" ")[1])
            }
            else if (this.isUsernameChangeCommand(message)) {
                this.socket.emit("change username", message.slice(7, message.length-1));
            }
            else {
                console.log("Message from client --> ", message)
                this.socket.emit("chat message", message, this.state.username, this.state.color);
            }
        }
    }

    isColorCommand(message) {
        const commandString = message.split(" ");
        if (commandString.length === 2 && commandString[0].slice(0, 6) === "/color")
            return true;
        return false; 
    }

    isUsernameChangeCommand(message) {
        if (message.slice(0, 5) === "/name" && message.slice(6, 7) === "<" && message.slice(message.length-1) === ">")
            return true;
        return false;
    }
    
    render() {
        return (
            <div className="container">
                <MessageArea username={this.state.username} messages={this.state.messages} onMessage={(msg) => this.handleSendingMessages(msg)} emojiList={this.state.emojiList}/>
                <OnlineUsers username={this.state.username} color={this.state.color} otherUsers={this.state.otherUsers}/>
            </div>
        );
    }
}

export default ChatApp;
