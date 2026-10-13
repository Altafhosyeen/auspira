'use client';
import React from 'react';

interface EditIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string; // width & height
  color?: string; // stroke color
}

const EditIcon: React.FC<EditIconProps> = ({ size = 22, color = 'white', className, ...rest }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      <path
        d="M12.1554 3.3L4.62956 11.2658C4.34539 11.5683 4.07039 12.1642 4.01539 12.5767L3.67623 15.5467C3.55706 16.6192 4.32706 17.3525 5.39039 17.1692L8.34206 16.665C8.75456 16.5917 9.33206 16.2892 9.61623 15.9775L17.1421 8.01166C18.4437 6.63666 19.0304 5.06916 17.0046 3.15333C14.9879 1.25583 13.4571 1.925 12.1554 3.3Z"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.8994 4.62915C11.2936 7.15915 13.3469 9.09332 15.8952 9.34998"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.75 20.1667H19.25"
        stroke={color}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EditIcon;
