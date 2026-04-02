'use client';

import { useEffect, useRef, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import gsap from 'gsap';
import {
  MapPin,
  Navigation,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Route,
} from 'lucide-react';

interface Route {
  id: string;
  zone: string;
  stops: number;
  completed: number;
  distance: string;
  timeRemaining: string;
  status: 'active' | 'assigned' | 'completed';
}

export default function WorkerPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<HTMLDivElement>(null);
  const stopsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [currentRoute, setCurrentRoute] = useState<Route>({
    id: 'ROUTE-001',
    zone: 'Downtown Zone A',
    stops: 12,
    completed: 7,
    distance: '4.2 km',
    timeRemaining: '45 mins',
    status: 'active',
  });
  const [activeStop, setActiveStop] = useState(0);

  const stops = [
    { id: 1, location: '5th Avenue & 42nd St', address: '42nd Street', status: 'completed' },
    { id: 2, location: 'Times Square', address: 'Broadway', status: 'completed' },
    { id: 3, location: 'Central Park South', address: '59th Street', status: 'completed' },
    { id: 4, location: 'Park Avenue', address: '65th Street', status: 'completed' },
    { id: 5, location: 'Madison Avenue', address: '70th Street', status: 'completed' },
    { id: 6, location: 'Lexington Avenue', address: '75th Street', status: 'completed' },
    { id: 7, location: 'Third Avenue', address: '80th Street', status: 'completed' },
    { id: 8, location: 'Second Avenue', address: '85th Street', status: 'in-progress' },
    { id: 9, location: 'First Avenue', address: '90th Street', status: 'pending' },
    { id: 10, location: 'York Avenue', address: '95th Street', status: 'pending' },
    { id: 11, location: 'East End Avenue', address: '100th Street', status: 'pending' },
    { id: 12, location: 'FDR Drive', address: 'East Side', status: 'pending' },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        containerRef.current?.querySelector('header'),
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );

      // Main card
      gsap.fromTo(
        routeRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, delay: 0.2, ease: 'back.out' }
      );

      // Stops animation
      stopsRef.current.forEach((stop, index) => {
        if (!stop) return;
        gsap.fromTo(
          stop,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.4,
            delay: 0.3 + index * 0.05,
            ease: 'power2.out',
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCompleteStop = () => {
    if (activeStop < stops.length - 1) {
      gsap.fromTo(
        stopsRef.current[activeStop + 1],
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: 'back.out',
        }
      );
      setActiveStop(activeStop + 1);
    }
  };

  const completedStops = stops.filter((s) => s.status === 'completed').length;
  const progressPercent = (completedStops / stops.length) * 100;

  return (
    <AppLayout>
      <div ref={containerRef} className="min-h-screen py-8 px-4 bg-gradient-to-br from-background via-background to-accent/5">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold mb-2">Worker Panel</h1>
            <p className="text-foreground/70">Complete your assigned route efficiently</p>
          </div>

          {/* Current Route Card */}
          <div
            ref={routeRef}
            className="p-8 rounded-xl border-2 border-primary mb-8 bg-gradient-to-br from-primary/5 to-secondary/5"
          >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{currentRoute.zone}</h2>
              <p className="text-foreground/60">{currentRoute.id}</p>
            </div>
            <div
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                currentRoute.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {currentRoute.status === 'active' ? 'In Progress' : 'Assigned'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold text-foreground">Route Progress</p>
              <p className="text-sm text-foreground/60">
                {completedStops}/{stops.length} completed
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background rounded-lg p-4 border border-border">
                <p className="text-xs text-foreground/60 mb-1">Distance Remaining</p>
                <p className="text-xl font-bold text-foreground">{currentRoute.distance}</p>
              </div>
              <div className="bg-background rounded-lg p-4 border border-border">
                <p className="text-xs text-foreground/60 mb-1">Time Remaining</p>
                <p className="text-xl font-bold text-secondary">{currentRoute.timeRemaining}</p>
              </div>
              <div className="bg-background rounded-lg p-4 border border-border">
                <p className="text-xs text-foreground/60 mb-1">Stops Remaining</p>
                <p className="text-xl font-bold text-accent">
                  {stops.length - completedStops}
                </p>
              </div>
            </div>
          </div>

          {/* Current Stop */}
          {stops[activeStop] && (
            <div className="p-8 rounded-xl mb-8 border-2 border-secondary bg-gradient-to-br from-secondary/5 to-background">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-secondary" />
                  <p className="text-sm text-secondary font-semibold">Current Stop</p>
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  {stops[activeStop].location}
                </h3>
                <p className="text-foreground/60 mt-1">{stops[activeStop].address}</p>
              </div>
              <span className="text-lg font-bold text-primary">
                Stop {activeStop + 1} of {stops.length}
              </span>
            </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-all font-medium flex items-center justify-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Navigate
                </button>
                <button
                  onClick={handleCompleteStop}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Complete
                </button>
              </div>

            <div className="bg-background rounded-lg p-4 border border-border">
              <p className="text-sm text-foreground/60">Estimated time: 3-5 minutes</p>
              <p className="text-sm text-foreground/60 mt-2">
                ℹ️ Take a photo as proof of completion
              </p>
              </div>
            </div>
          )}

          {/* All Stops */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Route Stops
            </h3>

          <div className="space-y-2">
            {stops.map((stop, index) => (
              <div
                key={stop.id}
                ref={(el) => {
                  if (el) stopsRef.current[index] = el;
                }}
                onClick={() => setActiveStop(index)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  index === activeStop
                    ? 'border-secondary bg-secondary/10'
                    : stop.status === 'completed'
                      ? 'border-primary/50 bg-primary/5'
                      : stop.status === 'in-progress'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        stop.status === 'completed'
                          ? 'bg-primary text-white'
                          : stop.status === 'in-progress'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-muted text-foreground/60'
                      }`}
                    >
                      {stop.status === 'completed' ? '✓' : index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{stop.location}</p>
                      <p className="text-sm text-foreground/60">{stop.address}</p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      stop.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : stop.status === 'in-progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {stop.status === 'in-progress' ? 'Current' : stop.status}
                  </div>
                </div>
              </div>
              ))}
            </div>
          </div>

          {/* Route Summary */}
          <div className="mt-8 p-6 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Route Summary</h4>
              <p className="text-sm text-foreground/60">
                You&apos;re doing great! Keep up the pace to finish ahead of schedule.
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{progressPercent.toFixed(0)}%</p>
              <p className="text-xs text-foreground/60">Complete</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
