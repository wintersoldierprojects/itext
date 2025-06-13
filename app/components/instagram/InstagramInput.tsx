'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InstagramInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'search';
}

const InstagramInput = forwardRef<HTMLInputElement, InstagramInputProps>(
  ({ 
    label,
    error,
    helperText,
    fullWidth = false,
    variant = 'default',
    className = '',
    ...props 
  }, ref) => {
    const baseClasses = [
      'border rounded-md px-3 py-2 text-sm',
      'bg-instagram-gray-50 border-instagram-gray-200',
      'focus:outline-none focus:ring-2 focus:ring-instagram-blue focus:border-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-instagram-gray-400',
      'transition-all duration-200',
    ];

    const variantClasses = {
      default: [
        'text-instagram-black',
      ],
      search: [
        'text-instagram-black',
        'bg-instagram-gray-100',
        'border-transparent',
        'focus:bg-white',
        'pl-10', // Space for search icon
      ],
    };

    const errorClasses = error ? [
      'border-instagram-red',
      'focus:ring-instagram-red',
    ] : [];

    const classes = [
      ...baseClasses,
      ...variantClasses[variant],
      ...errorClasses,
      fullWidth ? 'w-full' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-instagram-black mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {variant === 'search' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                className="h-4 w-4 text-instagram-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
          )}
          <input
            ref={ref}
            className={classes}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-instagram-red">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-instagram-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

InstagramInput.displayName = 'InstagramInput';

export default InstagramInput;