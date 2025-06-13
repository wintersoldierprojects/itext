'use client';

import { SVGAttributes } from 'react';

interface InstagramIconProps extends SVGAttributes<SVGElement> {
  name: 'heart' | 'comment' | 'send' | 'bookmark' | 'more' | 'search' | 'home' | 'camera' | 'back' | 'check' | 'double-check' | 'profile';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  filled?: boolean;
}

const InstagramIcon: React.FC<InstagramIconProps> = ({ 
  name, 
  size = 'md', 
  filled = false, 
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const iconClasses = [
    sizeClasses[size],
    'inline-block',
    className,
  ].filter(Boolean).join(' ');

  const getIcon = () => {
    switch (name) {
      case 'heart':
        return filled ? (
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
        ) : (
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" strokeWidth="2" />
        );
      
      case 'comment':
        return (
          <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        );
      
      case 'send':
        return (
          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        );
      
      case 'bookmark':
        return filled ? (
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" fill="currentColor" />
        ) : (
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" fill="none" stroke="currentColor" strokeWidth="2" />
        );
      
      case 'more':
        return (
          <>
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <circle cx="19" cy="12" r="1" fill="currentColor" />
            <circle cx="5" cy="12" r="1" fill="currentColor" />
          </>
        );
      
      case 'search':
        return (
          <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      
      case 'home':
        return filled ? (
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="currentColor" />
        ) : (
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        );
      
      case 'camera':
        return (
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11z" fill="none" stroke="currentColor" strokeWidth="2" />
        );
      
      case 'back':
        return (
          <path d="M19 12H5M12 19l-7-7 7-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      
      case 'check':
        return (
          <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      
      case 'double-check':
        return (
          <>
            <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 6L5 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        );
      
      case 'profile':
        return (
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        );
      
      default:
        return null;
    }
  };

  return (
    <svg
      className={iconClasses}
      viewBox="0 0 24 24"
      {...props}
    >
      {getIcon()}
    </svg>
  );
};

export default InstagramIcon;