import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ipfsHash } = body;

    // Verify project exists and user is the researcher
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { researcher: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.researcher.address.toLowerCase() !== session.user.address.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create research output
    const output = await prisma.researchOutput.create({
      data: {
        title: 'Research Output', // This will be updated with the actual title from IPFS
        description: 'Research output description', // This will be updated with the actual description from IPFS
        ipfsHash,
        project: {
          connect: { id: params.id },
        },
        researcher: {
          connect: { id: session.user.id },
        },
      },
    });

    // Update project status
    await prisma.project.update({
      where: { id: params.id },
      data: {
        status: 'COMPLETED',
      },
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error('Error creating research output:', error);
    return NextResponse.json(
      { error: 'Failed to create research output' },
      { status: 500 }
    );
  }
} 