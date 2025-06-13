import { createClient } from '@/lib/supabase'

export interface InstagramProfile {
  username: string
  full_name: string
  profile_picture_url: string
  is_verified?: boolean
  is_private?: boolean
  bio?: string
}

export interface InstagramApiResponse {
  success: boolean
  data?: InstagramProfile
  error?: string
  cached?: boolean
}

class InstagramProfileService {
  private static instance: InstagramProfileService
  private supabase = createClient()

  static getInstance(): InstagramProfileService {
    if (!InstagramProfileService.instance) {
      InstagramProfileService.instance = new InstagramProfileService()
    }
    return InstagramProfileService.instance
  }

  /**
   * Fetch Instagram profile data and store permanently
   * This is called ONLY ONCE during user signup
   */
  async fetchAndStoreProfile(username: string, userId: string): Promise<InstagramApiResponse> {
    try {
      // 1. Check if already cached in database
      const cached = await this.getCachedProfile(username)
      if (cached) {
        console.log('✅ Using cached Instagram profile for:', username)
        return { success: true, data: cached, cached: true }
      }

      // 2. Fetch from Instagram API (one-time only)
      console.log('🔍 Fetching Instagram profile for:', username)
      const profile = await this.fetchFromInstagramAPI(username)
      
      if (!profile) {
        return { success: false, error: 'Profile not found or API error' }
      }

      // 3. Download and store profile picture
      const localImageUrl = await this.downloadAndStoreImage(
        profile.profile_picture_url, 
        userId, 
        username
      )

      // 4. Save to database permanently
      const finalProfile: InstagramProfile = {
        ...profile,
        profile_picture_url: localImageUrl || profile.profile_picture_url
      }

      await this.saveToDatabase(username, userId, finalProfile)

      console.log('✅ Instagram profile stored permanently for:', username)
      return { success: true, data: finalProfile, cached: false }

    } catch (error) {
      console.error('❌ Instagram profile fetch error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Check if profile is already cached in database
   */
  private async getCachedProfile(username: string): Promise<InstagramProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('instagram_profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .single()

      if (error || !data) return null

      return {
        username: data.username,
        full_name: data.full_name,
        profile_picture_url: data.profile_picture_local_url || data.profile_picture_url,
        is_verified: data.is_verified,
        is_private: data.is_private,
        bio: data.bio
      }
    } catch {
      return null
    }
  }

  /**
   * Fetch profile from Instagram API
   * Using RapidAPI Instagram Scraper Stable API (500 free requests/month)
   */
  private async fetchFromInstagramAPI(username: string): Promise<InstagramProfile | null> {
    try {
      // Primary API: RapidAPI Instagram Scraper Stable
      const rapidApiKey = process.env.RAPIDAPI_KEY
      if (rapidApiKey) {
        const response = await fetch(
          `https://instagram-scraper-stable-api.p.rapidapi.com/profile?username=${username}`,
          {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key': rapidApiKey,
              'X-RapidAPI-Host': 'instagram-scraper-stable-api.p.rapidapi.com'
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data && data.username) {
            return {
              username: data.username,
              full_name: data.full_name || data.username,
              profile_picture_url: data.profile_pic_url || data.profile_picture_url,
              is_verified: data.is_verified || false,
              is_private: data.is_private || false,
              bio: data.biography || data.bio || ''
            }
          }
        }
      }

      // Fallback: Generate placeholder profile
      return this.generatePlaceholderProfile(username)

    } catch (error) {
      console.error('Instagram API error:', error)
      return this.generatePlaceholderProfile(username)
    }
  }

  /**
   * Generate placeholder profile if API fails
   */
  private generatePlaceholderProfile(username: string): InstagramProfile {
    return {
      username,
      full_name: username.charAt(0).toUpperCase() + username.slice(1),
      profile_picture_url: `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=0ABAB5&textColor=ffffff`,
      is_verified: false,
      is_private: false,
      bio: ''
    }
  }

  /**
   * Download profile picture and store in Supabase Storage
   */
  private async downloadAndStoreImage(
    imageUrl: string, 
    userId: string, 
    username: string
  ): Promise<string | null> {
    try {
      // Download image
      const response = await fetch(imageUrl)
      if (!response.ok) return null

      const imageBlob = await response.blob()
      const fileName = `${userId}/profile-${username}.jpg`

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('profile-pictures')
        .upload(fileName, imageBlob, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (error) {
        console.error('Storage upload error:', error)
        return null
      }

      // Get public URL
      const { data: publicUrlData } = this.supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      return publicUrlData.publicUrl

    } catch (error) {
      console.error('Image download/storage error:', error)
      return null
    }
  }

  /**
   * Save profile data to database permanently
   */
  private async saveToDatabase(
    username: string, 
    userId: string, 
    profile: InstagramProfile
  ): Promise<void> {
    try {
      // Save to instagram_profiles table
      await this.supabase
        .from('instagram_profiles')
        .upsert({
          username: username.toLowerCase(),
          user_id: userId,
          full_name: profile.full_name,
          profile_picture_url: profile.profile_picture_url,
          profile_picture_local_url: profile.profile_picture_url,
          is_verified: profile.is_verified || false,
          is_private: profile.is_private || false,
          bio: profile.bio || '',
          fetched_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      // Update user profile
      await this.supabase
        .from('users')
        .update({
          profile_picture_url: profile.profile_picture_url,
          instagram_fetched: true,
          instagram_fetched_at: new Date().toISOString()
        })
        .eq('id', userId)

    } catch (error) {
      console.error('Database save error:', error)
      throw error
    }
  }

  /**
   * Get profile for existing user (from cache only)
   */
  async getProfileForUser(username: string): Promise<InstagramProfile | null> {
    return await this.getCachedProfile(username)
  }
}

export default InstagramProfileService
