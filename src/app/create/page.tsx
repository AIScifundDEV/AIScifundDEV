'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { uploadToIPFS } from '@/lib/ipfs';

export default function CreateProject() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fundingGoal: '',
    duration: '30',
    category: '',
    tags: [] as string[],
    methodology: '',
    expectedOutcomes: '',
    timeline: '',
    budgetBreakdown: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload project details to IPFS
      const projectDetails = {
        title: formData.title,
        description: formData.description,
        methodology: formData.methodology,
        expectedOutcomes: formData.expectedOutcomes,
        timeline: formData.timeline,
        budgetBreakdown: formData.budgetBreakdown,
        tags: formData.tags,
        createdAt: Date.now(),
      };

      const ipfsHash = await uploadToIPFS(projectDetails, {
        name: formData.title,
        description: formData.description,
        version: '1.0.0',
        timestamp: Date.now(),
      });

      // Create project in database
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fundingGoal: ethers.parseEther(formData.fundingGoal).toString(),
          researcher: address,
          ipfsHash,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const project = await response.json();
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Research Project</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter project title"
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
              placeholder="Describe your research project"
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
              Expected Outcomes
            </label>
            <textarea
              required
              value={formData.expectedOutcomes}
              onChange={(e) => setFormData({ ...formData, expectedOutcomes: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-32"
              placeholder="Describe your expected research outcomes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeline
            </label>
            <textarea
              required
              value={formData.timeline}
              onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-32"
              placeholder="Describe your project timeline"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Breakdown
            </label>
            <textarea
              required
              value={formData.budgetBreakdown}
              onChange={(e) => setFormData({ ...formData, budgetBreakdown: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-32"
              placeholder="Break down your budget allocation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Funding Goal (ETH)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.fundingGoal}
              onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter funding goal in ETH"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (Days)
            </label>
            <select
              required
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter tags separated by commas"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isConnected}
            className={`w-full btn-primary ${
              (isSubmitting || !isConnected) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Creating Project...' : 'Create Project'}
          </button>

          {!isConnected && (
            <p className="text-center text-red-500 text-sm">
              Please connect your wallet to create a project
            </p>
          )}
        </form>
      </div>
    </main>
  );
} 