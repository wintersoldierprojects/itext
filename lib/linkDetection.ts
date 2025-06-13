'use client';

// More comprehensive URL regex that includes www. without protocol
const COMPREHENSIVE_URL_REGEX = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

export interface DetectedLink {
  url: string;
  displayText: string;
  startIndex: number;
  endIndex: number;
  isValid: boolean;
}

/**
 * Detects URLs in a text string and returns information about them
 */
export function detectLinks(text: string): DetectedLink[] {
  const links: DetectedLink[] = [];
  let match;

  // Reset regex lastIndex to ensure fresh matching
  COMPREHENSIVE_URL_REGEX.lastIndex = 0;

  while ((match = COMPREHENSIVE_URL_REGEX.exec(text)) !== null) {
    const matchedText = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + matchedText.length;

    // Ensure the URL has a protocol
    let fullUrl = matchedText;
    if (!matchedText.startsWith('http://') && !matchedText.startsWith('https://')) {
      fullUrl = 'https://' + matchedText;
    }

    // Validate the URL
    const isValid = isValidUrl(fullUrl);

    links.push({
      url: fullUrl,
      displayText: matchedText,
      startIndex,
      endIndex,
      isValid
    });
  }

  return links;
}

/**
 * Validates if a string is a proper URL
 */
export function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks if a message contains any URLs
 */
export function containsLinks(text: string): boolean {
  return detectLinks(text).length > 0;
}

/**
 * Extracts the domain from a URL for display purposes
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * Renders text with clickable links
 * Returns an array of text segments and link objects
 */
export interface TextSegment {
  type: 'text' | 'link';
  content: string;
  url?: string;
  displayText?: string;
}

export function parseTextWithLinks(text: string): TextSegment[] {
  const links = detectLinks(text);
  
  if (links.length === 0) {
    return [{ type: 'text', content: text }];
  }

  const segments: TextSegment[] = [];
  let lastIndex = 0;

  // Sort links by start index to process them in order
  links.sort((a, b) => a.startIndex - b.startIndex);

  for (const link of links) {
    // Add text before the link
    if (link.startIndex > lastIndex) {
      const textBefore = text.slice(lastIndex, link.startIndex);
      if (textBefore) {
        segments.push({ type: 'text', content: textBefore });
      }
    }

    // Add the link
    segments.push({
      type: 'link',
      content: link.displayText,
      url: link.url,
      displayText: link.displayText
    });

    lastIndex = link.endIndex;
  }

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    const textAfter = text.slice(lastIndex);
    if (textAfter) {
      segments.push({ type: 'text', content: textAfter });
    }
  }

  return segments;
}

/**
 * Sanitizes a URL to prevent XSS attacks
 */
export function sanitizeUrl(url: string): string {
  // Basic sanitization - ensure it's a valid HTTP/HTTPS URL
  try {
    const urlObj = new URL(url);
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      return urlObj.toString();
    }
  } catch {
    // If URL parsing fails, return a safe default
  }
  
  return '#';
}

/**
 * Generates a safe link with proper attributes for external links
 */
export function createSafeLink(url: string): { href: string; target: string; rel: string } {
  return {
    href: sanitizeUrl(url),
    target: '_blank',
    rel: 'noopener noreferrer'
  };
}
