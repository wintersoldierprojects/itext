-- ===============================================
-- Message Reactions Table for Phase 9 Interactive Features
-- ===============================================

-- 5. MESSAGE REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('heart', 'like', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one reaction per user per message
    UNIQUE(message_id, user_id, reaction_type)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON public.message_reactions(user_id);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reactions
CREATE POLICY "Users can read reactions in their conversations" ON public.message_reactions
    FOR SELECT USING (
        EXISTS(
            SELECT 1 FROM public.messages m
            JOIN public.conversations c ON m.conversation_id = c.id 
            WHERE m.id = message_id 
            AND (c.user_id = auth.uid() OR c.admin_id = auth.uid())
        ) OR 
        EXISTS(SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can add reactions" ON public.message_reactions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS(
            SELECT 1 FROM public.messages m
            JOIN public.conversations c ON m.conversation_id = c.id 
            WHERE m.id = message_id 
            AND (c.user_id = auth.uid() OR c.admin_id = auth.uid())
        )
    );

CREATE POLICY "Users can remove their reactions" ON public.message_reactions
    FOR DELETE USING (user_id = auth.uid());

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;

-- Function to toggle reaction
CREATE OR REPLACE FUNCTION public.toggle_reaction(
    p_message_id UUID,
    p_reaction_type VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Check if reaction already exists
    SELECT EXISTS(
        SELECT 1 FROM public.message_reactions 
        WHERE message_id = p_message_id 
        AND user_id = auth.uid() 
        AND reaction_type = p_reaction_type
    ) INTO v_exists;
    
    IF v_exists THEN
        -- Remove reaction
        DELETE FROM public.message_reactions 
        WHERE message_id = p_message_id 
        AND user_id = auth.uid() 
        AND reaction_type = p_reaction_type;
        RETURN FALSE;
    ELSE
        -- Add reaction (replace any existing reaction from this user)
        DELETE FROM public.message_reactions 
        WHERE message_id = p_message_id 
        AND user_id = auth.uid();
        
        INSERT INTO public.message_reactions (message_id, user_id, reaction_type)
        VALUES (p_message_id, auth.uid(), p_reaction_type);
        RETURN TRUE;
    END IF;
END;
$$;

-- Function to get reaction counts for a message
CREATE OR REPLACE FUNCTION public.get_message_reactions(p_message_id UUID)
RETURNS TABLE(reaction_type VARCHAR, count BIGINT, user_reacted BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mr.reaction_type,
        COUNT(*) as count,
        BOOL_OR(mr.user_id = auth.uid()) as user_reacted
    FROM public.message_reactions mr
    WHERE mr.message_id = p_message_id
    GROUP BY mr.reaction_type
    ORDER BY count DESC, mr.reaction_type;
END;
$$;