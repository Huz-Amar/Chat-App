import React, { Component } from 'react';
import socketIOClient from "socket.io-client";
import MessageArea from '../messageArea/messageArea';
import "./chatApp.css";
import OnlineUsers from './../onlineUsers/onlineUsers';

class ChatApp extends Component {
    constructor() {
        super();
        this.state = {
            // structure --> {chatMessage, timestamp, username}
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
        
        this.socket.on("chat message", socketMsg => {
            console.log("Message recieved: ", socketMsg)
            const messageArray = this.state.messages;
            messageArray.push(socketMsg);
            this.setState({messages: messageArray});
        });

        this.socket.on("single timestamp", (timeStamp, usersMessage) => {
            console.log("Single timestamp recieved");
            const messageArray = this.state.messages;
            messageArray.push({chatMessage: usersMessage, timestamp: timeStamp, username: this.state.username});
            console.log(messageArray)
            this.setState({messages: messageArray});
        });
    }

    componentWillUnmount() {
        this.socket.close();
    }

    // filters incoming user data to exclude own user entry
    filterAllUsers(allUsers) {
        return allUsers.filter(user => user.username !== this.state.username);
    }

    // responsible for sending messages to server
    handleSendingMessages(message) {
        console.log("Action Recognized --> ", message)
        if (message) {
            this.socket.emit("single timestamp", message, this.state.username);
            this.socket.emit("chat message", message, this.state.username);
        }
    }
    
    render() {
        return (
            <div className="container">
                <MessageArea username={this.state.username} messages={this.state.messages} onMessage={(msg) => this.handleSendingMessages(msg)}/>
                <OnlineUsers username={this.state.username} color={this.state.color} otherUsers={this.state.otherUsers}/>
            </div>
        );
    }
}

export default ChatApp;
