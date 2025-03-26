import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

const Navigation = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="SciFund Logo"
                width={32}
                height={32}
                className="mr-2"
              />
              <span className="text-xl font-bold text-gray-800">SciFund</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/projects"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/create"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Create Project
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              About
            </Link>
          </div>

          <div className="flex items-center">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect()}
                className="btn-primary"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 