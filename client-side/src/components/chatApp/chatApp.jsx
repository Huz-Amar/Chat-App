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
            otherUsers: []
        }
    }

    componentDidMount() {
        this.socket = socketIOClient();

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
                <MessageArea messages={this.state.messages} onMessage={(msg) => this.handleSendingMessages(msg)}/>
                <OnlineUsers username={this.state.username} color={this.state.color} otherUsers={this.state.otherUsers}/>
            </div>
        );
    }
}

export default ChatApp;
