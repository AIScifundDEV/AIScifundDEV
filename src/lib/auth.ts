import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ethers } from 'ethers';

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
          return null;
        }

        try {
          // Verify the signature
          const message = `Sign in to SciFund with address ${credentials.address}`;
          const recoveredAddress = ethers.verifyMessage(message, credentials.signature);

          if (recoveredAddress.toLowerCase() !== credentials.address.toLowerCase()) {
            return null;
          }

          // Return user object
          return {
            id: credentials.address,
            address: credentials.address,
            name: credentials.address.slice(0, 6) + '...' + credentials.address.slice(-4),
            avatar: `https://avatars.dicebear.com/api/identicon/${credentials.address}.svg`,
          };
        } catch (error) {
          console.error('Error verifying signature:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.address = user.address;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.address = token.address as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
  },
}; 