import React, { Component } from 'react'
import "./onlineUsers.css";

class OnlineUsers extends Component {
    render() { 
        return (  
            <div className="online-users">
                <h3>Online Users</h3>
                <br></br>
                <h4 style={{color: "#" + this.props.color}}>{"\u2606"} {this.props.username}</h4>
                {this.props.otherUsers.map(otherUser => <h4 key={otherUser.username} style={{color: "#" + otherUser.color}}>{otherUser.username}</h4>)}
            </div>
        );
    }
}
 
export default OnlineUsers;