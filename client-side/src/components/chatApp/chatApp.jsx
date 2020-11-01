import React, { Component } from 'react';
import socketIOClient from "socket.io-client";
import MessageArea from '../messageArea/messageArea';
import "./chatApp.css";
import OnlineUsers from './../onlineUsers/onlineUsers';

class ChatApp extends Component {
    constructor() {
        super();
        this.state = {
            // structure --> {chatMessage, timestamp}
            messages: [],
            username: "",
            otherUsers: []
        }
    }

    componentDidMount() {
        this.socket = socketIOClient();

        this.socket.on("usernames", (username, otherUsers) => {
            let otherUsers_Usernames = otherUsers.map(user => user.username);
            console.log(username);
            this.setState({username: username, otherUsers: otherUsers_Usernames});
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
            messageArray.push({chatMessage: usersMessage, timestamp: timeStamp});
            this.setState({messages: messageArray});
        });
    }

    componentWillUnmount() {
        console.log("About to close")
        // this.socket.close();
    }

    // responsible for sending messages to server
    handleSendingMessages(message) {
        console.log("Action Recognized --> ", message)
        if (message) {
            this.socket.emit("single timestamp", message);
            this.socket.emit("chat message", message);
        }
    }
    
    render() {
        return (
            <div className="container">
                <MessageArea messages={this.state.messages} onMessage={(msg) => this.handleSendingMessages(msg)}/>
                <OnlineUsers username={this.state.username} otherUsers={this.state.otherUsers}/>
            </div>
        );
    }
}

export default ChatApp;
