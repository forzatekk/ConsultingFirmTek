import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const WHY = [
  'SAGE & Deloitte advisory expertise',
  'End-to-end project ownership',
  'Transparent pricing & timelines',
  'Dedicated post-launch support',
];

const CONTACT_INFO = [
  { Icon: Mail,    text: 'hello@tekksolutions.ca', href: 'mailto:hello@tekksolutions.ca' },
  { Icon: Phone,   text: '+1 (514) 000-0000',      href: 'tel:+15140000000' },
  { Icon: MapPin,  text: 'Montreal, QC, Canada',   href: '#' },
];

const EMPTY_FORM = { name: '', email: '', company: '', message: '' };

export default function Contact() {
  const ref       = useRef(null);
  const inView    = useInView(ref, { once: true, margin: '-80px' });
  const [form, setForm]           = useState(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // TODO: POST to Flask /contact endpoint with form data
    await new Promise((r) => setTimeout(r, 800)); // simulate network delay
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section id="contact" ref={ref} className="relative py-32 overflow-hidden">

      {/* Top neon divider */}
      <div className="neon-divider max-w-7xl mx-auto opacity-40 mb-0" />

      {/* Background accent */}
      <div
        className="absolute left-1/4 bottom-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7928ca, transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-6">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="section-badge justify-center mb-6"
          >
            <div className="w-1 h-4 bg-neon-blue rounded-full" />
            Contact
            <div className="w-1 h-4 bg-neon-blue rounded-full" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight"
          >
            Let&apos;s Build Something{' '}
            <span className="text-gradient">Exceptional</span>
          </motion.h2>
        </div>

        {/* ── Two-column layout ───────────────────────────────── */}
        <div className="grid lg:grid-cols-5 gap-10">

          {/* Form (3 / 5 columns) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div
              className="glass-card rounded-2xl p-8 md:p-10"
              style={{ boxShadow: '0 0 50px rgba(0,212,255,0.03), 0 25px 50px rgba(0,0,0,0.4)' }}
            >
              {submitted ? (
                /* ── Success state ── */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-14"
                >
                  <CheckCircle size={48} className="text-neon-blue mx-auto mb-5" />
                  <h3 className="text-2xl font-bold text-white mb-2">Message Received</h3>
                  <p className="text-slate-400">
                    We'll be in touch within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); }}
                    className="mt-6 text-sm text-neon-blue underline underline-offset-4"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                /* ── Contact form ── */
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Name + Email row */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500 mb-2">
                        Full Name <span className="text-neon-blue">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={set('name')}
                        placeholder="Jane Smith"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500 mb-2">
                        Email Address <span className="text-neon-blue">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={set('email')}
                        placeholder="jane@company.com"
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500 mb-2">
                      Company / Organisation
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={set('company')}
                      placeholder="Your organisation"
                      className="form-input"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold tracking-widest uppercase text-slate-500 mb-2">
                      Message <span className="text-neon-blue">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={set('message')}
                      placeholder="Tell us about your project or challenge…"
                      className="form-input resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="btn-primary w-full py-4 disabled:opacity-60"
                  >
                    {loading ? 'Sending…' : 'Send Message'}
                    {!loading && <Send size={15} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Sidebar (2 / 5 columns) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.35 }}
            className="lg:col-span-2 flex flex-col gap-5"
          >
            {/* Why TEKK card */}
            <div className="glass-card rounded-2xl p-7">
              <h3 className="text-base font-bold tracking-tight text-white mb-5">
                Why Choose TEKK?
              </h3>
              {WHY.map((item) => (
                <div key={item} className="flex items-start gap-3 mb-4 last:mb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-blue mt-1.5 flex-shrink-0" />
                  <span className="text-sm text-slate-400 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            {/* Contact details card */}
            <div className="glass-card rounded-2xl p-7 space-y-5">
              {CONTACT_INFO.map(({ Icon, text, href }) => (
                <a
                  key={text}
                  href={href}
                  className="flex items-center gap-4 group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(0,212,255,0.08)',
                      border:     '1px solid rgba(0,212,255,0.16)',
                    }}
                  >
                    <Icon size={15} className="text-neon-blue" />
                  </div>
                  <span className="text-sm text-slate-400 group-hover:text-white transition-colors duration-200">
                    {text}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Footer strip ────────────────────────────────────── */}
        <div className="mt-24 pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-600">
            © {new Date().getFullYear()} TEKK Solutions Inc. All rights reserved.
          </span>
          <span className="text-xs tracking-ultra uppercase text-slate-600">
            Business Systems &amp; Finance Consulting
          </span>
        </div>
      </div>
    </section>
  );
}
