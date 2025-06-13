'use client';

import React from 'react';
import { Skeleton, AvatarSkeleton, TextSkeleton } from './Skeleton';
import { MessageListSkeleton } from './MessageSkeleton';

interface ConversationSkeletonProps {
  className?: string;
}

export function ConversationSkeleton({ className = '' }: ConversationSkeletonProps) {
  return (
    <div className={`flex items-center gap-3 bg-white px-4 py-3 min-h-[72px] ${className}`}>
      {/* Avatar with online indicator */}
      <div className="relative">
        <AvatarSkeleton size="lg" />
        {/* Online indicator skeleton */}
        <div className="absolute -bottom-1 -right-1">
          <Skeleton className="w-4 h-4 rounded-full border-2 border-white" />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          {/* Username */}
          <Skeleton className="h-4 w-24" />
          {/* Time */}
          <Skeleton className="h-3 w-8" />
        </div>
        
        {/* Last message */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-32" />
          {/* Unread count */}
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Multiple conversation skeletons
interface ConversationListSkeletonProps {
  count?: number;
  className?: string;
}

export function ConversationListSkeleton({ count = 8, className = '' }: ConversationListSkeletonProps) {
  return (
    <div className={`divide-y divide-gray-200 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <ConversationSkeleton key={index} />
      ))}
    </div>
  );
}

// Search bar skeleton
export function SearchBarSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 ${className}`}>
      <Skeleton className="h-10 w-full rounded-full" />
    </div>
  );
}

// Chat header skeleton
export function ChatHeaderSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 p-4 border-b border-gray-200 bg-white ${className}`}>
      {/* Back button */}
      <Skeleton className="w-6 h-6 rounded" />
      
      {/* Avatar */}
      <AvatarSkeleton size="md" />
      
      {/* User info */}
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    </div>
  );
}

// Dashboard skeleton (combines multiple components)
export function DashboardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`h-screen flex ${className}`}>
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <Skeleton className="h-8 w-48 mb-4" />
          <SearchBarSkeleton />
        </div>
        
        {/* Conversation list */}
        <ConversationListSkeleton />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <ChatHeaderSkeleton />
        
        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <MessageListSkeleton count={6} />
        </div>
        
        {/* Message input */}
        <div className="p-4 border-t border-gray-200">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
