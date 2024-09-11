import React from 'react';

const NavCheckIcon = ({color, size = 33, className = ''}) => {
  return (
    <div className={className}>
      <svg width={size} height={size} viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_7_37483)">
          <path
              d="M25.4088 6.13196L12.8552 18.6861L6.59124 12.4216L2.5 16.5128L12.8552 26.868L29.5 10.2238L25.4088 6.13196ZM3.34564 16.5128L6.59124 13.2672L12.8552 19.5318L25.4088 6.9776L28.655 10.2238L12.8552 26.0224L3.34564 16.5128Z"
              fill={color ? color : '#231F20'}/>
          <path
              d="M25.4092 7.82382L12.8557 20.3774L6.59112 14.1129L4.19116 16.5128L12.8557 25.1767L27.8086 10.2238L25.4092 7.82382ZM5.0368 16.5128L6.59112 14.9585L12.8557 21.2231L25.4087 8.66946L26.963 10.2238L12.8557 24.3311L5.0368 16.5128Z"
              fill={color ? color : '#231F20'}/>
        </g>
        <defs>
          <clipPath id="clip0_7_37483">
            <rect width="27" height="20.7361" fill="white" transform="translate(2.5 6.13196)"/>
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}

export {NavCheckIcon}
