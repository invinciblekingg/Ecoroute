'use client';

import { useEffect, useRef, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import dynamic from 'next/dynamic';
import { MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import gsap from 'gsap';

const MapContainerComponent = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <div>Loading map...</div> }
);
const TileLayerComponent = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const MarkerComponent = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const PopupComponent = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface Report {
  id: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
  wasteType: string;
  severity: string;
  title: string;
  createdAt: string;
  points: number;
}

const statusColors = {
  pending: { color: '#EF4444', label: 'Pending', bg: 'from-red-100 to-red-50' },
  assigned: { color: '#F59E0B', label: 'Assigned', bg: 'from-yellow-100 to-yellow-50' },
  'in-progress': { color: '#3B82F6', label: 'In Progress', bg: 'from-blue-100 to-blue-50' },
  completed: { color: '#10B981', label: 'Completed', bg: 'from-green-100 to-green-50' },
};

const wasteTypeIcons = {
  plastic: '♻️',
  organic: '🌿',
  hazardous: '⚠️',
  ewaste: '💻',
  construction: '🏗️',
};

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch reports from API
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        setReports(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    if (containerRef.current && !isLoading) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }
      );
    }
  }, [isLoading]);

  useEffect(() => {
    if (panelRef.current && selectedReport) {
      gsap.fromTo(
        panelRef.current,
        { x: 400, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3 }
      );
    }
  }, [selectedReport]);

  const statsByStatus = {
    pending: reports.filter(r => r.status === 'pending').length,
    assigned: reports.filter(r => r.status === 'assigned').length,
    'in-progress': reports.filter(r => r.status === 'in-progress').length,
    completed: reports.filter(r => r.status === 'completed').length,
  };

  return (
    <AppLayout>
      <div ref={containerRef} className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-full md:w-80 bg-card border-r border-border flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <h1 className="font-heading text-2xl font-bold mb-2">Live Waste Map</h1>
            <p className="text-sm text-foreground/70">
              {reports.length} reports across {new Set(reports.map(r => r.wasteType)).size} waste types
            </p>
          </div>

          {/* Stats */}
          <div className="p-4 space-y-2">
            {(Object.entries(statusColors) as [string, typeof statusColors['pending']][]).map(([status, { label, color }]) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                className={`w-full p-3 rounded-lg text-left transition-all border-2 ${
                  selectedStatus === status
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="font-semibold">{label}</span>
                  </div>
                  <span className="text-sm font-bold px-2 py-1 rounded bg-foreground/10">
                    {statsByStatus[status as keyof typeof statsByStatus]}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Reports List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {reports
              .filter(r => !selectedStatus || r.status === selectedStatus)
              .map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full p-3 rounded-lg text-left transition-all border-2 ${
                    selectedReport?.id === report.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">
                      {wasteTypeIcons[report.wasteType as keyof typeof wasteTypeIcons]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{report.title}</p>
                      <p className="text-xs text-foreground/60">
                        {statusColors[report.status as keyof typeof statusColors].label}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Map Container - Hidden on mobile */}
        <div className="hidden md:flex flex-1 relative bg-gradient-to-br from-background to-background/50">
          {isLoading ? (
            <div className="flex items-center justify-center w-full">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4 mx-auto" />
                <p className="text-foreground/70">Loading map...</p>
              </div>
            </div>
          ) : (
            <>
              <MapContainerComponent
                center={[40.7128, -74.006]}
                zoom={12}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayerComponent
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {(selectedStatus ? reports.filter(r => r.status === selectedStatus) : reports).map((report) => {
                  const statusColor = statusColors[report.status as keyof typeof statusColors];
                  
                  return (
                    <MarkerComponent
                      key={report.id}
                      position={[report.latitude, report.longitude]}
                      eventHandlers={{
                        click: () => setSelectedReport(report),
                      }}
                    >
                      <PopupComponent>
                        <div className="p-2 min-w-48">
                          <p className="font-semibold mb-1">{report.title}</p>
                          <div className="text-xs space-y-1">
                            <p><span className="text-foreground/60">Status:</span> {statusColor.label}</p>
                            <p><span className="text-foreground/60">Points:</span> {report.points}</p>
                          </div>
                        </div>
                      </PopupComponent>
                    </MarkerComponent>
                  );
                })}
              </MapContainerComponent>

              {/* Detail Panel */}
              {selectedReport && (
                <div
                  ref={panelRef}
                  className="absolute bottom-6 right-6 w-80 bg-card rounded-xl border border-border shadow-xl p-6"
                >
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="absolute top-4 right-4 text-foreground/50 hover:text-foreground"
                  >
                    ✕
                  </button>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {wasteTypeIcons[selectedReport.wasteType as keyof typeof wasteTypeIcons]}
                        </span>
                        <h3 className="font-heading font-bold">{selectedReport.title}</h3>
                      </div>
                      <p className="text-sm text-foreground/70">
                        {new Date(selectedReport.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-accent" />
                        <span className="capitalize">{selectedReport.severity} Severity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedReport.status === 'completed' ? (
                          <>
                            <CheckCircle size={16} className="text-primary" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <>
                            <Clock size={16} className="text-secondary" />
                            <span className="capitalize">{selectedReport.status}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <span>
                          {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-semibold mb-2">Reward</p>
                      <p className="text-2xl font-bold text-primary">{selectedReport.points} Points</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
