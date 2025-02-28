import React from 'react'

const CheckIcon = ({ color, size = 24, className = '' }) => {
  return (
    <div className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={size}
        viewBox={`0 0 24 24`}
        width={size}
        className={color ? color : '#fff'}
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
      </svg>
    </div>
  )
}

export { CheckIcon }
