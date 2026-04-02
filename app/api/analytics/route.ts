import { NextRequest, NextResponse } from 'next/server';
import { getReports, getAllUsers } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const reports = getReports();
  const users = getAllUsers();

  const analytics = {
    totalReports: reports.length,
    completedReports: reports.filter(r => r.status === 'completed').length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    inProgressReports: reports.filter(r => r.status === 'in-progress').length,
    totalPoints: users.reduce((sum, u) => sum + u.points, 0),
    totalUsers: users.filter(u => u.role === 'citizen').length,
    reportsByType: {
      plastic: reports.filter(r => r.wasteType === 'plastic').length,
      organic: reports.filter(r => r.wasteType === 'organic').length,
      hazardous: reports.filter(r => r.wasteType === 'hazardous').length,
      ewaste: reports.filter(r => r.wasteType === 'ewaste').length,
      construction: reports.filter(r => r.wasteType === 'construction').length,
    },
    reportsBySeverity: {
      low: reports.filter(r => r.severity === 'low').length,
      medium: reports.filter(r => r.severity === 'medium').length,
      high: reports.filter(r => r.severity === 'high').length,
    },
    avgCompletionTime: calculateAvgCompletionTime(reports),
  };

  return NextResponse.json(analytics);
}

function calculateAvgCompletionTime(reports: any[]): number {
  const completedReports = reports.filter(r => r.completedAt);
  if (completedReports.length === 0) return 0;

  const times = completedReports.map(r => {
    const created = new Date(r.createdAt).getTime();
    const completed = new Date(r.completedAt).getTime();
    return (completed - created) / (1000 * 60 * 60); // in hours
  });

  return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
}
