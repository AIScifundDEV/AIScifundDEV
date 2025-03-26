import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ethers } from 'ethers';
import { RESEARCH_OUTPUT_NFT_ABI } from '@/lib/contracts';

export async function POST(
  request: Request,
  { params }: { params: { id: string; outputId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await request.json();
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid reward amount' },
        { status: 400 }
      );
    }

    const researchOutput = await prisma.researchOutput.findUnique({
      where: { id: params.outputId },
      include: {
        project: true,
        nft: true,
      },
    });

    if (!researchOutput) {
      return NextResponse.json(
        { error: 'Research output not found' },
        { status: 404 }
      );
    }

    if (researchOutput.project.researcherId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the researcher can distribute rewards' },
        { status: 403 }
      );
    }

    if (!researchOutput.nft) {
      return NextResponse.json(
        { error: 'NFT not found for this research output' },
        { status: 404 }
      );
    }

    // Initialize contract
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_RESEARCH_OUTPUT_NFT_ADDRESS!,
      RESEARCH_OUTPUT_NFT_ABI,
      provider
    );

    // Check if rewards have been distributed
    const output = await contract.getResearchOutput(researchOutput.nft.tokenId);
    if (output.rewardsDistributed) {
      return NextResponse.json(
        { error: 'Rewards have already been distributed' },
        { status: 400 }
      );
    }

    // Create reward distribution record
    const rewardDistribution = await prisma.rewardDistribution.create({
      data: {
        researchOutputId: researchOutput.id,
        amount,
        status: 'PENDING',
      },
    });

    return NextResponse.json(rewardDistribution);
  } catch (error) {
    console.error('Error distributing rewards:', error);
    return NextResponse.json(
      { error: 'Failed to distribute rewards' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string; outputId: string } }
) {
  try {
    const researchOutput = await prisma.researchOutput.findUnique({
      where: { id: params.outputId },
      include: {
        project: {
          include: {
            contributions: {
              include: {
                user: true,
              },
            },
          },
        },
        rewardDistributions: {
          include: {
            contributorRewards: {
              include: {
                contributor: true,
              },
            },
          },
        },
      },
    });

    if (!researchOutput) {
      return NextResponse.json(
        { error: 'Research output not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(researchOutput);
  } catch (error) {
    console.error('Error fetching reward distribution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reward distribution' },
      { status: 500 }
    );
  }
} 