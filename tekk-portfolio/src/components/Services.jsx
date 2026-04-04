import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Server, BarChart3, Network, ArrowUpRight } from 'lucide-react';

const SERVICES = [
  {
    Icon:        Server,
    accent:      '#00d4ff',
    accentRgb:   '0,212,255',
    accentBg:    'rgba(0,212,255,0.07)',
    accentBorder:'rgba(0,212,255,0.14)',
    glowClass:   'card-glow-cyan',
    title:       'ERP Implementation\n& Strategy',
    description:
      'Full-lifecycle ERP deployments using SAGE and industry-leading platforms — from requirements analysis and data migration through to go-live and optimisation.',
    features: [
      'Requirements gathering & gap analysis',
      'SAGE 100 / 300 / X3 implementation',
      'Data migration & validation',
      'User training & change management',
      'Post-go-live performance tuning',
    ],
  },
  {
    Icon:        BarChart3,
    accent:      '#7928ca',
    accentRgb:   '121,40,202',
    accentBg:    'rgba(121,40,202,0.07)',
    accentBorder:'rgba(121,40,202,0.18)',
    glowClass:   'card-glow-purple',
    title:       'Financial Data\nAutomation',
    description:
      'Eliminate manual processes with intelligent automation built in PowerShell and Python, integrated directly into your financial workflows and reporting stack.',
    features: [
      'PowerShell & Python scripting',
      'ETL pipeline development',
      'Automated financial reporting',
      'API integrations with financial platforms',
      'Real-time dashboard development',
    ],
  },
  {
    Icon:        Network,
    accent:      '#06b6d4',
    accentRgb:   '6,182,212',
    accentBg:    'rgba(6,182,212,0.07)',
    accentBorder:'rgba(6,182,212,0.14)',
    glowClass:   'card-glow-teal',
    title:       'Systems Infrastructure\n& Scaling',
    description:
      'Design and deploy the technical backbone your growing enterprise needs — scalable, secure, and built for peak performance as your organisation expands.',
    features: [
      'Cloud infrastructure architecture',
      'System integration & middleware',
      'Security & compliance frameworks',
      'Performance optimisation',
      'Scalability planning & execution',
    ],
  },
];

export default function Services() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="services" ref={ref} className="relative py-32 overflow-hidden">

      {/* Top divider */}
      <div className="neon-divider max-w-7xl mx-auto opacity-40 mb-0" />

      {/* Cyan background accent */}
      <div
        className="absolute left-1/4 top-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-6">

        {/* ── Section header ──────────────────────────────────── */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="section-badge justify-center mb-6"
          >
            <div className="w-1 h-4 bg-neon-blue rounded-full" />
            What We Do
            <div className="w-1 h-4 bg-neon-blue rounded-full" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight"
          >
            Services Built for{' '}
            <span className="text-gradient">Enterprise Scale</span>
          </motion.h2>
        </div>

        {/* ── Cards grid ──────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map((svc, i) => {
            const { Icon } = svc;
            return (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 45 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.75, delay: 0.2 + i * 0.15 }}
                whileHover={{ y: -8 }}
                className={`group glass-card ${svc.glowClass} rounded-2xl p-8 relative overflow-hidden transition-all duration-500`}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(${svc.accentRgb},0.7), transparent)`,
                  }}
                />

                {/* Icon box */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-8"
                  style={{
                    background: svc.accentBg,
                    border: `1px solid ${svc.accentBorder}`,
                  }}
                >
                  <Icon size={24} style={{ color: svc.accent }} />
                </div>

                {/* Title — whitespace-pre-line to honour \n line breaks */}
                <h3
                  className="text-xl font-bold tracking-tight leading-snug mb-4 whitespace-pre-line"
                  style={{ color: svc.accent }}
                >
                  {svc.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                  {svc.description}
                </p>

                {/* Feature list */}
                <ul className="space-y-2.5 mb-9">
                  {svc.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                      <div
                        className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{ background: svc.accent }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Inline CTA */}
                <div
                  className="flex items-center gap-1.5 text-sm font-semibold tracking-wider transition-all duration-300 group-hover:gap-2.5"
                  style={{ color: svc.accent }}
                >
                  Explore Service
                  <ArrowUpRight size={13} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
