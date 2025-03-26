import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ethers } from 'ethers';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    fundingGoal: number;
    currentFunding: number;
    deadline: string;
    researcher: {
      name: string;
      avatar: string;
    };
    category: {
      name: string;
    };
  };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const progress = (project.currentFunding / project.fundingGoal) * 100;
  const daysLeft = Math.max(0, Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="card hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 w-full mb-4 rounded-t-xl overflow-hidden">
        <Image
          src={`https://picsum.photos/seed/${project.id}/800/400`}
          alt={project.title}
          layout="fill"
          objectFit="cover"
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-purple-600">
            {project.category.name}
          </span>
          <span className="text-sm text-gray-500">
            {daysLeft} days left
          </span>
        </div>

        <Link href={`/projects/${project.id}`}>
          <h3 className="text-xl font-semibold mb-2 hover:text-purple-600 transition-colors">
            {project.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">
              {ethers.utils.formatEther(project.currentFunding.toString())} ETH
            </span>
            <span className="text-gray-500">
              of {ethers.utils.formatEther(project.fundingGoal.toString())} ETH
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-purple-600 rounded-full"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center">
          <div className="relative h-8 w-8 rounded-full overflow-hidden">
            <Image
              src={project.researcher.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${project.researcher.name}`}
              alt={project.researcher.name}
              layout="fill"
            />
          </div>
          <span className="ml-2 text-sm text-gray-600">
            by {project.researcher.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard; 