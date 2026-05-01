import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import type { AuthUserDto } from '@/api/types/auth.types';
import { exchangeOAuthForBackendSession } from '@/lib/oauth-backend-exchange';

function buildProviders() {
  const list = [];

  const googleId = process.env.GOOGLE_CLIENT_ID?.trim();
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (googleId && googleSecret) {
    list.push(
      GoogleProvider({
        clientId: googleId,
        clientSecret: googleSecret,
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code',
          },
        },
      }),
    );
  }

  const ghId = process.env.GITHUB_ID?.trim();
  const ghSecret = process.env.GITHUB_SECRET?.trim();
  if (ghId && ghSecret) {
    list.push(
      GitHubProvider({
        clientId: ghId,
        clientSecret: ghSecret,
      }),
    );
  }

  if (list.length === 0) {
    // Allows NextAuth to initialise before env is set; OAuth consent will fail until configured.
    list.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || 'unset',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'unset',
      }),
    );
  }

  return list;
}

const oauthProviders = buildProviders();

export const authOptions: NextAuthOptions = {
  providers: oauthProviders,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile && typeof profile === 'object') {
        const result = await exchangeOAuthForBackendSession({
          provider: account.provider,
          account: account as Record<string, unknown>,
          profile: profile as Record<string, unknown>,
        });
        if (!result.ok) {
          throw new Error(result.message);
        }
        return {
          ...token,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          backendUser: result.user,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.accessToken === 'string') {
        session.accessToken = token.accessToken;
      }
      if (typeof token.refreshToken === 'string') {
        session.refreshToken = token.refreshToken;
      }
      if (token.backendUser && typeof token.backendUser === 'object') {
        session.backendUser = token.backendUser as AuthUserDto;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
