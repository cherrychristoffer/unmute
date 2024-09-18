import React from 'react';

const PlayIcon = ({size = 24, className = ''}) => {
  return (
    <div className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
        <path fill="white" d="M8 5.14v14l11-7z"/>
      </svg>
    </div>
  )
}

export {PlayIcon}
