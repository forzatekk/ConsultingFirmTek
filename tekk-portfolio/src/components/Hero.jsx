import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

const BASE = import.meta.env.BASE_URL;

const STATS = [
  { value: '50+',  label: 'ERP Deployments' },
  { value: '$2B+', label: 'Assets Under Management' },
  { value: '99%',  label: 'Client Retention' },
];

export default function Hero() {
  const sectionRef = useRef(null);

  // Parallax: background drifts upward as the user scrolls down
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY    = useTransform(scrollYProgress, [0, 1], ['0%', '28%']);
  const fadeOp = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* ── Background image (parallax) ───────────────────────── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        {/* hero-backround.webp — note: intentional filename typo in source asset */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${BASE}images/hero-backround.webp')` }}
        />
        {/* Dark fill overlay */}
        <div className="absolute inset-0 bg-bg-primary/75" />
        {/* Bottom fade to section background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/30 to-bg-primary" />
        {/* Side vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/40 via-transparent to-bg-primary/40" />
      </motion.div>

      {/* ── Dot grid overlay ──────────────────────────────────── */}
      <div className="absolute inset-0 z-0 dot-grid opacity-[0.35]" />

      {/* ── Decorative neon orbs ─────────────────────────────── */}
      <div
        className="absolute top-1/3 left-[15%] w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #00d4ff, transparent)' }}
      />
      <div
        className="absolute bottom-1/3 right-[15%] w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, #7928ca, transparent)' }}
      />

      {/* ── Main content (fades out on scroll) ───────────────── */}
      <motion.div
        style={{ opacity: fadeOp }}
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        {/* Label badge */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <div className="h-px w-10 bg-neon-blue/60" />
          <span className="text-xs font-semibold tracking-ultra uppercase text-neon-blue">
            Enterprise Consulting
          </span>
          <div className="h-px w-10 bg-neon-blue/60" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-[1.06] mb-10"
        >
          Architecting{' '}
          <span className="text-gradient">Business&nbsp;Systems</span>
          <br />
          for the Future of{' '}
          <span className="text-gradient">Finance</span>
        </motion.h1>

        {/* Glassmorphism card wrapping subtext + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.62 }}
          className="glass-card rounded-2xl px-8 py-10 mx-auto max-w-3xl mb-14"
          style={{ boxShadow: '0 0 60px rgba(0,212,255,0.04), 0 25px 50px rgba(0,0,0,0.5)' }}
        >
          <p className="text-lg text-slate-300 leading-relaxed font-light mb-9">
            TEKK Solutions delivers enterprise-grade ERP implementations, financial
            data automation, and systems architecture — trusted by industry leaders.
            SAGE &amp; Deloitte advisory expertise, built for the future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              href="#projects"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
            >
              View Our Impact
              <ArrowUpRight
                size={15}
                className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </motion.a>

            <motion.a
              href="#about"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-ghost"
            >
              Our Approach
            </motion.a>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.95 }}
          className="flex flex-wrap items-center justify-center gap-12"
        >
          {STATS.map((s, i) => (
            <div key={s.label} className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="text-3xl font-black text-gradient"
              >
                {s.value}
              </motion.div>
              <div className="text-xs font-medium tracking-widest uppercase text-slate-500 mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-xs tracking-ultra uppercase text-slate-600">Scroll</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={13} className="text-slate-600" />
        </motion.div>
      </motion.div>
    </section>
  );
}
