/**
 * Instagram integration utilities
 * Handles username validation, profile picture fetching, and user lookup
 */

interface InstagramUser {
  username: string
  full_name: string
  profile_picture_url: string
  is_verified: boolean
  follower_count?: number
  is_private: boolean
}

interface InstagramValidationResult {
  isValid: boolean
  exists: boolean
  user?: InstagramUser
  error?: string
}

/**
 * Validates Instagram username format
 */
export function validateInstagramUsername(username: string): { isValid: boolean; error?: string } {
  if (!username) {
    return { isValid: false, error: 'Username is required' }
  }

  // Remove @ symbol if present
  const cleanUsername = username.replace(/^@/, '')

  // Instagram username validation rules
  const usernameRegex = /^[a-zA-Z0-9._]{1,30}$/
  
  if (!usernameRegex.test(cleanUsername)) {
    return { 
      isValid: false, 
      error: 'Username can only contain letters, numbers, periods, and underscores' 
    }
  }

  if (cleanUsername.length < 1 || cleanUsername.length > 30) {
    return { 
      isValid: false, 
      error: 'Username must be between 1 and 30 characters' 
    }
  }

  // Check for consecutive periods
  if (cleanUsername.includes('..')) {
    return { 
      isValid: false, 
      error: 'Username cannot contain consecutive periods' 
    }
  }

  // Check if starts/ends with period
  if (cleanUsername.startsWith('.') || cleanUsername.endsWith('.')) {
    return { 
      isValid: false, 
      error: 'Username cannot start or end with a period' 
    }
  }

  return { isValid: true }
}

/**
 * Generates Instagram profile picture URL
 * Uses fallback strategy for profile picture fetching
 */
export function getInstagramProfilePicture(username: string): string {
  const cleanUsername = username.replace(/^@/, '')
  
  // Use Instagram's public profile picture API pattern
  // Note: In production, you might want to use Instagram Basic Display API
  
  // For now, we'll use a reliable fallback pattern
  // In a real implementation, you'd fetch the actual profile picture
  return generateProfilePictureUrl(cleanUsername)
}

/**
 * Generates a fallback profile picture URL
 */
function generateProfilePictureUrl(username: string): string {
  // Create a deterministic avatar based on username
  const colors = [
    '0ABAB5', // Tiffany blue
    'FF69B4', // Hot pink
    '20B2AA', // Light sea green
    'FF1493', // Deep pink
    '48D1CC', // Medium turquoise
    'FF6347', // Tomato
    '00CED1', // Dark turquoise
    'FF4500'  // Orange red
  ]
  
  // Use username hash to select color
  const hash = username.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const colorIndex = Math.abs(hash) % colors.length
  const color = colors[colorIndex]
  
  // Use DiceBear API for consistent avatars
  return `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=${color}&textColor=ffffff`
}

/**
 * Simulates Instagram user lookup
 * In production, this would call Instagram's API
 */
export async function lookupInstagramUser(username: string): Promise<InstagramValidationResult> {
  const validation = validateInstagramUsername(username)
  
  if (!validation.isValid) {
    return {
      isValid: false,
      exists: false,
      error: validation.error
    }
  }

  const cleanUsername = username.replace(/^@/, '')

  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

    // Simulate user lookup with realistic data
    const mockUsers = [
      'sarah_90', 'mike_design', 'admin_support', 'john_doe', 'mary_j',
      'alex_photo', 'lisa_art', 'david_dev', 'emma_writes', 'tom_code'
    ]

    const exists = mockUsers.includes(cleanUsername.toLowerCase()) || Math.random() > 0.3

    if (!exists) {
      return {
        isValid: true,
        exists: false,
        error: 'Instagram user not found'
      }
    }

    // Generate realistic user data
    const user: InstagramUser = {
      username: cleanUsername,
      full_name: generateFullName(cleanUsername),
      profile_picture_url: generateProfilePictureUrl(cleanUsername),
      is_verified: Math.random() > 0.8,
      follower_count: Math.floor(Math.random() * 10000) + 100,
      is_private: Math.random() > 0.7
    }

    return {
      isValid: true,
      exists: true,
      user
    }

  } catch {
    return {
      isValid: true,
      exists: false,
      error: 'Failed to verify Instagram user'
    }
  }
}

/**
 * Generates a realistic full name from username
 */
function generateFullName(username: string): string {
  const firstNames = [
    'Sarah', 'Mike', 'Lisa', 'John', 'Emma', 'David', 'Mary', 'Alex', 
    'Tom', 'Anna', 'Chris', 'Nina', 'Mark', 'Eva', 'Sam'
  ]
  
  const lastNames = [
    'Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez'
  ]

  // Try to extract name hints from username
  if (username.includes('_')) {
    const parts = username.split('_')
    if (parts.length >= 2) {
      const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
      const lastName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
      return `${firstName} ${lastName}`
    }
  }

  // Generate random name
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  
  return `${firstName} ${lastName}`
}

/**
 * Caches Instagram user data to reduce API calls
 */
class InstagramCache {
  private cache = new Map<string, { data: InstagramValidationResult; timestamp: number }>()
  private readonly TTL = 10 * 60 * 1000 // 10 minutes

  get(username: string): InstagramValidationResult | null {
    const cached = this.cache.get(username.toLowerCase())
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(username.toLowerCase())
      return null
    }

    return cached.data
  }

  set(username: string, data: InstagramValidationResult): void {
    this.cache.set(username.toLowerCase(), {
      data,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

export const instagramCache = new InstagramCache()

/**
 * Cached Instagram user lookup
 */
export async function lookupInstagramUserCached(username: string): Promise<InstagramValidationResult> {
  const cached = instagramCache.get(username)
  if (cached) {
    return cached
  }

  const result = await lookupInstagramUser(username)
  instagramCache.set(username, result)
  
  return result
}