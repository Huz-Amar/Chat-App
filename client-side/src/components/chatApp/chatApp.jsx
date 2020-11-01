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
            otherUsers: []
        }
    }

    componentDidMount() {
        this.socket = socketIOClient();

        this.socket.on("usernames", (username) => {
            this.setState({username: username});
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
                <OnlineUsers username={this.state.username} otherUsers={this.state.otherUsers}/>
            </div>
        );
    }
}

export default ChatApp;
