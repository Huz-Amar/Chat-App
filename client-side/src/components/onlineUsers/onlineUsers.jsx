import React, { Component } from 'react'
import "./onlineUsers.css";

class OnlineUsers extends Component {
    applyColor() {
        const style =  {
            color: "#" + this.props.color
        }
        return style;
    }

    render() { 
        return (  
            <div className="online-users">
                <h3>Online Users</h3>
                <br></br>
                <h4 style={this.applyColor()}>{"\u2606"} {this.props.username}</h4>
                {this.props.otherUsers.map(otherUser => <h4 key={otherUser.username} style={{color: otherUser.color}}>{otherUser.username}</h4>)}
            </div>
        );
    }
}
 
export default OnlineUsers;