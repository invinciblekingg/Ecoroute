'use client';

import { useEffect, useRef } from 'react';
import { AppLayout } from '@/components/AppLayout';
import gsap from 'gsap';
import { TrendingUp, Award, Target, Zap, MapPin, CheckCircle, Lock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate stat cards with counter
      const statCards = statsRef.current?.querySelectorAll('[data-stat-card]') || [];
      statCards.forEach((card, idx) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: idx * 0.1,
            ease: 'back.out',
          }
        );

        // Hover animation
        card.addEventListener('mouseenter', () => {
          gsap.to(card, { y: -5, duration: 0.3 });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { y: 0, duration: 0.3 });
        });
      });

      // Animate badges
      const badges = badgesRef.current?.querySelectorAll('[data-badge]') || [];
      badges.forEach((badge, idx) => {
        gsap.fromTo(
          badge,
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            delay: 0.3 + idx * 0.1,
            ease: 'back.out',
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const badges = [
    { id: 1, name: 'First Report', icon: '🎯', unlocked: true },
    { id: 2, name: 'Eco Warrior', icon: '♻️', unlocked: true },
    { id: 3, name: 'Community Hero', icon: '🦸', unlocked: true },
    { id: 4, name: 'Clean Cities', icon: '🏆', unlocked: false },
    { id: 5, name: 'Master Reporter', icon: '📊', unlocked: false },
    { id: 6, name: 'Impact Champion', icon: '🌍', unlocked: false },
  ];

  return (
    <AppLayout>
      <div ref={containerRef} className="min-h-screen py-8 px-4 bg-gradient-to-br from-background via-background to-accent/5">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="mb-12">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="font-heading text-4xl font-bold mb-2">Welcome Back, Alex!</h1>
                <p className="text-foreground/70">Track your waste reporting journey and earn rewards</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-foreground/60 mb-1">Current Rank</p>
                <p className="font-heading text-2xl font-bold text-primary">Eco Champion</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Level Progress</span>
                <span className="text-sm text-foreground/60">4,850 / 5,000 XP</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: '97%' }} />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div ref={statsRef} className="grid md:grid-cols-4 gap-4 mb-12">
            {[
              {
                icon: CheckCircle,
                label: 'Reports Submitted',
                value: '47',
                change: '+5 this month',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: TrendingUp,
                label: 'Total Points',
                value: '4,850',
                change: '+120 this week',
                color: 'from-primary to-primary/70',
              },
              {
                icon: Award,
                label: 'Badges Earned',
                value: '3',
                change: '3 more to unlock',
                color: 'from-yellow-500 to-yellow-600',
              },
              {
                icon: Target,
                label: 'Impact Score',
                value: '485 tons',
                change: 'Waste collected',
                color: 'from-green-500 to-green-600',
              },
            ].map(({ icon: Icon, label, value, change, color }, idx) => (
              <div
                key={idx}
                data-stat-card
                className={`p-6 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg border border-white/10`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">{label}</p>
                    <p className="text-3xl font-bold">{value}</p>
                  </div>
                  <Icon className="w-8 h-8 text-white/60" />
                </div>
                <p className="text-sm text-white/70">{change}</p>
              </div>
            ))}
          </div>

          {/* Recent Reports */}
          <div className="bg-card rounded-xl border border-border p-6 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold">Recent Reports</h2>
              <Link
                href="/report"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm font-medium"
              >
                + New Report
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { icon: '♻️', type: 'Plastic', severity: 'High', points: 180, status: 'Completed' },
                { icon: '⚠️', type: 'Hazardous', severity: 'High', points: 250, status: 'In Progress' },
                { icon: '🌿', type: 'Organic', severity: 'Medium', points: 120, status: 'Assigned' },
                { icon: '💻', type: 'E-Waste', severity: 'High', points: 200, status: 'Pending' },
              ].map((report, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-2xl">{report.icon}</span>
                    <div>
                      <p className="font-semibold">{report.type}</p>
                      <p className="text-sm text-foreground/60">{report.severity} Severity</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-foreground/60">Status</p>
                      <p className="font-semibold">{report.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground/60">Points</p>
                      <p className="font-bold text-primary">+{report.points}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges Section */}
          <div>
            <h2 className="font-heading text-2xl font-bold mb-6">Achievements & Badges</h2>
            <div
              ref={badgesRef}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  data-badge
                  className={`p-4 rounded-lg text-center transition-all ${
                    badge.unlocked
                      ? 'bg-gradient-to-br from-yellow-100 to-yellow-50 border border-yellow-200'
                      : 'bg-muted/50 border border-border opacity-60'
                  }`}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <p className="text-sm font-semibold mb-2">{badge.name}</p>
                  {!badge.unlocked && (
                    <div className="flex items-center justify-center gap-1 text-xs text-foreground/60">
                      <Lock size={12} /> Locked
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
