import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { amount, userId } = body;

    // Validate project exists and is active
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Project is not accepting funding' },
        { status: 400 }
      );
    }

    // Create contribution record
    const contribution = await prisma.contribution.create({
      data: {
        amount,
        user: {
          connect: { id: userId },
        },
        project: {
          connect: { id: params.id },
        },
      },
    });

    // Update project funding
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        currentFunding: {
          increment: amount,
        },
        status: project.currentFunding + amount >= project.fundingGoal ? 'FUNDED' : 'ACTIVE',
      },
    });

    return NextResponse.json({
      contribution,
      project: updatedProject,
    });
  } catch (error) {
    console.error('Error processing funding:', error);
    return NextResponse.json(
      { error: 'Failed to process funding' },
      { status: 500 }
    );
  }
} 