import React from 'react';

const NavEditIcon = ({color, size = 33, className = ''}) => {
  return (
    <div className={className}>
      <svg width={size} height={size} viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_7_37475)">
          <path
              d="M18.8698 21.042L28.9999 8.82753L25.0823 5.57837L14.9521 17.7923L18.8698 21.042ZM25.1536 6.3448L28.2335 8.89884L18.7985 20.275L15.7186 17.7204L25.1536 6.3448Z"
              fill={color ? color : '#231F20'}/>
          <path
              d="M13.9106 23.0343L18.494 21.515L14.5557 18.249L13.9106 23.0343ZM14.9639 19.2946L17.3906 21.3076L14.5666 22.2433L14.9639 19.2946Z"
              fill={color ? color : '#231F20'}/>
          <path
              d="M19.1587 24.3331H6.08913V11.5536H19.7036V8.46448H3V27.4216H22.2479V21.7132H19.1587V24.3331ZM19.7036 22.2575H21.7035V26.8779H3.54434V9.00882H19.1587V11.0093H5.54533V24.8774H19.7036V22.2575Z"
              fill={color ? color : '#231F20'}/>
        </g>
        <defs>
          <clipPath id="clip0_7_37475">
            <rect width="25.9998" height="21.8433" fill="white" transform="translate(3 5.57837)"/>
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}

export {NavEditIcon}
