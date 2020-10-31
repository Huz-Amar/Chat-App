import React, { Component } from 'react'
import "./messageArea.css";
import $ from "jquery";

class MessageArea extends Component {
    getUserMessage() {
        const userMessage = $("#user_msg").val();
        $("#user_msg").val("");
        return userMessage;
    }

    render() { 
        return (  
            <div className="message-area"> 
                <div className="message-area-group-list"> 
                    <ul id="list-group">
                        {this.props.messages.map(message => <li key={message.chatMessage} className="list-group-item">{message.timestamp}  {message.chatMessage}</li>)}
                    </ul>
                </div>
                <div className="message-area-form">
                    <input id="user_msg"></input>
                    <button className="btn btn-success" id="submit" onClick={() => this.props.onMessage(this.getUserMessage())}>Send</button>
                </div>
            </div>
        );
    }
}
 
export default MessageArea;