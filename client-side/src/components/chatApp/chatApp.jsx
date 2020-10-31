import React, { Component } from 'react';
import socketIOClient from "socket.io-client";
import MessageArea from '../messageArea/messageArea';
import "./chatApp.css";
import OnlineUsers from './../onlineUsers/onlineUsers';

class ChatApp extends Component {
    constructor() {
        super();
        this.state = {
            messages: [],
        }
    }

    componentDidMount() {
        this.socket = socketIOClient();
        
        this.socket.on("chat message", (msg) => {
            console.log("Message recieved: ", msg)
            const messageArray = this.state.messages;
            messageArray.push(msg);
            this.setState({messages: messageArray});
        });
    }

    componentWillUnmount() {
        this.socket.close();
    }

    // responsible for sending messages to server
    handleSendingMessages(message) {
        console.log("Action Recognized --> ", message)
        if (message) 
            this.socket.emit("chat message", message);
    }
    
    render() {
        return (
            <div className="container">
                <MessageArea messages={this.state.messages} onMessage={(msg) => this.handleSendingMessages(msg)}/>
                <OnlineUsers/>
            </div>
        );
    }
}

export default ChatApp;
