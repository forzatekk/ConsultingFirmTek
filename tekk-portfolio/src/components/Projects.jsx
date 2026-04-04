import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;

const PROJECTS = [
  {
    image:       `${BASE}images/project1.webp`,
    number:      '01',
    category:    'Systems Architecture',
    title:       'Systems & Software Architecture',
    description:
      'End-to-end architecture design for a Fortune 500 financial services firm, modernising legacy infrastructure into a cloud-native, event-driven platform with zero downtime migration.',
    tags: ['Architecture', 'Cloud', 'Migration'],
  },
  {
    image:       `${BASE}images/project2.webp`,
    number:      '02',
    category:    'Financial Analytics',
    title:       'Financial Analytics & Data Modeling',
    description:
      'Comprehensive financial data platform with real-time reporting, automated reconciliation pipelines, and predictive cash-flow modelling driving $120M in tracked assets.',
    tags: ['Python', 'PowerBI', 'SQL'],
  },
  {
    image:       `${BASE}images/project3.webp`,
    number:      '03',
    category:    'ERP Implementation',
    title:       'Strategic Implementation & Integration',
    description:
      'Full SAGE X3 rollout across 12 business units, reducing operational overhead by 40% and enabling real-time financial visibility for 300+ concurrent users.',
    tags: ['SAGE X3', 'ERP', 'Integration'],
  },
];

// Framer Motion variants shared across cards
const cardVariants = {
  rest:  { scale: 1 },
  hover: { scale: 1 },   // outer card doesn't scale — only the bg image does
};

const imgVariants = {
  rest:  { scale: 1 },
  hover: { scale: 1.07, transition: { duration: 0.6, ease: 'easeOut' } },
};

const overlayVariants = {
  rest:  { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.35 } },
};

const arrowVariants = {
  rest:  { opacity: 0, scale: 0.7, x: 8, y: -8 },
  hover: { opacity: 1, scale: 1,   x: 0, y: 0, transition: { duration: 0.3 } },
};

const descVariants = {
  rest:  { opacity: 0, y: 12 },
  hover: { opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.05 } },
};

export default function Projects() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="projects" ref={ref} className="relative py-32 overflow-hidden">

      {/* Cyan background accent */}
      <div
        className="absolute right-0 bottom-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-6">

        {/* ── Section header ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              className="section-badge mb-6"
            >
              <div className="w-1 h-4 bg-neon-blue rounded-full" />
              Selected Work
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight"
            >
              Proven Impact,
              <br />
              <span className="text-gradient">Measurable Results</span>
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="text-slate-400 max-w-xs text-sm leading-relaxed md:text-right flex-shrink-0"
          >
            A curated selection of enterprise engagements that define our standard
            of excellence.
          </motion.p>
        </div>

        {/* ── Project cards ──────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-6">
          {PROJECTS.map((p, i) => (
            <motion.div
              key={p.number}
              initial={{ opacity: 0, y: 45 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.15 }}
              variants={cardVariants}
              initial="rest"
              whileHover="hover"
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
              style={{ aspectRatio: '3/4' }}
            >
              {/* Background image */}
              <motion.div variants={imgVariants} className="absolute inset-0">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>

              {/* Static gradient overlay (always visible) */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/55 to-transparent" />

              {/* Hover colour tint */}
              <motion.div
                variants={overlayVariants}
                className="absolute inset-0"
                style={{ background: 'rgba(0,212,255,0.04)' }}
              />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-7">

                {/* Top: Number + arrow icon */}
                <div className="flex items-start justify-between">
                  <span className="text-5xl font-black text-gradient opacity-35 leading-none select-none">
                    {p.number}
                  </span>

                  {/* Arrow icon reveals on hover */}
                  <motion.div
                    variants={arrowVariants}
                    className="w-10 h-10 rounded-full glass-card border border-white/20 flex items-center justify-center"
                  >
                    <ArrowUpRight size={15} className="text-white" />
                  </motion.div>
                </div>

                {/* Bottom: Category, title, description, tags */}
                <div>
                  <div className="text-xs font-semibold tracking-ultra uppercase text-neon-blue mb-2.5">
                    {p.category}
                  </div>

                  <h3 className="text-xl font-bold text-white leading-snug mb-3">
                    {p.title}
                  </h3>

                  {/* Description slides up on hover */}
                  <motion.p
                    variants={descVariants}
                    className="text-slate-300 text-sm leading-relaxed mb-5"
                  >
                    {p.description}
                  </motion.p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-3 py-1 rounded-full"
                        style={{
                          background: 'rgba(0,212,255,0.09)',
                          border:     '1px solid rgba(0,212,255,0.22)',
                          color:      '#00d4ff',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
