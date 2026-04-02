'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Leaf,
  Zap,
  Map,
  Users,
  TrendingUp,
  Shield,
  Heart,
  Eye,
  MapPin,
  CheckCircle,
  Award,
  Sparkles,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaContainerRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresContainerRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Hero Title - Split letter animation
      const titleChars = heroTitleRef.current?.textContent?.split('') || [];
      if (heroTitleRef.current && titleChars.length > 0) {
        heroTitleRef.current.textContent = '';
        titleChars.forEach((char) => {
          const span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.className = 'inline-block';
          heroTitleRef.current?.appendChild(span);
        });

        gsap.fromTo(
          heroTitleRef.current?.querySelectorAll('span') || [],
          { opacity: 0, y: 30, rotationX: -90 },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: 'back.out',
            perspective: 1000,
          }
        );
      }

      // Hero Subtitle fade & slide
      gsap.fromTo(
        heroSubtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' }
      );

      // CTA Buttons stagger
      gsap.fromTo(
        ctaContainerRef.current?.querySelectorAll('a') || [],
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          delay: 0.5,
          ease: 'back.out',
        }
      );

      // Floating elements - continuous animation
      const floatingItems = floatingElementsRef.current?.querySelectorAll('[data-float]') || [];
      floatingItems.forEach((item, index) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 50, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: 0.6 + index * 0.1,
            ease: 'back.out',
          }
        );

        // Infinite floating animation
        gsap.to(item, {
          y: -20 + Math.random() * 40,
          duration: 4 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.2,
        });
      });

      // Stats counter animation on scroll
      const statsElements = statsRef.current?.querySelectorAll('[data-stat-value]') || [];
      statsElements.forEach((element) => {
        const finalValue = parseInt(element.getAttribute('data-stat-value') || '0');
        if (finalValue === 0) return;

        gsap.from(element, {
          textContent: 0,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top center',
          },
          onUpdate: function () {
            element.textContent = Math.floor(
              (this.progress() * finalValue) as any
            ).toString();
          },
        });
      });

      // Feature cards stagger on scroll
      const featureCards = featuresContainerRef.current?.querySelectorAll('[data-feature-card]') || [];
      gsap.fromTo(
        featureCards,
        { opacity: 0, y: 50, rotateY: -10 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresContainerRef.current,
            start: 'top center+=100',
          },
        }
      );

      // Hover animations for feature cards
      featureCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -10,
            boxShadow: '0 20px 40px rgba(34, 197, 94, 0.2)',
            duration: 0.3,
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            duration: 0.3,
          });
        });
      });

      // Testimonials scroll animation
      const testimonialItems = testimonialsRef.current?.querySelectorAll('[data-testimonial]') || [];
      gsap.fromTo(
        testimonialItems,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: 'top center+=100',
          },
        }
      );

      // Parallax background
      gsap.to('.parallax-bg', {
        y: (i, target) => -window.innerHeight * 0.5,
        scrollTrigger: {
          trigger: containerRef.current,
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full overflow-x-hidden bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading text-xl font-bold hidden sm:inline">EcoRoute</span>
          </Link>
          <div className="hidden md:flex gap-8">
            {['Features', 'Benefits', 'Community'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-foreground/70 hover:text-primary transition-colors font-medium"
              >
                {item}
              </a>
            ))}
          </div>
          <Link
            href="/report"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-20 pb-20 px-4 overflow-hidden flex items-center justify-center">
        {/* Animated background */}
        <div className="parallax-bg absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit">
                <Sparkles size={16} className="text-primary" />
                <span className="text-sm font-medium text-primary">Welcome to the Future</span>
              </div>

              <h1
                ref={heroTitleRef}
                className="font-heading text-5xl md:text-7xl font-bold leading-tight text-balance"
              >
                Smart Waste Management for Modern Cities
              </h1>

              <p
                ref={heroSubtitleRef}
                className="text-xl text-foreground/70 leading-relaxed max-w-xl"
              >
                Report waste with AI-powered classification, earn rewards, and join a global community making cities cleaner. One report at a time.
              </p>

              <div
                ref={ctaContainerRef}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link
                  href="/report"
                  className="px-8 py-4 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:bg-primary/90 transition-all"
                >
                  Report Waste Now <ArrowRight size={20} />
                </Link>
                <Link
                  href="/map"
                  className="px-8 py-4 bg-card border border-border text-foreground rounded-xl font-semibold hover:border-primary/50 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Eye size={20} /> View Live Map
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                {[
                  { num: '12K+', label: 'Reports' },
                  { num: '850+', label: 'Areas Cleaned' },
                  { num: '45+', label: 'Cities' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-primary">{stat.num}</p>
                    <p className="text-sm text-foreground/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Floating Visual */}
            <div ref={floatingElementsRef} className="relative h-96 md:h-[500px] hidden md:flex items-center justify-center">
              {/* Main circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-2xl" />
              </div>

              {/* Floating cards */}
              <div
                data-float
                className="absolute top-10 left-10 p-6 bg-white rounded-2xl shadow-xl border border-border/50 backdrop-blur-sm w-56"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin size={20} className="text-primary" />
                  </div>
                  <span className="font-semibold">Location Pinned</span>
                </div>
                <p className="text-sm text-foreground/70">GPS-powered waste reporting</p>
              </div>

              <div
                data-float
                className="absolute bottom-20 right-0 p-6 bg-white rounded-2xl shadow-xl border border-border/50 backdrop-blur-sm w-56"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Award size={20} className="text-accent" />
                  </div>
                  <span className="font-semibold">Earn Rewards</span>
                </div>
                <p className="text-sm text-foreground/70">Get points and badges instantly</p>
              </div>

              <div
                data-float
                className="absolute top-1/2 right-10 p-6 bg-white rounded-2xl shadow-xl border border-border/50 backdrop-blur-sm w-56"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <CheckCircle size={20} className="text-secondary" />
                  </div>
                  <span className="font-semibold">Track Impact</span>
                </div>
                <p className="text-sm text-foreground/70">See your environmental impact</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="py-20 px-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-y border-border"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: CheckCircle, label: 'Reports Completed', value: 2847 },
            { icon: Users, label: 'Active Members', value: 12500 },
            { icon: TrendingUp, label: 'Tons Collected', value: 487 },
            { icon: Globe, label: 'Cities Covered', value: 45 },
          ].map(({ icon: Icon, label, value }, idx) => (
            <div
              key={idx}
              className="text-center p-6 rounded-xl bg-background/50 hover:bg-background transition-colors"
            >
              <Icon className="w-10 h-10 text-primary mx-auto mb-3" />
              <p className="text-4xl font-bold text-foreground mb-2">
                <span data-stat-value={value}>0</span>
                {value > 100 && value < 10000 ? '+' : value > 100 ? '+' : ''}
              </p>
              <p className="text-foreground/60 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              Powerful Features for Impact
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Everything you need to report waste and make a real difference in your community
            </p>
          </div>

          <div
            ref={featuresContainerRef}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Zap,
                title: 'AI Image Recognition',
                description: 'Automatic waste type detection with advanced image analysis',
              },
              {
                icon: Map,
                title: 'Live GPS Mapping',
                description: 'Real-time location tracking and interactive waste maps',
              },
              {
                icon: TrendingUp,
                title: 'Earn Points & Badges',
                description: 'Get rewarded for each report with unlockable achievements',
              },
              {
                icon: Users,
                title: 'Community Leaderboard',
                description: 'Compete and collaborate with eco-warriors worldwide',
              },
              {
                icon: Shield,
                title: 'Smart Worker Routes',
                description: 'Optimized collection paths for maximum efficiency',
              },
              {
                icon: Heart,
                title: 'Track Your Impact',
                description: 'See how your reports help clean the environment',
              },
            ].map(({ icon: Icon, title, description }, idx) => (
              <div
                key={idx}
                data-feature-card
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{title}</h3>
                <p className="text-foreground/70 text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="benefits" className="py-24 px-4 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-center mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Report', desc: 'Tap a location and report waste' },
              { num: '02', title: 'Capture', desc: 'Upload photo for AI analysis' },
              { num: '03', title: 'Assign', desc: 'Workers get optimized routes' },
              { num: '04', title: 'Earn', desc: 'Collect points and achievements' },
            ].map(({ num, title, desc }, idx) => (
              <div
                key={idx}
                className="relative text-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="text-5xl font-bold text-primary/20 mb-4">{num}</div>
                <h3 className="font-heading font-bold text-lg mb-2">{title}</h3>
                <p className="text-foreground/70 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            Join a Global Movement
          </h2>
          <p className="text-xl text-foreground/70 mb-12 max-w-2xl mx-auto">
            Thousands of citizens are already making a difference. Be part of the solution and help build cleaner, smarter cities.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { emoji: '🌍', title: 'Global Impact', desc: 'Reporting from 45+ countries' },
              { emoji: '👥', title: 'Community Driven', desc: 'Powered by citizen scientists' },
              { emoji: '🎯', title: 'Real Results', desc: 'Over 487 tons collected' },
            ].map(({ emoji, title, desc }, idx) => (
              <div key={idx} className="p-6">
                <div className="text-5xl mb-4">{emoji}</div>
                <h3 className="font-heading font-bold text-lg mb-2">{title}</h3>
                <p className="text-foreground/70">{desc}</p>
              </div>
            ))}
          </div>

          <Link
            href="/report"
            className="inline-flex px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:shadow-lg hover:bg-primary/90 transition-all gap-2"
          >
            Start Your Journey <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto text-center text-foreground/70">
          <p className="font-medium">
            EcoRoute AI - Making cities cleaner, one report at a time.
          </p>
          <p className="text-sm mt-4">© 2024 EcoRoute. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Import additional icon used
import { Globe } from 'lucide-react';
