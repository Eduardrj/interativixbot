import { jwtVerify, createRemoteJWKSet } from 'jose';

/**
 * Verify Supabase JWT token and extract user information
 * @param token JWT token from Authorization header
 * @param supabaseUrl Supabase project URL
 * @returns Verified token payload with user_id (sub)
 */
export async function verifySupabaseToken(token: string, supabaseUrl: string) {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const projectId = supabaseUrl.split('//')[1]?.split('.');
    if (!projectId) {
      throw new Error('Invalid Supabase URL');
    }

    const JWKS = createRemoteJWKSet(
      new URL(`https://${projectId}.supabase.co/auth/v1/.well-known/jwks.json`)
    );

    const verified = await jwtVerify(token, JWKS);

    return {
      userId: verified.payload.sub as string,
      email: verified.payload.email as string | undefined,
      role: verified.payload.role as string | undefined,
    };
  } catch (error) {
    throw new Error(`Token verification failed: ${error instanceof Error ? error.message : 'Invalid token'}`);
  }
}

/**
 * Extract Bearer token from Authorization header
 * @param authHeader Authorization header value
 * @returns Bearer token without "Bearer " prefix
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}