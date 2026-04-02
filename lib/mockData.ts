// Mock database with sample data
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  reports: number;
  rank: string;
  badges: string[];
  role: 'citizen' | 'worker' | 'admin';
  joinedDate: string;
}

export interface Report {
  id: string;
  userId: string;
  title: string;
  description: string;
  wasteType: 'plastic' | 'organic' | 'hazardous' | 'ewaste' | 'construction';
  severity: 'low' | 'medium' | 'high';
  latitude: number;
  longitude: number;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
  imageUrl?: string;
  createdAt: string;
  completedAt?: string;
  points: number;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  assignedReports: string[];
  completedReports: number;
  currentRoute?: string;
  status: 'available' | 'on-duty' | 'on-break';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  points: number;
  reports: number;
  badges: number;
}

// Sample users
export const mockUsers: Record<string, User> = {
  'user-1': {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    points: 4850,
    reports: 47,
    rank: 'Eco Champion',
    badges: ['first-report', 'eco-warrior', 'community-hero', 'clean-cities'],
    role: 'citizen',
    joinedDate: '2023-01-15',
  },
  'user-2': {
    id: 'user-2',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    points: 4320,
    reports: 42,
    rank: 'Eco Master',
    badges: ['first-report', 'eco-warrior', 'green-thumb'],
    role: 'citizen',
    joinedDate: '2023-03-22',
  },
  'user-3': {
    id: 'user-3',
    name: 'James Wilson',
    email: 'james@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    points: 3890,
    reports: 35,
    rank: 'Eco Guardian',
    badges: ['first-report', 'community-hero'],
    role: 'citizen',
    joinedDate: '2023-05-10',
  },
  'user-4': {
    id: 'user-4',
    name: 'Sarah Admin',
    email: 'admin@example.com',
    points: 0,
    reports: 0,
    rank: 'Administrator',
    badges: [],
    role: 'admin',
    joinedDate: '2022-01-01',
  },
  'user-5': {
    id: 'user-5',
    name: 'Mike Worker',
    email: 'mike@example.com',
    points: 1200,
    reports: 89,
    rank: 'Field Worker',
    badges: [],
    role: 'worker',
    joinedDate: '2023-02-01',
  },
};

// Sample reports
export const mockReports: Report[] = [
  {
    id: 'report-1',
    userId: 'user-1',
    title: 'Large plastic pile at Central Park',
    description: 'Found several bags of plastic waste near the main entrance',
    wasteType: 'plastic',
    severity: 'high',
    latitude: 40.7829,
    longitude: -73.9654,
    status: 'completed',
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=500&h=500&fit=crop',
    createdAt: '2024-03-10T10:30:00Z',
    completedAt: '2024-03-12T14:20:00Z',
    points: 150,
  },
  {
    id: 'report-2',
    userId: 'user-2',
    title: 'Electronic waste dumping site',
    description: 'Multiple old computers and electronics left behind',
    wasteType: 'ewaste',
    severity: 'high',
    latitude: 40.7580,
    longitude: -73.9855,
    status: 'in-progress',
    imageUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=500&h=500&fit=crop',
    createdAt: '2024-03-15T09:15:00Z',
    points: 200,
  },
  {
    id: 'report-3',
    userId: 'user-3',
    title: 'Organic waste decomposition issue',
    description: 'Food waste not properly disposed in residential area',
    wasteType: 'organic',
    severity: 'medium',
    latitude: 40.7505,
    longitude: -73.9934,
    status: 'assigned',
    createdAt: '2024-03-18T11:45:00Z',
    points: 100,
  },
  {
    id: 'report-4',
    userId: 'user-1',
    title: 'Hazardous material spill',
    description: 'Unknown chemical substance spilled near warehouse',
    wasteType: 'hazardous',
    severity: 'high',
    latitude: 40.7282,
    longitude: -73.7949,
    status: 'pending',
    createdAt: '2024-03-19T16:20:00Z',
    points: 250,
  },
  {
    id: 'report-5',
    userId: 'user-2',
    title: 'Construction debris scattered',
    description: 'Building materials left on sidewalk',
    wasteType: 'construction',
    severity: 'medium',
    latitude: 40.7614,
    longitude: -73.9776,
    status: 'pending',
    createdAt: '2024-03-20T13:30:00Z',
    points: 120,
  },
  {
    id: 'report-6',
    userId: 'user-3',
    title: 'Plastic bottles pile-up',
    description: 'Hundreds of plastic bottles in park trash area',
    wasteType: 'plastic',
    severity: 'high',
    latitude: 40.7489,
    longitude: -73.9680,
    status: 'completed',
    createdAt: '2024-03-12T08:00:00Z',
    completedAt: '2024-03-13T10:00:00Z',
    points: 180,
  },
];

// Leaderboard (cached from users)
export function generateLeaderboard(): LeaderboardEntry[] {
  return Object.values(mockUsers)
    .filter(u => u.role === 'citizen')
    .map((user, index) => ({
      rank: index + 1,
      userId: user.id,
      name: user.name,
      avatar: user.avatar,
      points: user.points,
      reports: user.reports,
      badges: user.badges.length,
    }))
    .sort((a, b) => b.points - a.points);
}

// Utility function to persist data (using localStorage simulation)
let localData = {
  users: { ...mockUsers },
  reports: [...mockReports],
};

export function getUser(id: string): User | null {
  return localData.users[id] || null;
}

export function getAllUsers(): User[] {
  return Object.values(localData.users);
}

export function updateUser(id: string, updates: Partial<User>): User {
  localData.users[id] = { ...localData.users[id], ...updates };
  return localData.users[id];
}

export function getReports(filter?: { userId?: string; status?: string }): Report[] {
  let reports = [...localData.reports];
  if (filter?.userId) reports = reports.filter(r => r.userId === filter.userId);
  if (filter?.status) reports = reports.filter(r => r.status === filter.status);
  return reports;
}

export function addReport(report: Report): Report {
  localData.reports.push(report);
  return report;
}

export function updateReport(id: string, updates: Partial<Report>): Report {
  const index = localData.reports.findIndex(r => r.id === id);
  localData.reports[index] = { ...localData.reports[index], ...updates };
  return localData.reports[index];
}

export function getReportsByRadius(lat: number, lng: number, radiusKm: number = 2): Report[] {
  const R = 6371; // Earth's radius in km
  
  return localData.reports.filter(report => {
    const dLat = ((report.latitude - lat) * Math.PI) / 180;
    const dLng = ((report.longitude - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((report.latitude * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance <= radiusKm;
  });
}
