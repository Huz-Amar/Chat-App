import React, { Component } from 'react';
import socketIOClient from "socket.io-client";
import MessageArea from '../messageArea/messageArea';
import "./chatApp.css";
import OnlineUsers from './../onlineUsers/onlineUsers';

class ChatApp extends Component {
    componentDidMount() {
        const socket = socketIOClient();
        
        socket.on("chat message", (msg) => {
            console.log("message: " +  msg);
        });
    }
    
    render() {
        return (
            <div className="container">
                <MessageArea/>
                <OnlineUsers/>
            </div>
        );
    }
}

export default ChatApp;
