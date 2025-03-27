# AISciFund - AI-Driven Scientific Research Funding Platform

[![Website](https://img.shields.io/badge/Website-aiscifund.xyz-blue)](https://www.aiscifund.xyz)
[![Twitter Follow](https://img.shields.io/twitter/follow/AI_SciFund?style=social)](https://x.com/AI_SciFund)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AISciFund is an innovative decentralized platform that revolutionizes scientific research funding by leveraging artificial intelligence and blockchain technology. Our platform creates a transparent, efficient, and accessible ecosystem where researchers and supporters can collaborate to advance scientific discovery.

## Core Features

- **AI-Powered Project Matching**: Smart algorithms connect researchers with potential funders based on research interests and impact potential
- **Decentralized Funding**: Transparent and efficient fund distribution through blockchain technology
- **Research NFTs**: Tokenization of research outputs with automated reward distribution
- **Peer Review System**: AI-assisted peer review process for quality assurance
- **Impact Tracking**: Real-time monitoring of research impact and fund utilization

## Technology Stack

- **Frontend**: Next.js 13+, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Blockchain**: Ethereum Smart Contracts
- **AI Integration**: Advanced machine learning models for project matching and evaluation
- **Storage**: IPFS for decentralized data storage

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- MetaMask or other Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone git@github.com:AIScifundDEV/AIScifundDEV.git
cd AIScifundDEV
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update the environment variables with your configuration:
```env
NEXT_PUBLIC_RPC_URL=your_rpc_url
NEXT_PUBLIC_RESEARCH_OUTPUT_NFT_ADDRESS=your_contract_address
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
```

5. Run database migrations:
```bash
pnpm prisma migrate dev
```

6. Start the development server:
```bash
pnpm dev
```

## Smart Contracts

The platform utilizes the following smart contracts:

- `ResearchOutputNFT.sol`: Manages research output tokenization and reward distribution
- `SciFund.sol`: Handles fund management and distribution

### Contract Deployment

1. Configure deployment settings in `hardhat.config.ts`
2. Deploy contracts:
```bash
pnpm hardhat deploy --network your_network
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## Security

For security concerns, please check our security policy in the repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Official Links

- Website: [https://www.scifund.xyz](https://www.aiscifund.xyz)
- Twitter: [@AI_SciFund](https://x.com/AI_SciFund)
- GitHub: [@AIScifundDEV/AIScifundDEV](https://github.com/AIScifundDEV/AIScifundDEV) 
