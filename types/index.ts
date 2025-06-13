import type { Database } from './database'

export type User = Database['public']['Tables']['users']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type TypingIndicator = Database['public']['Tables']['typing_indicators']['Row']

export type UserInsert = Database['public']['Tables']['users']['Insert']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']

export type MessageStatus = 'sent' | 'delivered' | 'read'
export type UserRole = 'user' | 'admin'
export type MessageType = 'text' | 'link' | 'image'

export interface MessageWithStatus extends Message {
  status: MessageStatus
  sender: User
}

export interface ConversationWithUser extends Conversation {
  user: User | null
  admin: User | null
  last_message?: Message | null
  unread_messages?: Message[]
}

export interface ConversationListItem {
  id: string
  user: User
  admin: User | null
  last_message_content: string | null
  last_message_at: string | null
  unread_count: number
  is_active: boolean
}

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  instagram_username?: string
  full_name?: string
  profile_picture_url?: string
  is_online: boolean
  last_seen: string
}

export interface SendMessageRequest {
  conversationId: string
  content: string
  messageType?: MessageType
}

export interface SendMessageResponse {
  success: boolean
  messageId?: string
  error?: string
  queued?: boolean
}

export interface TypingStatus {
  conversationId: string
  userId: string
  isTyping: boolean
  username?: string
}

// Re-export metrics types
export * from './metrics'

// Real-time subscription payloads
export interface RealtimeMessagePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Message | null
  old: Message | null
}

export interface RealtimeConversationPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Conversation | null
  old: Conversation | null
}

export interface RealtimeTypingPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: TypingIndicator | null
  old: TypingIndicator | null
}

// Instagram integration types
export interface InstagramProfile {
  username: string
  profilePictureUrl?: string
  fullName?: string
  isVerified?: boolean
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: AppError
  success: boolean
}

// Hook return types
export interface UseMessagesReturn {
  messages: MessageWithStatus[]
  loading: boolean
  error: AppError | null
  sendMessage: (content: string, type?: MessageType) => Promise<SendMessageResponse>
  markAsRead: () => Promise<void>
  loadMore: () => Promise<void>
  hasMore: boolean
}

export interface UseConversationsReturn {
  conversations: ConversationListItem[]
  loading: boolean
  error: AppError | null
  createConversation: (userId: string) => Promise<string>
  refreshConversations: () => Promise<void>
}
