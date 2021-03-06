import React, { Component } from 'react'
import "./messageArea.css";
import $ from "jquery";

class MessageArea extends Component {
    getUserMessage() {
        const userMsg = $("#user_msg").val();
        $("#user_msg").val("");
        return userMsg;
    }

    makeOwnMessagesBold(username, message) {
        console.log("Make Own messages bold")
        if (username === this.props.username) {
            return <b>{message}</b>;
        }
        else {
            return <React.Fragment>{message}</React.Fragment>;
        }
    }

    injectEmojis(message){
        for (let i = 0; i < this.props.emojiList.length; i++) {
            const emojiEntry = this.props.emojiList[i];
            message = message.replaceAll(emojiEntry.emoji, String.fromCodePoint(emojiEntry.decimalCode));
        }
        return message;
    }

    scrollToBottom(){
        console.log("Scroll to Bottom Hit")
        const messageArea = $(".message-area-group-list");
        messageArea.scrollTop(9999/0.0001);
    }   

    render() { 
        let countForMsg = 0;
        let countForUsername = 0;

        return (  
            <div className="message-area"> 
                <div className="message-area-group-list"> 
                    <ul id="list-group">
                        {this.props.messages.map(message =>  
                            <div key={countForMsg}>
                                <li key={countForMsg++} className="list-group-item">
                                    {message.timestamp} {" "}
                                    <span key={countForUsername++} style={{color: "#" + message.color}}>{message.username}</span> {" "}
                                    {this.makeOwnMessagesBold(message.username, this.injectEmojis(message.message))}
                                </li>   
                            </div>
                        )}
                    </ul>
                </div>
                <div className="message-area-form">
                    <input id="user_msg"></input>
                    <button className="btn btn-success" id="submit" onClick={() => this.props.onMessage(this.getUserMessage())}>Send</button>
                </div>
                {this.scrollToBottom()}
            </div>
        );
    }
}
 
export default MessageArea;