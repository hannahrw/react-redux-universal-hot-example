import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';

@connect(
  state => ({user: state.auth.user})
)
export default class Chat extends Component {

  static propTypes = {
    user: PropTypes.object
  };

  state = {
    message: '',
    messages: []
  };

  componentDidMount() {
    if (socket) {
      socket.on('msg', this.onMessageReceived);
      setTimeout(() => {
        socket.emit('history', {offset: 0, length: 100});
      }, 100);
    }
  }

  componentWillUnmount() {
    if (socket) {
      socket.removeListener('msg', this.onMessageReceived);
    }
  }

  onMessageReceived = (data) => {
    const messages = this.state.messages;
    messages.push(data);
    this.setState({messages});
  }

  handleSubmit = (event) => {
    event.preventDefault();

    const msg = this.state.message;

    this.setState({message: ''});

    socket.emit('msg', {
      from: this.props.user.name,
      text: msg
    });
  }

  formatChat(username, message) {
    let chat;
    if (message.indexOf('/me') === 0) {
      chat = <span className={'emote'}>{message.replace('/me', username)}</span>;
    } else {
      chat = <span><div className={'user'}><i className={'fa fa-smile-o'} />{username}</div><div className={'message'}>{message}</div></span>;
    }
    return chat;
  }

  censor(message) {
    const regex = new RegExp('(potato|real estate agent|rea|carbs)', 'gi');
    return message.replace(regex, function(match) {
      return '#@*!%'.repeat(match.length).substring(0, match.length);
    });
  }

  emote(message) {
    const regex = new RegExp('(/me)');
    return message.replace(regex, this.props);
  }

  render() {
    const style = require('./Chat.scss');
    const classNames = require('classnames');
    const {user} = this.props;

    return (
      <div className={style.chat + ' container'}>
        {user &&
        <div>
          <ul>
          {this.state.messages.map((msg) => {
            const messageClass = classNames({
              'current-user': user.name === msg.from
            });
            return <li key={`chat.msg.${msg.id}`} className={messageClass}>{this.formatChat(msg.from, this.censor(msg.text))}</li>;
          })}
          </ul>
          <form className="login-form" onSubmit={this.handleSubmit}>
            <input type="text" ref="message" placeholder="Enter your message"
             value={this.state.message}
             onChange={(event) => {
               this.setState({message: event.target.value});
             }
            }/>
            <button className="btn" onClick={this.handleSubmit}>Send</button>
          </form>
        </div>
        }
      </div>
    );
  }
}
