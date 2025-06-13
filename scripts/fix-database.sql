-- ===============================================
-- FIX: Remove infinite recursion in RLS policies
-- ===============================================

-- 1. Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can view conversation messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can update message status" ON public.messages;
DROP POLICY IF EXISTS "Participants can manage typing indicators" ON public.typing_indicators;

-- 2. Create fixed policies without recursion
-- Users table policies
CREATE POLICY "Enable read access for authenticated users" ON public.users
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Conversations table policies  
CREATE POLICY "Enable read for conversation participants" ON public.conversations
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() = admin_id OR
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin'
        )
    );

CREATE POLICY "Enable insert for authenticated users" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for conversation participants" ON public.conversations
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() = admin_id OR
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin'
        )
    );

-- Messages table policies
CREATE POLICY "Enable read for conversation participants" ON public.messages
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.conversations WHERE id = conversation_id
            UNION
            SELECT admin_id FROM public.conversations WHERE id = conversation_id
        ) OR
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin'
        )
    );

CREATE POLICY "Enable insert for conversation participants" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND (
            auth.uid() IN (
                SELECT user_id FROM public.conversations WHERE id = conversation_id
                UNION
                SELECT admin_id FROM public.conversations WHERE id = conversation_id
            ) OR
            auth.uid() IN (
                SELECT id FROM public.users WHERE role = 'admin'
            )
        )
    );

CREATE POLICY "Enable update for conversation participants" ON public.messages
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.conversations WHERE id = conversation_id
            UNION
            SELECT admin_id FROM public.conversations WHERE id = conversation_id
        ) OR
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin'
        )
    );

-- Typing indicators table policies
CREATE POLICY "Enable all for conversation participants" ON public.typing_indicators
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.conversations WHERE id = conversation_id
            UNION
            SELECT admin_id FROM public.conversations WHERE id = conversation_id
        ) OR
        auth.uid() IN (
            SELECT id FROM public.users WHERE role = 'admin'
        )
    );

-- 3. Create the admin user in public.users table
INSERT INTO public.users (
    id,
    email,
    role,
    full_name,
    is_online,
    created_at,
    updated_at
) VALUES (
    '6aeb3460-f4d2-4601-aca4-c4b9aec51581',  -- Your actual user ID from auth
    'admin@cherrygifts.com',
    'admin',
    'System Administrator',
    false,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    email = 'admin@cherrygifts.com',
    full_name = 'System Administrator',
    updated_at = NOW();

-- 4. Verify the fix
SELECT 'Database policies fixed and admin user created!' as status;