'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import Image from 'next/image';
import { getFromIPFS, getIPFSGatewayURL } from '@/lib/ipfs';

interface Project {
  id: string;
  title: string;
  description: string;
  fundingGoal: number;
  currentFunding: number;
  deadline: string;
  status: string;
  ipfsHash: string;
  researcher: {
    name: string;
    avatar: string;
  };
  category: {
    name: string;
  };
}

interface IPFSData {
  methodology: string;
  expectedOutcomes: string;
  timeline: string;
  budgetBreakdown: string;
  tags: string[];
}

export default function ProjectDetail() {
  const params = useParams();
  const { address, isConnected } = useAccount();
  const [project, setProject] = useState<Project | null>(null);
  const [ipfsData, setIpfsData] = useState<IPFSData | null>(null);
  const [fundingAmount, setFundingAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`);
      if (!response.ok) throw new Error('Project not found');
      const data = await response.json();
      setProject(data);

      // Fetch IPFS data
      if (data.ipfsHash) {
        const ipfsContent = await getFromIPFS(data.ipfsHash);
        setIpfsData(ipfsContent);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !project) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement blockchain transaction
      const amount = ethers.parseEther(fundingAmount);
      
      // Update database
      await fetch(`/api/projects/${project.id}/fund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount.toString(),
          funder: address,
        }),
      });

      await fetchProject();
      setFundingAmount('');
    } catch (error) {
      console.error('Error funding project:', error);
      alert('Failed to fund project. Please try again.');
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

  const progress = (project.currentFunding / project.fundingGoal) * 100;
  const daysLeft = Math.max(0, Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative h-64 w-full">
            <Image
              src={`https://picsum.photos/seed/${project.id}/1200/400`}
              alt={project.title}
              layout="fill"
              objectFit="cover"
            />
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-purple-600">
                {project.category.name}
              </span>
              <span className="text-sm text-gray-500">
                {daysLeft} days left
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-4">{project.title}</h1>

            <div className="flex items-center mb-6">
              <div className="relative h-10 w-10 rounded-full overflow-hidden">
                <Image
                  src={project.researcher.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${project.researcher.name}`}
                  alt={project.researcher.name}
                  layout="fill"
                />
              </div>
              <span className="ml-3 text-gray-600">
                by {project.researcher.name}
              </span>
            </div>

            <div className="prose max-w-none mb-8">
              {project.description}
            </div>

            {ipfsData && (
              <div className="space-y-6 mb-8">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Methodology</h2>
                  <p className="text-gray-600">{ipfsData.methodology}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Expected Outcomes</h2>
                  <p className="text-gray-600">{ipfsData.expectedOutcomes}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Timeline</h2>
                  <p className="text-gray-600">{ipfsData.timeline}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Budget Breakdown</h2>
                  <p className="text-gray-600">{ipfsData.budgetBreakdown}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {ipfsData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">
                  {ethers.formatEther(project.currentFunding.toString())} ETH
                </span>
                <span className="text-gray-500">
                  of {ethers.formatEther(project.fundingGoal.toString())} ETH
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>

            {project.status === 'ACTIVE' && (
              <form onSubmit={handleFund} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter amount to fund"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isConnected}
                  className={`w-full btn-primary ${
                    (isSubmitting || !isConnected) && 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Fund Project'}
                </button>

                {!isConnected && (
                  <p className="text-center text-red-500 text-sm">
                    Please connect your wallet to fund this project
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 