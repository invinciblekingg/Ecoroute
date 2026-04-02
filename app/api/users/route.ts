import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, getUser } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('id');

  if (userId) {
    const user = getUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  }

  const users = getAllUsers();
  return NextResponse.json(users);
}
