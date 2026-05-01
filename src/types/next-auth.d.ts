import type { DefaultSession } from 'next-auth';
import type { AuthUserDto } from '@/api/types/auth.types';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    backendUser?: AuthUserDto;
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    backendUser?: AuthUserDto;
    error?: string;
  }
}
