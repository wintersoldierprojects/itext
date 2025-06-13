-- ===============================================
-- 4. SIMPLIFY RLS POLICIES
-- ===============================================

-- Helper function to get a value from the user's JWT claims
CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT) RETURNS JSONB AS $$
  SELECT COALESCE(current_setting('request.jwt.claims', true)::JSONB ->> claim, NULL)::JSONB
$$ LANGUAGE SQL STABLE;

-- Drop the old policy
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;

-- Create a new, more performant policy
CREATE POLICY "Users can read own profile" ON public.users
    FOR SELECT USING (
        auth.uid() = id OR
        get_my_claim('role') = '"admin"'::jsonb
    );
