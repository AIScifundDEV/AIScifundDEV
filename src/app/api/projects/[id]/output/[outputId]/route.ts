import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string; outputId: string } }
) {
  try {
    const output = await prisma.researchOutput.findUnique({
      where: {
        id: params.outputId,
        projectId: params.id,
      },
      include: {
        researcher: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!output) {
      return NextResponse.json(
        { error: 'Research output not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(output);
  } catch (error) {
    console.error('Error fetching research output:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research output' },
      { status: 500 }
    );
  }
} 