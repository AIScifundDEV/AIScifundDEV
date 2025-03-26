import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort');

    // Build where clause
    const where: any = {};
    if (category && category !== 'all') {
      where.category = {
        name: category,
      };
    }
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'deadline':
        orderBy = { deadline: 'asc' };
        break;
      case 'funding':
        orderBy = { currentFunding: 'desc' };
        break;
      case 'goal':
        orderBy = { fundingGoal: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy,
      include: {
        researcher: {
          select: {
            name: true,
            institution: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        tags: true,
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      fundingGoal,
      deadline,
      researcherId,
      categoryId,
      tags,
      ipfsHash,
    } = body;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        fundingGoal,
        deadline,
        status: 'ACTIVE',
        currentFunding: 0,
        ipfsHash,
        researcher: {
          connect: { id: researcherId },
        },
        category: {
          connect: { id: categoryId },
        },
        tags: {
          set: tags,
        },
      },
      include: {
        researcher: {
          select: {
            name: true,
            institution: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        tags: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 