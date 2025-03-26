'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useSignMessage } from 'wagmi';
import { signIn } from 'next-auth/react';

export default function SignIn() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { signMessage } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const message = `Sign in to SciFund with address ${address}`;
      const signature = await signMessage({ message }) as string;

      const result = await signIn('credentials', {
        address,
        signature,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/');
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">Sign In</h1>

          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              Connect your wallet to sign in to SciFund
            </p>

            <button
              onClick={handleSignIn}
              disabled={isLoading || !isConnected}
              className={`w-full btn-primary ${
                (isLoading || !isConnected) && 'opacity-50 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Signing in...' : 'Sign in with Wallet'}
            </button>

            {!isConnected && (
              <p className="text-center text-red-500 text-sm">
                Please connect your wallet to sign in
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 