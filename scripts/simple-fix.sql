-- ===============================================
-- SIMPLE FIX: Just fix policies and create admin user
-- ===============================================

-- 1. Drop problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- 2. Create simple, working policies
CREATE POLICY "Allow authenticated users to read users" ON public.users
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- 3. Create admin user in public.users table
INSERT INTO public.users (
    id,
    email,
    role,
    full_name,
    is_online,
    created_at,
    updated_at
) VALUES (
    '6aeb3460-f4d2-4601-aca4-c4b9aec51581',
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

-- 4. Verify admin user exists
SELECT id, email, role, full_name FROM public.users WHERE email = 'admin@cherrygifts.com';