/**
 * Utility functions for creating dbdiagram.io URLs with pre-filled schemas
 */

/**
 * Creates a dbdiagram.io URL with the schema pre-filled
 * Tries multiple URL formats as the exact API isn't documented
 */
export function createDbdiagramUrl(dbml: string): string {
  // Method 1: URL parameter with encoded DBML
  const encodedDBML = encodeURIComponent(dbml);
  
  // Try the query parameter approach first
  // Based on community discussions, this might work
  return `https://dbdiagram.io/d?q=${encodedDBML}`;
}

/**
 * Alternative method using base64 encoding
 * Some services prefer base64 for complex data in URLs
 */
export function createDbdiagramUrlBase64(dbml: string): string {
  // Convert to base64
  const base64DBML = btoa(unescape(encodeURIComponent(dbml)));
  
  // Try with base64 encoded parameter
  return `https://dbdiagram.io/d?code=${base64DBML}`;
}

/**
 * Creates a shareable dbdiagram.io link
 * This attempts to use their embed/share format
 */
export function createDbdiagramShareUrl(dbml: string): string {
  const encodedDBML = encodeURIComponent(dbml);
  
  // Try the embed format
  return `https://dbdiagram.io/embed/${encodedDBML}`;
}

/**
 * Fallback to basic dbdiagram.io URL
 * User will need to paste the schema manually
 */
export function getDbdiagramBaseUrl(): string {
  return 'https://dbdiagram.io/d';
}