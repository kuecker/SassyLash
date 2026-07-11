import { CognitoJwtVerifier } from 'aws-jwt-verify'
import type { NextRequest } from 'next/server'

// Single-owner auth. The admin login exchanges email+password for a Cognito
// ID token (see /api/auth/login), stored in an httpOnly cookie. Every gated
// surface verifies that token's signature against the pool JWKS and checks the
// email claim equals OWNER_EMAIL — the same single-owner rule the old
// Supabase middleware enforced.

export const AUTH_COOKIE = 'id_token'
export const OWNER_EMAIL = process.env.OWNER_EMAIL

const userPoolId = process.env.COGNITO_USER_POOL_ID ?? ''
const clientId = process.env.COGNITO_CLIENT_ID ?? process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? ''

// Lazily created so a missing env var during build doesn't throw at import time.
let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null
function getVerifier() {
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({ userPoolId, tokenUse: 'id', clientId })
  }
  return verifier
}

export async function verifyOwnerToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  try {
    const payload = await getVerifier().verify(token)
    return typeof payload.email === 'string' && payload.email === OWNER_EMAIL
  } catch {
    return false
  }
}

export function requestIsOwner(request: NextRequest): Promise<boolean> {
  return verifyOwnerToken(request.cookies.get(AUTH_COOKIE)?.value)
}
