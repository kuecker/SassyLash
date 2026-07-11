import { NextRequest, NextResponse } from 'next/server'
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { AUTH_COOKIE, OWNER_EMAIL } from '@/lib/auth/cognito'

const clientId = process.env.COGNITO_CLIENT_ID ?? process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? ''
const cognito = new CognitoIdentityProviderClient({})

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { email, password } = body
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
  }
  // Fast-reject non-owner emails (defense in depth; Cognito holds only the owner).
  if (OWNER_EMAIL && email !== OWNER_EMAIL) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }

  try {
    const out = await cognito.send(new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: { USERNAME: email, PASSWORD: password },
    }))
    const idToken = out.AuthenticationResult?.IdToken
    if (!idToken) {
      // e.g. NEW_PASSWORD_REQUIRED challenge — owner must finish setup in Cognito.
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(AUTH_COOKIE, idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1h, matches Cognito ID-token lifetime
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  }
}
