// This file will be auto-generated from Supabase schema
// Run: npx supabase gen types typescript --project-id tlgiqnqdtnowmciilnba > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          instagram_username: string | null
          full_name: string | null
          profile_picture_url: string | null
          role: 'user' | 'admin'
          last_seen: string
          is_online: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          instagram_username?: string | null
          full_name?: string | null
          profile_picture_url?: string | null
          role?: 'user' | 'admin'
          last_seen?: string
          is_online?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          instagram_username?: string | null
          full_name?: string | null
          profile_picture_url?: string | null
          role?: 'user' | 'admin'
          last_seen?: string
          is_online?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string | null
          admin_id: string | null
          last_message_at: string | null
          last_message_content: string | null
          unread_count: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          admin_id?: string | null
          last_message_at?: string | null
          last_message_content?: string | null
          unread_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          admin_id?: string | null
          last_message_at?: string | null
          last_message_content?: string | null
          unread_count?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string | null
          sender_id: string | null
          content: string
          message_type: 'text' | 'link' | 'image'
          sent_at: string
          delivered_at: string | null
          read_at: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          sender_id?: string | null
          content: string
          message_type?: 'text' | 'link' | 'image'
          sent_at?: string
          delivered_at?: string | null
          read_at?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string | null
          sender_id?: string | null
          content?: string
          message_type?: 'text' | 'link' | 'image'
          sent_at?: string
          delivered_at?: string | null
          read_at?: string | null
          is_admin?: boolean
          created_at?: string
        }
      }
      typing_indicators: {
        Row: {
          id: string
          conversation_id: string | null
          user_id: string | null
          is_typing: boolean
          last_typed_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          user_id?: string | null
          is_typing?: boolean
          last_typed_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string | null
          user_id?: string | null
          is_typing?: boolean
          last_typed_at?: string
          expires_at?: string
        }
      }
      message_reactions: {
        Row: {
          id: string
          message_id: string | null
          user_id: string | null
          reaction_type: 'heart' | 'like' | 'laugh' | 'wow' | 'sad' | 'angry'
          created_at: string
        }
        Insert: {
          id?: string
          message_id?: string | null
          user_id?: string | null
          reaction_type: 'heart' | 'like' | 'laugh' | 'wow' | 'sad' | 'angry'
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string | null
          user_id?: string | null
          reaction_type?: 'heart' | 'like' | 'laugh' | 'wow' | 'sad' | 'angry'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      send_message: {
        Args: {
          p_conversation_id: string
          p_content: string
          p_message_type?: string
        }
        Returns: string
      }
      mark_messages_as_read: {
        Args: {
          p_conversation_id: string
        }
        Returns: number
      }
      update_typing_status: {
        Args: {
          p_conversation_id: string
          p_is_typing: boolean
        }
        Returns: void
      }
      cleanup_expired_typing: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
      toggle_reaction: {
        Args: {
          p_message_id: string
          p_reaction_type: string
        }
        Returns: boolean
      }
      get_message_reactions: {
        Args: {
          p_message_id: string
        }
        Returns: {
          reaction_type: string
          count: number
          user_reacted: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}