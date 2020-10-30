import React, { Component } from 'react'
import "./messageArea.css";

class MessageArea extends Component {
    render() { 
        return (  
            <div className="message-area"> 
                <div className="message-area-group-list"> 
                    <ul id="list-group">
                        <li className="list-group-item">Cras justo odio</li>
                        <li className="list-group-item">Dapibus ac facilisis in</li>
                        <li className="list-group-item">Morbi leo risus</li>
                        <li className="list-group-item">Porta ac consectetur ac</li>
                        <li className="list-group-item">Vestibulum at eros</li>
                        <li className="list-group-item">Cras justo odio</li>
                        <li className="list-group-item">Dapibus ac facilisis in</li>
                        <li className="list-group-item">Morbi leo risus</li>
                    </ul>
                </div>
                <div className="message-area-form">
                    <input id="user_msg"></input>
                    <button className="btn btn-success" id="submit">Send</button>
                </div>
            </div>
        );
    }
}
 
export default MessageArea;