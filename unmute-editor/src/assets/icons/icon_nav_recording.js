import React from 'react';

const NavRecordingIcon = ({color, size = 33, className = ''}) => {
  return (
    <div className={className}>
      <svg width={size} height={size} viewBox="0 0 38 37" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M30 18C30 23.7989 25.2989 28.5 19.5 28.5C13.7011 28.5 9 23.7989 9 18C9 12.2011 13.7011 7.5 19.5 7.5C25.2989 7.5 30 12.2011 30 18Z"
            fill={color ? color : '#231F20'}/>
      </svg>
    </div>
  )
}

export {NavRecordingIcon}
