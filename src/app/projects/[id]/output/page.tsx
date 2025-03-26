'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import { ethers } from 'ethers';
import { uploadToIPFS } from '@/lib/ipfs';
import { useSession } from 'next-auth/react';

interface Project {
  id: string;
  title: string;
  researcher: {
    address: string;
  };
}

export default function CreateResearchOutput() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    methodology: '',
    results: '',
    conclusions: '',
    data: '',
    code: '',
  });

  const { write: createOutput, data: createData } = useContractWrite({
    address: process.env.NEXT_PUBLIC_RESEARCH_OUTPUT_NFT_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'ipfsHash', type: 'string' },
          { name: 'projectId', type: 'uint256' },
          { name: 'tokenURI', type: 'string' },
        ],
        name: 'createResearchOutput',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ],
    functionName: 'createResearchOutput',
  });

  const { isLoading: isTransactionLoading } = useWaitForTransaction({
    hash: createData?.hash,
  });

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (!response.ok) throw new Error('Project not found');
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !project || !session?.user) return;

    setIsSubmitting(true);
    try {
      // Upload research output to IPFS
      const outputData = {
        title: formData.title,
        description: formData.description,
        methodology: formData.methodology,
        results: formData.results,
        conclusions: formData.conclusions,
        data: formData.data,
        code: formData.code,
        createdAt: Date.now(),
      };

      const ipfsHash = await uploadToIPFS(outputData, {
        name: formData.title,
        description: formData.description,
        version: '1.0.0',
        timestamp: Date.now(),
      });

      // Create NFT
      const tokenURI = `ipfs://${ipfsHash}`;
      await createOutput({
        args: [
          formData.title,
          formData.description,
          ipfsHash,
          BigInt(project.id),
          tokenURI,
        ],
      });

      // Update project status
      await fetch(`/api/projects/${project.id}/output`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipfsHash,
        }),
      });

      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error creating research output:', error);
      alert('Failed to create research output. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Project not found</div>
      </div>
    );
  }

  if (project.researcher.address.toLowerCase() !== address?.toLowerCase()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">
          Only the project researcher can create research outputs
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Research Output</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter research output title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-32"
              placeholder="Describe your research output"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Methodology
            </label>
            <textarea
              required
              value={formData.methodology}
              onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-32"
              placeholder="Describe your research methodology"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Results
            </label>
            <textarea
              required
              value={formData.results}
              onChange={(e) => setFormData({ ...formData, results: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-32"
              placeholder="Present your research results"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conclusions
            </label>
            <textarea
              required
              value={formData.conclusions}
              onChange={(e) => setFormData({ ...formData, conclusions: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-32"
              placeholder="Share your research conclusions"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <textarea
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-32"
              placeholder="Share your research data"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code
            </label>
            <textarea
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-32"
              placeholder="Share your research code"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isTransactionLoading || !isConnected}
            className={`w-full btn-primary ${
              (isSubmitting || isTransactionLoading || !isConnected) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {isSubmitting || isTransactionLoading
              ? 'Creating Research Output...'
              : 'Create Research Output'}
          </button>

          {!isConnected && (
            <p className="text-center text-red-500 text-sm">
              Please connect your wallet to create a research output
            </p>
          )}
        </form>
      </div>
    </main>
  );
} 