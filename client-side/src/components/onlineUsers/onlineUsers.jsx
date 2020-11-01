import React, { Component } from 'react'
import "./onlineUsers.css";

class OnlineUsers extends Component {
    render() { 
        console.log(this.props.otherUsers)
        return (  
            <div className="online-users">
                <h3>Online Users</h3>
                <br></br>
                <h4>{"\u2606"} {this.props.username}</h4>
                {this.props.otherUsers.map(otherUser => <h4 key={otherUser}>{otherUser}</h4>)}
            </div>
        );
    }
}
 
export default OnlineUsers;