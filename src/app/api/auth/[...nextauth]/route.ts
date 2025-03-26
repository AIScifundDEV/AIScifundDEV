import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ethers } from 'ethers';

interface User {
  id: string;
  address: string;
  name: string;
  avatar: string;
}

interface CustomSession extends Session {
  user: {
    id: string;
    address: string;
    avatar: string;
  } & Session['user'];
}

type CustomJWT = JWT & {
  address: string;
  avatar: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Web3',
      credentials: {
        address: { label: 'Wallet Address', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.address || !credentials?.signature) {
          throw new Error('Missing credentials');
        }

        try {
          // Verify the signature
          const message = `Sign in to SciFund with address ${credentials.address}`;
          const recoveredAddress = ethers.verifyMessage(message, credentials.signature);

          if (recoveredAddress.toLowerCase() !== credentials.address.toLowerCase()) {
            throw new Error('Invalid signature');
          }

          // Find or create user
          let user = await prisma.user.findUnique({
            where: { address: credentials.address },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                address: credentials.address,
                name: `User ${credentials.address.slice(0, 6)}...${credentials.address.slice(-4)}`,
                avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${credentials.address}`,
              },
            });
          }

          return {
            id: user.id,
            address: user.address,
            name: user.name,
            avatar: user.avatar,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.address = token.address;
        session.user.avatar = token.avatar;
      }
      return session as CustomSession;
    },
    async jwt({ token, user }) {
      if (user) {
        token.address = user.address;
        token.avatar = user.avatar;
      }
      return token as CustomJWT;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 