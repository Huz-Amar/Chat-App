import React, { Component } from 'react'
import "./messageArea.css";
import $ from "jquery";

class MessageArea extends Component {
    getUserMessage() {
        const userMsg = $("#user_msg").val();
        $("#user_msg").val("");
        return userMsg;
    }

    render() { 
        let countForMsg = 0;
        let countForUsername = 0;

        return (  
            <div className="message-area"> 
                <div className="message-area-group-list"> 
                    <ul id="list-group">
                        {this.props.messages.map(message => 
                            <li key={countForMsg} className="list-group-item" >
                                {message.timestamp} <span key={countForUsername++} style={{color: "#" + message.color}}>{message.username}</span> {message.message}</li>)
                        }
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