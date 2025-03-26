import { render, screen } from '@testing-library/react';
import ProjectCard from './ProjectCard';

const mockProject = {
  id: '1',
  title: 'Test Project',
  description: 'Test Description',
  fundingGoal: 1000,
  currentFunding: 500,
  deadline: '2024-12-31',
  status: 'ACTIVE',
  researcher: {
    name: 'Test Researcher',
    avatar: 'https://example.com/avatar.jpg',
  },
  category: {
    name: 'Test Category',
  },
};

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Test Researcher')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('500 / 1000')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('displays correct funding progress', () => {
    render(<ProjectCard project={mockProject} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('displays correct status badge', () => {
    render(<ProjectCard project={mockProject} />);

    const statusBadge = screen.getByText('ACTIVE');
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('links to project detail page', () => {
    render(<ProjectCard project={mockProject} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/projects/1');
  });
}); 