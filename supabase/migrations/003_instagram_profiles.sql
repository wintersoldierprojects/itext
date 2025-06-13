-- Create instagram_profiles table for permanent storage
CREATE TABLE IF NOT EXISTS public.instagram_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    profile_picture_url TEXT,
    profile_picture_local_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_private BOOLEAN DEFAULT false,
    bio TEXT DEFAULT '',
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_instagram_profiles_username ON public.instagram_profiles(username);
CREATE INDEX IF NOT EXISTS idx_instagram_profiles_user_id ON public.instagram_profiles(user_id);

-- Update users table to add Instagram-related fields
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_picture_local_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_fetched BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS instagram_fetched_at TIMESTAMP WITH TIME ZONE;

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profile-pictures',
    'profile-pictures',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile pictures
CREATE POLICY "Public read access for profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload own profile picture" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own profile picture" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own profile picture" ON storage.objects
FOR DELETE USING (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for instagram_profiles table
ALTER TABLE public.instagram_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all Instagram profiles" ON public.instagram_profiles
FOR SELECT USING (true);

CREATE POLICY "Users can insert own Instagram profile" ON public.instagram_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Instagram profile" ON public.instagram_profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for instagram_profiles
CREATE TRIGGER update_instagram_profiles_updated_at 
    BEFORE UPDATE ON public.instagram_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create admin user for support conversations
INSERT INTO public.users (
    id,
    email,
    instagram_username,
    full_name,
    role,
    is_active,
    profile_picture_url,
    created_at,
    updated_at
) VALUES (
    'support-admin',
    'support@cherrygifts.com',
    'cherrygifts_support',
    'CherryGifts Support',
    'admin',
    true,
    'https://api.dicebear.com/7.x/initials/svg?seed=CherryGifts&backgroundColor=E91E63&textColor=ffffff',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    instagram_username = EXCLUDED.instagram_username,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    profile_picture_url = EXCLUDED.profile_picture_url,
    updated_at = NOW();

-- Grant necessary permissions
GRANT ALL ON public.instagram_profiles TO authenticated;
GRANT ALL ON public.instagram_profiles TO service_role;
