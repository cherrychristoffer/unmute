import React from 'react';

const NavPassepartoutIcon = ({color, size = 33, className = ''}) => {
  return (
    <div className={className}>
      <svg width={size} height={size} viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_6_8873)">
          <mask id="mask0_6_8873" maskUnits="userSpaceOnUse" x="2" y="5" width="28"
                height="23">
            <path d="M29.5 5.93491H2.5V27.0651H29.5V5.93491Z" fill="white"/>
          </mask>
          <g mask="url(#mask0_6_8873)">
            <path
                d="M28.6384 27.0651H3.36164C2.88644 27.0651 2.5 26.6807 2.5 26.2085V6.79148C2.5 6.31932 2.88644 5.93491 3.36164 5.93491H28.6384C29.1136 5.93491 29.5 6.31932 29.5 6.79148V26.2085C29.5 26.6807 29.1136 27.0651 28.6384 27.0651ZM3.36164 6.50596C3.20335 6.50596 3.07443 6.63421 3.07443 6.79148V26.2085C3.07443 26.3658 3.20335 26.4941 3.36164 26.4941H28.6384C28.7966 26.4941 28.9256 26.3658 28.9256 26.2085V6.79148C28.9256 6.63421 28.7966 6.50596 28.6384 6.50596H3.36164ZM28.3512 25.923H3.64919V7.07734H28.3512V25.923ZM4.22328 25.352H27.7764V7.64839H4.22328V25.352Z"
                fill={color ? color : '#231F20'}/>
          </g>
          <mask id="mask1_6_8873" maskUnits="userSpaceOnUse" x="2" y="5" width="28"
                height="23">
            <path d="M29.5 5.93491H2.5V27.0651H29.5V5.93491Z" fill="white"/>
          </mask>
          <g mask="url(#mask1_6_8873)">
            <path
                d="M27.2678 24.8015H4.73262V8.19819H27.2678V24.8015ZM27.9428 7.52353H4.05762V25.4768H27.9428V7.52353Z"
                fill={color ? color : '#231F20'}/>
          </g>
        </g>
        <defs>
          <clipPath id="clip0_6_8873">
            <rect width="27" height="21.1302" fill="white" transform="translate(2.5 5.93491)"/>
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}

export {NavPassepartoutIcon}
