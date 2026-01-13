import React from 'react';
import './NumberKeyboard.css';

interface NumberKeyboardProps {
  onNumberClick: (num: number) => void;
  onDelete: () => void;
  disabled: boolean;
}

const NumberKeyboard: React.FC<NumberKeyboardProps> = ({
  onNumberClick,
  onDelete,
  disabled
}) => {
  return (
    <div className="number-keyboard">
      <div className="keyboard-row">
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            className="keyboard-btn"
            onClick={() => onNumberClick(num)}
            disabled={disabled}
            aria-label={`Number ${num}`}
          >
            {num}
          </button>
        ))}
      </div>
      <div className="keyboard-row">
        {[6, 7, 8, 9].map(num => (
          <button
            key={num}
            className="keyboard-btn"
            onClick={() => onNumberClick(num)}
            disabled={disabled}
            aria-label={`Number ${num}`}
          >
            {num}
          </button>
        ))}
        <button
          className="keyboard-btn keyboard-delete"
          onClick={onDelete}
          disabled={disabled}
          aria-label="Delete"
        >
          ⌫
        </button>
      </div>
    </div>
  );
};

export default NumberKeyboard;
