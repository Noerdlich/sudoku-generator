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

  // Erkenne Strategienamen und mache sie anklickbar
  const renderMessage = () => {
    const strategyNames = [
      'Naked Single',
      'Hidden Single',
      'Naked Pair',
      'Naked Triple',
      'Pointing Pairs',
      'Box Line Reduction'
    ];

    let renderedMessage: React.ReactNode = message;

    // Suche nach Strategienamen im Format "Tipp (Strategie-Name):"
    const match = message.match(/Tipp \((.*?)\):/);
    if (match && match[1]) {
      const strategyName = match[1];
      if (strategyNames.includes(strategyName)) {
        const strategyId = strategyName.toLowerCase().replace(/\s+/g, '-');
        const parts = message.split(`(${strategyName})`);
        
        const handleClick = () => {
          const event = new CustomEvent('openStrategy', { 
            detail: { strategyId } 
          });
          window.dispatchEvent(event);
        };

        renderedMessage = (
          <>
            {parts[0]}
            <button 
              className="strategy-link"
              onClick={handleClick}
              title="Klicke für mehr Informationen zu dieser Strategie"
            >
              ({strategyName})
            </button>
            {parts[1]}
          </>
        );
      }
    }

    return renderedMessage;
  };

  return (
    <div className={`message-box ${type}`} data-testid="message-box">
      <div className="message-box-content">
        <span className="message-box-icon">{getIcon()}</span>
        <span className="message-text" data-testid="message-text">
          {renderMessage()}
        </span>
      </div>
    </div>
  );
};

export default MessageBox;
