'use client';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  version?: string; // Cache version for invalidation
}

class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private dbName = 'cherrygifts-cache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxMemorySize = 100; // Maximum memory cache entries

  constructor() {
    this.initIndexedDB();
    this.startCleanupInterval();
  }

  private async initIndexedDB() {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('IndexedDB not available');
      return;
    }

    try {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB');
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
          messageStore.createIndex('conversationId', 'conversationId', { unique: false });
          messageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('conversations')) {
          db.createObjectStore('conversations', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    } catch (error) {
      console.error('Error initializing IndexedDB:', error);
    }
  }

  // Memory cache operations
  setMemory<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      version: options.version || '1.0.0',
    };

    this.memoryCache.set(key, entry);

    // Enforce max size
    if (this.memoryCache.size > this.maxMemorySize) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }
  }

  getMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  deleteMemory(key: string): void {
    this.memoryCache.delete(key);
  }

  // IndexedDB operations
  async setIndexedDB<T>(storeName: string, key: string, data: T, options: CacheOptions = {}): Promise<void> {
    if (!this.db) {
      console.warn('IndexedDB not available');
      return;
    }

    const ttl = options.ttl || this.defaultTTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      version: options.version || '1.0.0',
    };

    try {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const putRequest = store.put({ key, ...entry });
      
      return new Promise<void>((resolve, reject) => {
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error || new Error('IndexedDB put operation failed'));
      });
    } catch (error) {
      console.error('Error setting IndexedDB cache:', error);
    }
  }

  async getIndexedDB<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) {
      return null;
    }

    try {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result;
          
          if (!result) {
            resolve(null);
            return;
          }

          // Check if expired
          if (Date.now() > result.expiresAt) {
            this.deleteIndexedDB(storeName, key);
            resolve(null);
            return;
          }

          resolve(result.data);
        };

        request.onerror = () => {
          console.error('Error getting IndexedDB cache:', request.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Error accessing IndexedDB:', error);
      return null;
    }
  }

  async deleteIndexedDB(storeName: string, key: string): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.delete(key);
    } catch (error) {
      console.error('Error deleting IndexedDB cache:', error);
    }
  }

  // High-level cache operations
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    // Always set in memory for fast access
    this.setMemory(key, data, options);

    // Also set in IndexedDB for persistence
    await this.setIndexedDB('cache', key, data, options);
  }

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryResult = this.getMemory<T>(key);
    if (memoryResult !== null) {
      return memoryResult;
    }

    // Fallback to IndexedDB
    const dbResult = await this.getIndexedDB<T>('cache', key);
    if (dbResult !== null) {
      // Warm up memory cache
      this.setMemory(key, dbResult);
    }

    return dbResult;
  }

  async delete(key: string): Promise<void> {
    this.deleteMemory(key);
    await this.deleteIndexedDB('cache', key);
  }

  // Specialized cache methods for messages
  async cacheMessages(conversationId: string, messages: any[]): Promise<void> {
    const key = `messages:${conversationId}`;
    await this.set(key, messages, { ttl: 10 * 60 * 1000 }); // 10 minutes

    // Also cache individual messages in IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['messages'], 'readwrite');
      const store = transaction.objectStore('messages');
      
      for (const message of messages) {
        await store.put({
          ...message,
          conversationId,
          timestamp: Date.now(),
        });
      }
    }
  }

  async getCachedMessages(conversationId: string): Promise<any[] | null> {
    const key = `messages:${conversationId}`;
    return await this.get<any[]>(key);
  }

  // Cache conversations
  async cacheConversations(conversations: any[]): Promise<void> {
    await this.set('conversations', conversations, { ttl: 5 * 60 * 1000 }); // 5 minutes

    // Cache individual conversations
    if (this.db) {
      const transaction = this.db.transaction(['conversations'], 'readwrite');
      const store = transaction.objectStore('conversations');
      
      for (const conversation of conversations) {
        await store.put(conversation);
      }
    }
  }

  async getCachedConversations(): Promise<any[] | null> {
    return await this.get<any[]>('conversations');
  }

  // Cache user profiles
  async cacheUser(user: any): Promise<void> {
    const key = `user:${user.id}`;
    await this.set(key, user, { ttl: 30 * 60 * 1000 }); // 30 minutes

    if (this.db) {
      const transaction = this.db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      await store.put(user);
    }
  }

  async getCachedUser(userId: string): Promise<any | null> {
    const key = `user:${userId}`;
    return await this.get<any>(key);
  }

  // Cache invalidation
  async invalidatePattern(pattern: string): Promise<void> {
    // Invalidate memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Invalidate IndexedDB cache
    if (this.db) {
      try {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            if (cursor.key.toString().includes(pattern)) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      } catch (error) {
        console.error('Error invalidating cache pattern:', error);
      }
    }
  }

  // Clear all cache
  async clearAll(): Promise<void> {
    this.memoryCache.clear();

    if (this.db) {
      const storeNames = ['cache', 'messages', 'conversations', 'users'];
      
      for (const storeName of storeNames) {
        try {
          const transaction = this.db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          await store.clear();
        } catch (error) {
          console.error(`Error clearing ${storeName} store:`, error);
        }
      }
    }
  }

  // Cleanup expired entries
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpired();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private cleanupExpired(): void {
    const now = Date.now();
    
    // Cleanup memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
      }
    }

    // Cleanup IndexedDB cache
    if (this.db) {
      try {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const entry = cursor.value;
            if (now > entry.expiresAt) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      } catch (error) {
        console.error('Error during cache cleanup:', error);
      }
    }
  }

  // Get cache statistics
  getCacheStats() {
    return {
      memorySize: this.memoryCache.size,
      maxMemorySize: this.maxMemorySize,
      dbAvailable: !!this.db,
    };
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// React hook for cache operations
export function useCache() {
  const set = async <T>(key: string, data: T, options?: CacheOptions) => {
    return cacheManager.set(key, data, options);
  };

  const get = async <T>(key: string): Promise<T | null> => {
    return cacheManager.get<T>(key);
  };

  const remove = async (key: string) => {
    return cacheManager.delete(key);
  };

  const invalidate = async (pattern: string) => {
    return cacheManager.invalidatePattern(pattern);
  };

  const clear = async () => {
    return cacheManager.clearAll();
  };

  const stats = () => {
    return cacheManager.getCacheStats();
  };

  return {
    set,
    get,
    remove,
    invalidate,
    clear,
    stats,
  };
}
