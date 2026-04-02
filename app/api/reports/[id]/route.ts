import { NextRequest, NextResponse } from 'next/server';
import { updateReport } from '@/lib/mockData';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const report = updateReport(id, body);
  return NextResponse.json(report);
}
