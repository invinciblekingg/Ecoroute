'use client';

import { useEffect, useRef, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import gsap from 'gsap';
import { Trophy, Medal, Award, TrendingUp, Flame } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  reports: number;
  badges: number;
  streak: number;
  avatar: string;
}

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const entriesRef = useRef<HTMLDivElement>(null);

  const data: Record<'week' | 'month' | 'all', LeaderboardEntry[]> = {
    week: [
      { rank: 1, name: 'Sarah Mitchell', points: 950, reports: 12, badges: 5, streak: 7, avatar: '👩‍🎨' },
      { rank: 2, name: 'James Chen', points: 820, reports: 10, badges: 4, streak: 6, avatar: '👨‍💼' },
      { rank: 3, name: 'Maria Garcia', points: 750, reports: 9, badges: 3, streak: 5, avatar: '👩‍🌾' },
      { rank: 4, name: 'David Park', points: 680, reports: 8, badges: 3, streak: 4, avatar: '👨‍🔬' },
      { rank: 5, name: 'You (Alex)', points: 620, reports: 8, badges: 3, streak: 3, avatar: '🧑‍💼' },
      { rank: 6, name: 'Jessica Lee', points: 580, reports: 7, badges: 2, streak: 3, avatar: '👩‍⚕️' },
      { rank: 7, name: 'Michael Brown', points: 520, reports: 6, badges: 2, streak: 2, avatar: '👨‍🚒' },
      { rank: 8, name: 'Lisa Wong', points: 480, reports: 6, badges: 2, streak: 2, avatar: '👩‍🚀' },
    ],
    month: [
      { rank: 1, name: 'Sarah Mitchell', points: 2840, reports: 47, badges: 5, streak: 30, avatar: '👩‍🎨' },
      { rank: 2, name: 'James Chen', points: 2620, reports: 43, badges: 4, streak: 28, avatar: '👨‍💼' },
      { rank: 3, name: 'You (Alex)', points: 1240, reports: 24, badges: 3, streak: 15, avatar: '🧑‍💼' },
      { rank: 4, name: 'Maria Garcia', points: 1120, reports: 22, badges: 3, streak: 12, avatar: '👩‍🌾' },
      { rank: 5, name: 'David Park', points: 980, reports: 19, badges: 2, streak: 10, avatar: '👨‍🔬' },
      { rank: 6, name: 'Jessica Lee', points: 840, reports: 17, badges: 2, streak: 8, avatar: '👩‍⚕️' },
      { rank: 7, name: 'Michael Brown', points: 720, reports: 15, badges: 2, streak: 7, avatar: '👨‍🚒' },
      { rank: 8, name: 'Lisa Wong', points: 620, reports: 13, badges: 1, streak: 5, avatar: '👩‍🚀' },
    ],
    all: [
      { rank: 1, name: 'Sarah Mitchell', points: 8240, reports: 142, badges: 6, streak: 30, avatar: '👩‍🎨' },
      { rank: 2, name: 'James Chen', points: 7620, reports: 128, badges: 6, streak: 28, avatar: '👨‍💼' },
      { rank: 3, name: 'Maria Garcia', points: 5890, reports: 102, badges: 5, streak: 25, avatar: '👩‍🌾' },
      { rank: 4, name: 'David Park', points: 5340, reports: 96, badges: 5, streak: 22, avatar: '👨‍🔬' },
      { rank: 5, name: 'You (Alex)', points: 4850, reports: 85, badges: 4, streak: 15, avatar: '🧑‍💼' },
      { rank: 6, name: 'Jessica Lee', points: 4120, reports: 73, badges: 3, streak: 12, avatar: '👩‍⚕️' },
      { rank: 7, name: 'Michael Brown', points: 3540, reports: 65, badges: 3, streak: 10, avatar: '👨‍🚒' },
      { rank: 8, name: 'Lisa Wong', points: 3120, reports: 58, badges: 3, streak: 8, avatar: '👩‍🚀' },
    ],
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate entries
      const entries = entriesRef.current?.querySelectorAll('[data-entry]') || [];
      entries.forEach((entry, idx) => {
        gsap.fromTo(
          entry,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            delay: idx * 0.05,
            ease: 'power2.out',
          }
        );

        // Hover animation
        entry.addEventListener('mouseenter', () => {
          gsap.to(entry, { x: 10, duration: 0.3 });
        });
        entry.addEventListener('mouseleave', () => {
          gsap.to(entry, { x: 0, duration: 0.3 });
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [timeframe]);

  const currentData = data[timeframe];
  const userRank = currentData.find(u => u.name.includes('You'));

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
    return <Award className="w-5 h-5 text-foreground/40" />;
  };

  return (
    <AppLayout>
      <div ref={containerRef} className="min-h-screen py-8 px-4 bg-gradient-to-br from-background via-background to-accent/5">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold mb-2">Global Leaderboard</h1>
            <p className="text-foreground/70">Compete with waste reporters worldwide and earn rewards</p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-3 mb-8">
            {(['week', 'month', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  timeframe === tf
                    ? 'bg-primary text-white'
                    : 'bg-card border border-border hover:border-primary/50'
                }`}
              >
                {tf === 'week' ? 'This Week' : tf === 'month' ? 'This Month' : 'All Time'}
              </button>
            ))}
          </div>

          {/* Your Position */}
          {userRank && (
            <div className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border-2 border-primary/20 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{userRank.avatar}</div>
                  <div>
                    <p className="text-sm text-foreground/60 mb-1">Your Position</p>
                    <h3 className="font-heading text-2xl font-bold">
                      Rank #{userRank.rank}
                    </h3>
                    <p className="text-sm text-foreground/70">
                      {currentData[0].points - userRank.points} points to first place
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-sm text-foreground/60">Points</p>
                    <p className="text-3xl font-bold text-primary">{userRank.points}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-6 bg-muted/50 border-b border-border font-semibold text-sm text-foreground/70">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">User</div>
              <div className="col-span-2">Points</div>
              <div className="col-span-2">Reports</div>
              <div className="col-span-2">Streak</div>
              <div className="col-span-1">Badges</div>
            </div>

            {/* Table Body */}
            <div ref={entriesRef} className="divide-y divide-border">
              {currentData.map((entry) => (
                <div
                  key={entry.rank}
                  data-entry
                  onClick={() => setSelectedUser(entry)}
                  className={`grid grid-cols-12 gap-4 p-6 transition-all cursor-pointer ${
                    selectedUser?.rank === entry.rank
                      ? 'bg-primary/10 border-l-4 border-l-primary'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getMedalIcon(entry.rank)}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="text-2xl">{entry.avatar}</div>
                    <div>
                      <p className="font-semibold">{entry.name}</p>
                      <p className="text-sm text-foreground/60">
                        {entry.name.includes('You') && '(Your rank)'}
                      </p>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="col-span-2 flex items-center">
                    <div>
                      <p className="text-lg font-bold text-primary">{entry.points}</p>
                      <p className="text-xs text-foreground/60">points</p>
                    </div>
                  </div>

                  {/* Reports */}
                  <div className="col-span-2 flex items-center">
                    <div>
                      <p className="text-lg font-bold">{entry.reports}</p>
                      <p className="text-xs text-foreground/60">reports</p>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="col-span-2 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="font-bold">{entry.streak}</p>
                      <p className="text-xs text-foreground/60">days</p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="col-span-1 flex items-center">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <p className="font-bold">{entry.badges}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected User Details */}
          {selectedUser && (
            <div className="mt-8 bg-card rounded-xl border border-border p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedUser.avatar}</div>
                  <div>
                    <h3 className="font-heading text-2xl font-bold">{selectedUser.name}</h3>
                    <p className="text-foreground/70">Ranked #{selectedUser.rank}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-foreground/50 hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <p className="text-sm text-foreground/60 mb-2">Total Points</p>
                  <p className="text-3xl font-bold text-primary">{selectedUser.points}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                  <p className="text-sm text-foreground/60 mb-2">Reports</p>
                  <p className="text-3xl font-bold text-secondary">{selectedUser.reports}</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200">
                  <p className="text-sm text-foreground/60 mb-2">Current Streak</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-orange-600">{selectedUser.streak}</p>
                    <p className="text-sm text-orange-600">days</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-50 border border-yellow-200">
                  <p className="text-sm text-foreground/60 mb-2">Badges</p>
                  <p className="text-3xl font-bold text-yellow-600">{selectedUser.badges}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
