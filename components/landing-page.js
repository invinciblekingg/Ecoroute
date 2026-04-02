"use client";

import { useState } from "react";
import DemoModal from "./demo-modal";
import ReportModal from "./report-modal";
import Navbar from "./navbar";
import Reveal from "./reveal";
import {
  dashboardPanels,
  footerLinks,
  heroStats,
  impactCards,
  liveActivity,
  moduleLibrary,
  testimonials,
  workflowSteps,
} from "../lib/site-data";

function ModuleIcon({ name }) {
  if (name === "report") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3C8 6.1 5.5 9.4 5.5 13c0 4 3 7 6.5 7s6.5-3 6.5-7c0-3.6-2.5-6.9-6.5-10Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 10v4M10 12h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "ai") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="5" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 12h2M14 12h2M9 16c1.2 1 4.8 1 6 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "route") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 17c4 0 4-10 8-10s4 10 8 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="6" cy="17" r="1.8" fill="currentColor" />
        <circle cx="12" cy="7" r="1.8" fill="currentColor" />
        <circle cx="18" cy="17" r="1.8" fill="currentColor" />
      </svg>
    );
  }

  if (name === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 16h8M8 12h4M8 8h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "worker") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="7" y="3" width="10" height="18" rx="4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M10 7h4M9 16h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "reward") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4l2.5 4 4.5.7-3.2 3.1.8 4.5L12 14.8 7.4 16.3l.8-4.5L5 8.7 9.5 8 12 4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  return <span aria-hidden="true">*</span>;
}

function MetricStrip() {
  return (
    <Reveal>
      <div className="stat-grid">
        {heroStats.map((item) => (
          <article className="stat-card" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </div>
    </Reveal>
  );
}

function LiveMarquee() {
  const items = [...liveActivity, ...liveActivity];

  return (
    <div className="live-strip">
      <div className="live-strip-head">
        <span className="eyebrow">Live activity</span>
        <strong>Signals moving through the system right now</strong>
      </div>
      <div className="live-marquee" aria-label="Live activity feed">
        <div className="live-track">
          {items.map((item, index) => (
            <article className="live-card" key={`${item.title}-${index}`}>
              <span>{item.time}</span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ module }) {
  return (
    <article className="module-card">
      <div className="module-card-top">
        <div className="module-icon" style={{ background: module.iconBg, color: module.iconColor }}>
          <ModuleIcon name={module.icon} />
        </div>
        <span className="chip">Core module</span>
      </div>
      <h3>{module.name}</h3>
      <p>{module.desc}</p>
      <ul>
        {module.featureList.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </article>
  );
}

function WorkflowCard({ step }) {
  return (
    <article className="workflow-card">
      <div className="step-num">0{step.step}</div>
      <h3>{step.title}</h3>
      <p>{step.copy}</p>
    </article>
  );
}

export default function LandingPage() {
  const [pilotOpen, setPilotOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <Navbar onOpenDemo={() => setPilotOpen(true)} />
      <DemoModal open={pilotOpen} onClose={() => setPilotOpen(false)} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />

      <main className="eco-shell">
        <section className="hero-section" id="overview">
          <Reveal className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow hero-eyebrow">Citizen-powered waste intelligence</div>
              <h1>
                Smarter waste.
                <span className="accent-text"> Cleaner cities.</span>
              </h1>
              <p className="hero-text">
                EcoRoute AI turns garbage reports into prioritized pickups, optimized routes, and public
                accountability. It is designed as a full civic operations experience, not just a map.
              </p>
              <div className="hero-actions">
                <button type="button" className="primary-button" onClick={() => setReportOpen(true)}>
                  Report waste
                </button>
                <a className="secondary-button" href="#modules">
                  Explore modules
                </a>
              </div>
              <div className="chip-row">
                <span>Map-first reporting</span>
                <span>AI triage</span>
                <span>Route optimization</span>
                <span>Worker panel</span>
              </div>
            </div>

            <div className="hero-panel">
              <div className="map-stage">
                <div className="map-grid" aria-hidden="true" />
                <div className="map-road road-a" aria-hidden="true" />
                <div className="map-road road-b" aria-hidden="true" />
                <div className="map-pin pin-urgent" aria-hidden="true" />
                <div className="map-pin pin-medium" aria-hidden="true" />
                <div className="map-pin pin-resolved" aria-hidden="true" />

                <div className="map-float card-a">
                  <span>Pending reports</span>
                  <strong>18 live</strong>
                </div>
                <div className="map-float card-b">
                  <span>Route efficiency</span>
                  <strong>+28%</strong>
                </div>
                <div className="map-float card-c">
                  <span>Cleanup ETA</span>
                  <strong>14 min</strong>
                </div>
              </div>

              <div className="hero-notes">
                <article>
                  <span>Urgent</span>
                  <strong>Hazardous spill near the market</strong>
                  <p>AI routed it straight to the top of the queue.</p>
                </article>
                <article>
                  <span>Resolved</span>
                  <strong>Park-side pickup complete</strong>
                  <p>Public status updated and rewards issued.</p>
                </article>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="section-block">
          <LiveMarquee />
        </section>

        <section className="section-block">
          <MetricStrip />
        </section>

        <section id="modules" className="section-block">
          <Reveal className="section-heading">
            <span className="eyebrow">Core modules</span>
            <h2>Built like an operating system for city cleanup</h2>
            <p>
              Each module handles one part of the loop, from reporting to routing to public transparency.
            </p>
          </Reveal>

          <div className="module-grid">
            {moduleLibrary.map((module, index) => (
              <Reveal key={module.id} delay={index * 60}>
                <ModuleCard module={module} />
              </Reveal>
            ))}
          </div>
        </section>

        <section id="operations" className="section-block split-surface">
          <Reveal className="section-heading">
            <span className="eyebrow">Operations</span>
            <h2>From report to pickup, the workflow stays visible</h2>
            <p>
              Dispatchers see the queue, crews see the route, and citizens see the status. No part of the chain
              disappears into a black box.
            </p>
          </Reveal>

          <div className="workflow-grid">
            {workflowSteps.map((step, index) => (
              <Reveal key={step.step} delay={index * 70}>
                <WorkflowCard step={step} />
              </Reveal>
            ))}
          </div>

          <div className="dashboard-shell">
            <div className="dashboard-map">
              <div className="dashboard-map-top">
                <span className="eyebrow">Live city map</span>
                <strong>Dispatch board</strong>
              </div>
              <div className="dashboard-map-canvas">
                <div className="dashboard-route" />
                <div className="dashboard-marker urgent" />
                <div className="dashboard-marker medium" />
                <div className="dashboard-marker resolved" />
              </div>
            </div>

            <div className="dashboard-panels">
              {dashboardPanels.map((panel) => (
                <article className="mini-panel" key={panel.title}>
                  <strong>{panel.title}</strong>
                  <p>{panel.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="impact" className="section-block">
          <Reveal className="section-heading">
            <span className="eyebrow">Impact</span>
            <h2>Designed to earn trust, not just clicks</h2>
            <p>
              Predictive analytics, transparency, and gamification combine into one civic loop that feels
              measurable and real.
            </p>
          </Reveal>

          <div className="impact-grid">
            {impactCards.map((card, index) => (
              <Reveal key={card.title} delay={index * 70}>
                <article className="impact-card">
                  <strong>{card.title}</strong>
                  <p>{card.copy}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="testimonial-grid">
            {testimonials.map((item, index) => (
              <Reveal key={item.author} delay={index * 60}>
                <blockquote className="testimonial-card">
                  <p>{item.quote}</p>
                  <footer>
                    <strong>{item.author}</strong>
                    <span>{item.role}</span>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="pilot" className="section-block">
          <Reveal>
            <div className="cta-banner">
              <div>
                <span className="eyebrow">Pilot ready</span>
                <h3>Make the map the hero of the product demo.</h3>
                <p>
                  We can keep this polished as a landing site, or later expand it into a fuller repo with
                  backend flows, admin tools, and AI logic.
                </p>
              </div>
              <button type="button" className="primary-button" onClick={() => setPilotOpen(true)}>
                Request a pilot
              </button>
            </div>
          </Reveal>
        </section>

        <footer id="footer" className="site-footer">
          <div className="footer-grid">
            <div>
              <div className="brand footer-brand">
                <span className="brand-mark">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C8 5 5.5 8.6 5.5 12.2C5.5 17 9 21 12 21C15 21 18.5 17 18.5 12.2C18.5 8.6 16 5 12 2Z" fill="currentColor" />
                  </svg>
                </span>
                <span>EcoRoute AI</span>
              </div>
              <p>Citizen-powered waste management with AI routing, live transparency, and clean civic UX.</p>
            </div>

            <div className="footer-links">
              {footerLinks.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
