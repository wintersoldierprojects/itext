-- ===============================================
-- Instagram DM-Style Messaging Platform Database Setup
-- ===============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================
-- 1. USERS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    instagram_username VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    profile_picture_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_online BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 2. CONVERSATIONS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_content TEXT,
    unread_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 3. MESSAGES TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'link', 'image')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 4. TYPING INDICATORS TABLE
-- ===============================================
CREATE TABLE IF NOT EXISTS public.typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_typing BOOLEAN DEFAULT false,
    last_typed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 seconds')
);

-- ===============================================
-- INDEXES FOR PERFORMANCE
-- ===============================================
CREATE INDEX IF NOT EXISTS idx_users_instagram_username ON public.users(instagram_username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_online ON public.users(is_online);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_admin_id ON public.conversations(admin_id);
CREATE INDEX IF NOT EXISTS idx_conversations_is_active ON public.conversations(is_active);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON public.messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_admin ON public.messages(is_admin);

CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation_id ON public.typing_indicators(conversation_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_expires_at ON public.typing_indicators(expires_at);

-- ===============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile and admins can read all
CREATE POLICY "Users can read own profile" ON public.users
    FOR SELECT USING (auth.uid() = id OR EXISTS(
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can insert new users
CREATE POLICY "Admins can insert users" ON public.users
    FOR INSERT WITH CHECK (EXISTS(
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Users can read conversations they're part of
CREATE POLICY "Users can read their conversations" ON public.conversations
    FOR SELECT USING (
        user_id = auth.uid() OR 
        admin_id = auth.uid() OR 
        EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update conversations they're part of
CREATE POLICY "Users can update their conversations" ON public.conversations
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        admin_id = auth.uid() OR 
        EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Users can read messages in their conversations
CREATE POLICY "Users can read their messages" ON public.messages
    FOR SELECT USING (
        EXISTS(
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND (user_id = auth.uid() OR admin_id = auth.uid())
        ) OR 
        EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Users can insert messages in their conversations
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS(
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND (user_id = auth.uid() OR admin_id = auth.uid())
        )
    );

-- Users can update message status in their conversations
CREATE POLICY "Users can update message status" ON public.messages
    FOR UPDATE USING (
        EXISTS(
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND (user_id = auth.uid() OR admin_id = auth.uid())
        )
    );

-- Typing indicators policies
CREATE POLICY "Users can manage typing indicators" ON public.typing_indicators
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS(
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND (user_id = auth.uid() OR admin_id = auth.uid())
        )
    );

-- ===============================================
-- REALTIME SUBSCRIPTIONS
-- ===============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- ===============================================
-- HELPER FUNCTIONS
-- ===============================================

-- Function to send a message
CREATE OR REPLACE FUNCTION public.send_message(
    p_conversation_id UUID,
    p_content TEXT,
    p_message_type VARCHAR DEFAULT 'text'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_message_id UUID;
    v_sender_role VARCHAR;
BEGIN
    -- Get sender role
    SELECT role INTO v_sender_role FROM public.users WHERE id = auth.uid();
    
    -- Insert the message
    INSERT INTO public.messages (
        conversation_id,
        sender_id,
        content,
        message_type,
        is_admin,
        sent_at
    ) VALUES (
        p_conversation_id,
        auth.uid(),
        p_content,
        p_message_type,
        v_sender_role = 'admin',
        NOW()
    ) RETURNING id INTO v_message_id;
    
    -- Update conversation
    UPDATE public.conversations 
    SET 
        last_message_at = NOW(),
        last_message_content = p_content,
        unread_count = CASE 
            WHEN v_sender_role = 'admin' THEN unread_count
            ELSE unread_count + 1
        END,
        updated_at = NOW()
    WHERE id = p_conversation_id;
    
    RETURN v_message_id;
END;
$$;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
    p_conversation_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    -- Mark messages as read
    UPDATE public.messages 
    SET read_at = NOW()
    WHERE conversation_id = p_conversation_id 
        AND read_at IS NULL 
        AND sender_id != auth.uid()
    RETURNING COUNT(*) INTO v_updated_count;
    
    -- Reset unread count for the conversation
    UPDATE public.conversations 
    SET unread_count = 0, updated_at = NOW()
    WHERE id = p_conversation_id;
    
    RETURN v_updated_count;
END;
$$;

-- Function to update typing status
CREATE OR REPLACE FUNCTION public.update_typing_status(
    p_conversation_id UUID,
    p_is_typing BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete existing typing indicator
    DELETE FROM public.typing_indicators 
    WHERE conversation_id = p_conversation_id AND user_id = auth.uid();
    
    -- Insert new typing indicator if typing
    IF p_is_typing THEN
        INSERT INTO public.typing_indicators (
            conversation_id,
            user_id,
            is_typing,
            last_typed_at,
            expires_at
        ) VALUES (
            p_conversation_id,
            auth.uid(),
            true,
            NOW(),
            NOW() + INTERVAL '10 seconds'
        );
    END IF;
END;
$$;

-- Function to cleanup expired typing indicators
CREATE OR REPLACE FUNCTION public.cleanup_expired_typing()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.typing_indicators WHERE expires_at < NOW();
END;
$$;

-- ===============================================
-- TRIGGERS
-- ===============================================

-- Trigger to update user updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON public.conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- ===============================================
-- SAMPLE DATA (for development)
-- ===============================================

-- Insert sample admin user (password should be set via Supabase Auth)
INSERT INTO public.users (email, full_name, role, is_online) 
VALUES ('admin@cherrygifts.com', 'Admin User', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Note: Users will be created via the registration flow
-- Conversations and messages will be created through the app