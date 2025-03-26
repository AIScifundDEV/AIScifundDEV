// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}));

// Mock wagmi
jest.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x123',
    isConnected: true,
  }),
  useContractWrite: () => ({
    write: jest.fn(),
    isLoading: false,
    isSuccess: false,
    isError: false,
  }),
  useWaitForTransaction: () => ({
    isLoading: false,
    isSuccess: false,
    isError: false,
  }),
}));

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    Contract: jest.fn(),
    JsonRpcProvider: jest.fn(),
    verifyMessage: jest.fn(),
  },
})); 