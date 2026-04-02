import { NextRequest, NextResponse } from 'next/server';
import { getReports, addReport, updateReport, getReportsByRadius, Report } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius');

  if (lat && lng && radius) {
    const reports = getReportsByRadius(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius)
    );
    return NextResponse.json(reports);
  }

  const reports = getReports({
    userId: userId || undefined,
    status: status || undefined,
  });

  return NextResponse.json(reports);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const newReport: Report = {
    id: `report-${Date.now()}`,
    userId: body.userId,
    title: body.title,
    description: body.description,
    wasteType: body.wasteType,
    severity: body.severity,
    latitude: body.latitude,
    longitude: body.longitude,
    status: 'pending',
    imageUrl: body.imageUrl,
    createdAt: new Date().toISOString(),
    points: calculatePoints(body.severity, body.wasteType),
  };

  const report = addReport(newReport);
  return NextResponse.json(report, { status: 201 });
}

function calculatePoints(severity: string, wasteType: string): number {
  const severityPoints = {
    low: 50,
    medium: 100,
    high: 150,
  };
  
  const wasteBonus = {
    plastic: 20,
    organic: 15,
    hazardous: 80,
    ewaste: 100,
    construction: 30,
  };

  return (
    (severityPoints[severity as keyof typeof severityPoints] || 0) +
    (wasteBonus[wasteType as keyof typeof wasteBonus] || 0)
  );
}
