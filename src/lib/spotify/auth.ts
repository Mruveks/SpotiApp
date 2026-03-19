/**
 * Spotify OAuth configuration for NextAuth.js v5
 * Handles token refresh and session management
 */

import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-read-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-follow-read',
  'user-library-read',
].join(' ');

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

/**
 * Refresh the Spotify access token using the refresh token
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken as string,
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: params,
    });

    const data: SpotifyTokenResponse = await response.json();

    if (!response.ok) throw data;

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      error: undefined,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    {
      id: 'spotify',
      name: 'Spotify',
      type: 'oauth',
      authorization: {
        url: 'https://accounts.spotify.com/authorize',
        params: {
          scope: SPOTIFY_SCOPES,
          redirect_uri: `${process.env.NEXTAUTH_URL ?? process.env.AUTH_URL}/api/auth/callback/spotify`,
        },
      },
      token: 'https://accounts.spotify.com/api/token',
      userinfo: 'https://api.spotify.com/v1/me',
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      profile(profile: {
        id: string;
        display_name: string;
        email: string;
        images?: { url: string }[];
      }) {
        return {
          id: profile.id,
          name: profile.display_name,
          email: profile.email,
          image: profile.images?.[0]?.url,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
          user,
        };
      }

      // Return token if not expired
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Token expired, refresh it
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        error: token.error as string | undefined,
        user: {
          ...session.user,
          id: token.sub as string,
        },
      };
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24,
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
