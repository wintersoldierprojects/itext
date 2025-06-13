-- ===============================================
-- DISABLE RLS FOR DEVELOPMENT
-- ===============================================
-- This makes development easier by removing security restrictions
-- You can re-enable RLS later for production

-- 1. Disable RLS on all tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies (optional, since RLS is disabled)
DROP POLICY IF EXISTS "Allow authenticated users to read users" ON public.users;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read for conversation participants" ON public.conversations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.conversations;
DROP POLICY IF EXISTS "Enable update for conversation participants" ON public.conversations;
DROP POLICY IF EXISTS "Enable read for conversation participants" ON public.messages;
DROP POLICY IF EXISTS "Enable insert for conversation participants" ON public.messages;
DROP POLICY IF EXISTS "Enable update for conversation participants" ON public.messages;
DROP POLICY IF EXISTS "Enable all for conversation participants" ON public.typing_indicators;

-- 3. Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'conversations', 'messages', 'typing_indicators');

-- 4. Test query should now work
SELECT id, email, role, full_name FROM public.users WHERE email = 'admin@cherrygifts.com';

SELECT 'RLS disabled for development - all queries should work now!' as status;