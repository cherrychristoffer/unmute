import React from 'react';

const PauseIcon = ({ size = 24, className = '' }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
      <path fill="white" d="M14 19h4V5h-4M6 19h4V5H6z" />
    </svg>
  );
};

export { PauseIcon };
