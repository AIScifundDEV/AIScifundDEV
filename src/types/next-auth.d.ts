import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    address: string;
    name: string;
    avatar: string;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    address: string;
    avatar: string;
  }
} 