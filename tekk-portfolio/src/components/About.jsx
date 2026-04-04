import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { CheckCircle, Award, Users, Clock, TrendingUp } from 'lucide-react';

const STATS = [
  { value: '15+', label: 'Years Experience' },
  { value: '200+', label: 'Projects Delivered' },
  { value: '98%', label: 'On-Time Delivery' },
  { value: '50+', label: 'Enterprise Clients' },
];

const CAPABILITIES = [
  'ERP Implementation (SAGE 100/300/X3)',
  'Business Systems Analysis & Design',
  'Financial Process Automation',
  'Deloitte Advisory Methodology',
  'Change Management & Training',
  'Post-Implementation Support',
];

export default function About() {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const slide = (dir, delay = 0) => ({
    initial:  { opacity: 0, x: dir === 'left' ? -50 : 50 },
    animate:  inView ? { opacity: 1, x: 0 } : {},
    transition: { duration: 0.9, ease: 'easeOut', delay },
  });

  return (
    <section id="about" ref={ref} className="relative py-32 overflow-hidden">

      {/* Purple background glow */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full blur-3xl opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7928ca, transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[5fr_7fr] gap-20 items-center">

          {/* ── LEFT: Visual panel ────────────────────────────── */}
          <motion.div {...slide('left')} className="relative">

            {/* Main panel — gradient placeholder (about-bg.webp is not yet in assets) */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, #0a1628 0%, #12082a 50%, #0a1628 100%)',
                }}
              />

              {/* Decorative grid overlay */}
              <div className="absolute inset-0 dot-grid opacity-20" />

              {/* Animated neon orb inside the panel */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-2xl"
                style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.35), transparent)' }}
              />

              {/* Icon centrepiece */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="glass-card rounded-3xl p-10"
                  style={{ boxShadow: '0 0 60px rgba(0,212,255,0.1)' }}
                >
                  <Users size={64} className="text-neon-blue opacity-80" />
                </div>
              </div>

              {/* Bottom fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />

              {/* Stats overlay strip */}
              <div
                className="absolute bottom-6 left-6 right-6 glass-card rounded-xl p-5"
                style={{ boxShadow: '0 0 30px rgba(0,0,0,0.4)' }}
              >
                <div className="grid grid-cols-2 gap-4">
                  {STATS.map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-xl font-black text-gradient">{s.value}</div>
                      <div className="text-xs tracking-wider text-slate-400 mt-0.5">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating "SAGE Certified" badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="absolute -top-5 -right-5 glass-card rounded-2xl p-5 border border-neon-blue/20"
              style={{ boxShadow: '0 0 35px rgba(0,212,255,0.12)' }}
            >
              <Award size={26} className="text-neon-blue mb-2" />
              <div className="text-xs font-bold tracking-widest text-white uppercase">SAGE</div>
              <div className="text-xs text-slate-400">Certified Partner</div>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Text content ───────────────────────────── */}
          <motion.div {...slide('right', 0.2)}>

            <div className="section-badge mb-6">
              <div className="w-1 h-4 bg-neon-blue rounded-full" />
              About Us
            </div>

            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-6">
              Trusted by Industry Leaders,{' '}
              <span className="text-gradient">Built for Results</span>
            </h2>

            <p className="text-slate-400 leading-relaxed text-lg mb-5">
              TEKK Solutions is a premier Business Systems and Finance consulting
              firm. We bring deep expertise in ERP implementations, working alongside
              SAGE and Deloitte methodologies to deliver transformative results for
              enterprise clients across North America.
            </p>

            <p className="text-slate-400 leading-relaxed mb-10">
              Our Business Systems Analysts and Finance Architects operate at the
              intersection of technology and strategy — designing systems that don't
              just function, but perform at the highest level while enabling strategic
              decision-making through real-time financial visibility.
            </p>

            {/* Capabilities checklist */}
            <div className="grid sm:grid-cols-2 gap-3">
              {CAPABILITIES.map((cap, i) => (
                <motion.div
                  key={cap}
                  initial={{ opacity: 0, x: 18 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.4 + i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle size={14} className="text-neon-blue flex-shrink-0" />
                  <span className="text-sm text-slate-300">{cap}</span>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="#contact"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary mt-10 w-fit"
            >
              Start a Conversation
            </motion.a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
