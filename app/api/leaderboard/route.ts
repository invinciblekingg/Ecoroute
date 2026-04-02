import { NextRequest, NextResponse } from 'next/server';
import { generateLeaderboard } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

  let leaderboard = generateLeaderboard();
  
  if (limit) {
    leaderboard = leaderboard.slice(0, limit);
  }

  return NextResponse.json(leaderboard);
}
