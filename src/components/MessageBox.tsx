import React from 'react';
import './MessageBox.css';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

interface MessageBoxProps {
  message: string;
  type: MessageType;
}

const MessageBox: React.FC<MessageBoxProps> = ({ message, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '';
    }
  };

  return (
    <div className={`message-box ${type}`} data-testid="message-box">
      <div className="message-box-content">
        <span className="message-box-icon">{getIcon()}</span>
        <span data-testid="message-text">{message}</span>
      </div>
    </div>
  );
};

export default MessageBox;
