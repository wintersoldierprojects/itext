'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export function Skeleton({ 
  className = '', 
  width, 
  height, 
  rounded = false,
  animate = true 
}: SkeletonProps) {
  const baseClasses = `bg-gray-200 ${animate ? 'animate-pulse' : ''}`;
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`${baseClasses} ${roundedClasses} ${className}`}
      style={style}
    />
  );
}

// Shimmer effect skeleton
export function ShimmerSkeleton({ 
  className = '', 
  width, 
  height, 
  rounded = false 
}: SkeletonProps) {
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`relative overflow-hidden bg-gray-200 ${roundedClasses} ${className}`}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

// Text skeleton with multiple lines
interface TextSkeletonProps {
  lines?: number;
  className?: string;
  lineHeight?: string;
  lastLineWidth?: string;
}

export function TextSkeleton({ 
  lines = 3, 
  className = '',
  lineHeight = 'h-4',
  lastLineWidth = '75%'
}: TextSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`${lineHeight} ${index === lines - 1 ? '' : 'w-full'}`}
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

// Avatar skeleton
interface AvatarSkeletonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarSkeleton({ size = 'md', className = '' }: AvatarSkeletonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  return (
    <Skeleton
      className={`${sizeClasses[size]} ${className}`}
      rounded
    />
  );
}

// Button skeleton
interface ButtonSkeletonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

export function ButtonSkeleton({ 
  size = 'md', 
  className = '',
  fullWidth = false 
}: ButtonSkeletonProps) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  return (
    <Skeleton
      className={`${fullWidth ? 'w-full' : sizeClasses[size]} ${className}`}
      height={sizeClasses[size].split(' ')[0]}
    />
  );
}

// Card skeleton
interface CardSkeletonProps {
  className?: string;
  showAvatar?: boolean;
  showImage?: boolean;
  textLines?: number;
}

export function CardSkeleton({ 
  className = '',
  showAvatar = true,
  showImage = false,
  textLines = 3
}: CardSkeletonProps) {
  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      {/* Header with avatar */}
      {showAvatar && (
        <div className="flex items-center space-x-3 mb-4">
          <AvatarSkeleton size="md" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      )}

      {/* Image */}
      {showImage && (
        <Skeleton className="w-full h-48 mb-4" />
      )}

      {/* Text content */}
      <TextSkeleton lines={textLines} />

      {/* Action buttons */}
      <div className="flex space-x-2 mt-4">
        <ButtonSkeleton size="sm" />
        <ButtonSkeleton size="sm" />
      </div>
    </div>
  );
}
