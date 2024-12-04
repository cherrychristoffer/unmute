import React from 'react';

const MinusIcon = ({ color, size = 24, className = '' }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox={`0 0 24 24`} width={size} className={color ? color : '#fff'}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M19 13H5v-2h14v2z" />
    </svg>
  );
};

export { MinusIcon };
