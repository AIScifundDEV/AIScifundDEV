import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Initialize IPFS client
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`
    ).toString('base64')}`,
  },
});

export interface IPFSMetadata {
  name: string;
  description: string;
  version: string;
  timestamp: number;
}

export async function uploadToIPFS(
  data: any,
  metadata: IPFSMetadata
): Promise<string> {
  try {
    // Convert data to Buffer
    const buffer = Buffer.from(JSON.stringify(data));

    // Upload to IPFS
    const result = await ipfs.add(buffer);

    // Add metadata as a separate file
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    await ipfs.add(metadataBuffer);

    return result.path;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

export async function getFromIPFS(hash: string): Promise<any> {
  try {
    const stream = ipfs.cat(hash);
    const chunks = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    return JSON.parse(buffer.toString());
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw new Error('Failed to retrieve from IPFS');
  }
}

export function getIPFSGatewayURL(hash: string): string {
  const gateway = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
  return `${gateway}${hash}`;
} 