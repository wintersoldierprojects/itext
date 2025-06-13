'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface InstagramButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const InstagramButton = forwardRef<HTMLButtonElement, InstagramButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false, 
    loading = false,
    className = '',
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-semibold rounded-lg',
      'transition-all duration-200 ease-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-95',
    ];

    const variantClasses = {
      primary: [
        'bg-instagram-blue text-white',
        'hover:bg-instagram-blue-hover',
        'focus:ring-instagram-blue',
        'disabled:bg-instagram-blue-light',
      ],
      secondary: [
        'bg-instagram-gray-100 text-instagram-black',
        'hover:bg-instagram-gray-200',
        'focus:ring-instagram-gray-400',
        'border border-instagram-gray-200',
      ],
      text: [
        'bg-transparent text-instagram-blue',
        'hover:bg-instagram-gray-50',
        'focus:ring-instagram-blue',
      ],
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const classes = [
      ...baseClasses,
      ...variantClasses[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

InstagramButton.displayName = 'InstagramButton';

export default InstagramButton;