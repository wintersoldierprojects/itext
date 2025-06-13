-- ===============================================
-- RE-ENABLE RLS FOR PRODUCTION
-- ===============================================
-- Run this when you're ready to deploy to production

-- 1. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- 2. Create production-ready policies
-- Users table policies
CREATE POLICY "Allow authenticated users to read users" ON public.users
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Conversations table policies  
CREATE POLICY "Enable read for conversation participants" ON public.conversations
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() = admin_id OR
        auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
    );

CREATE POLICY "Enable insert for authenticated users" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for conversation participants" ON public.conversations
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() = admin_id OR
        auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
    );

-- Messages table policies
CREATE POLICY "Enable read for conversation participants" ON public.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE user_id = auth.uid() OR admin_id = auth.uid()
        ) OR
        auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
    );

CREATE POLICY "Enable insert for conversation participants" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE user_id = auth.uid() OR admin_id = auth.uid()
        )
    );

CREATE POLICY "Enable update for conversation participants" ON public.messages
    FOR UPDATE USING (
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE user_id = auth.uid() OR admin_id = auth.uid()
        )
    );

-- Typing indicators table policies
CREATE POLICY "Enable all for conversation participants" ON public.typing_indicators
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE user_id = auth.uid() OR admin_id = auth.uid()
        )
    );

SELECT 'RLS re-enabled for production with secure policies!' as status;