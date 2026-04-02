'use client';

import { useEffect, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import gsap from 'gsap';
import { BarChart3, Truck, Users, AlertCircle, CheckCircle, TrendingUp, Activity, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const routesRef = useRef<(HTMLDivElement | null)[]>([]);

  const stats = [
    { label: 'Total Reports', value: '3,480', icon: AlertCircle, color: 'text-primary' },
    { label: 'Completed', value: '2,240', icon: CheckCircle, color: 'text-green-500' },
    { label: 'Active Routes', value: '24', icon: Truck, color: 'text-secondary' },
    { label: 'Workers Online', value: '156', icon: Users, color: 'text-accent' },
  ];

  const routes = [
    {
      id: 'ROUTE-001',
      zone: 'Downtown Zone A',
      status: 'In Progress',
      completion: 65,
      assignedTo: 'Team Alpha',
      points: 12,
    },
    {
      id: 'ROUTE-002',
      zone: 'Uptown Zone B',
      status: 'Assigned',
      completion: 0,
      assignedTo: 'Team Beta',
      points: 18,
    },
    {
      id: 'ROUTE-003',
      zone: 'East Park Zone',
      status: 'Completed',
      completion: 100,
      assignedTo: 'Team Gamma',
      points: 15,
    },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Header fade in
      gsap.fromTo(
        containerRef.current?.querySelector('header'),
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );

      // Stats cards
      cardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: 0.2 + index * 0.1,
            ease: 'back.out',
          }
        );

        // Pulse animation for values
        gsap.to(card.querySelector('.stat-value'), {
          scale: 1.05,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1,
        });
      });

      // Map animation
      gsap.fromTo(
        mapRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          delay: 0.5,
          ease: 'back.out',
        }
      );

      // Routes animation
      routesRef.current.forEach((route, index) => {
        if (!route) return;
        gsap.fromTo(
          route,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            delay: 0.6 + index * 0.1,
            ease: 'power2.out',
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <AppLayout>
      <div ref={containerRef} className="min-h-screen py-8 px-4 bg-gradient-to-br from-background via-background to-accent/5">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-foreground/70">Real-time operations management and analytics</p>
          </div>

          {/* Stats Grid */}
          <div ref={cardsRef} className="grid md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const colors = {
                'text-primary': 'from-primary to-primary/70',
                'text-green-500': 'from-green-500 to-green-600',
                'text-secondary': 'from-secondary to-secondary/70',
                'text-accent': 'from-accent to-accent/70',
              };
              const gradientColor = colors[stat.color as keyof typeof colors] || colors['text-primary'];

              return (
                <div
                  key={index}
                  ref={(el) => {
                    if (el) cardsRef.current[index] = el;
                  }}
                  data-stat-card
                  className={`p-6 rounded-xl bg-gradient-to-br ${gradientColor} text-white shadow-lg border border-white/10`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white/80 text-sm font-medium mb-1">{stat.label}</p>
                      <p className="stat-value text-3xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className="w-8 h-8 text-white/60" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid Layout */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Map Area */}
            <div
              ref={mapRef}
              className="lg:col-span-2 bg-gradient-to-br from-secondary/10 to-primary/10 border border-border rounded-xl p-8 h-96"
            >
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Live Operations Map</h3>
                  <p className="text-sm text-foreground/60">Real-time vehicle tracking and route visualization</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Efficiency Score</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">87%</p>
                  <p className="text-xs text-foreground/60 mt-2">↑ 5% from last week</p>
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-secondary" /> Response Time
                </h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-secondary">2.3h</p>
                  <p className="text-xs text-foreground/60 mt-2">Average completion</p>
                </div>
              </div>
            </div>
          </div>

          {/* Routes Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold">Active Routes</h2>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm font-medium">
                + Create Route
              </button>
            </div>

          <div className="space-y-3">
            {routes.map((route, index) => (
              <div
                key={route.id}
                ref={(el) => {
                  if (el) routesRef.current[index] = el;
                }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{route.zone}</h3>
                    <p className="text-sm text-foreground/60">{route.id}</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      route.status === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : route.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {route.status}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-foreground/60">Assigned To</p>
                    <p className="font-medium text-foreground">{route.assignedTo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60">Locations</p>
                    <p className="font-medium text-foreground">{route.points} points</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/60">Progress</p>
                    <p className="font-medium text-foreground">{route.completion}%</p>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      route.completion === 100
                        ? 'bg-green-500'
                        : route.completion > 0
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                    }`}
                    style={{ width: `${route.completion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* Analytics Section */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl border border-border p-8">
              <h3 className="text-lg font-bold text-foreground mb-6">Reports by Category</h3>
            <div className="space-y-4">
              {[
                { cat: 'Plastic', count: 1240, pct: 35 },
                { cat: 'Organic', count: 950, pct: 27 },
                { cat: 'E-waste', count: 680, pct: 20 },
                { cat: 'Hazardous', count: 610, pct: 18 },
              ].map((item) => (
                <div key={item.cat}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-foreground">{item.cat}</span>
                    <span className="text-foreground/60">{item.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-8">
              <h3 className="text-lg font-bold text-foreground mb-6">Completion Rate</h3>
              <div className="grid grid-cols-3 gap-4 text-center mb-8">
                <div>
                  <p className="text-2xl font-bold text-primary">64%</p>
                  <p className="text-xs text-foreground/60 mt-1">Today</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">72%</p>
                  <p className="text-xs text-foreground/60 mt-1">Week Avg</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">68%</p>
                  <p className="text-xs text-foreground/60 mt-1">Month Avg</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-foreground/60 mb-4">Trend</p>
                <div className="flex gap-1 justify-center">
                  {[55, 62, 58, 65, 71, 69, 72].map((val, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-muted rounded-sm"
                      style={{
                        height: `${val}px`,
                        backgroundColor: val > 65 ? 'rgb(34, 197, 94)' : 'rgb(56, 189, 248)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
