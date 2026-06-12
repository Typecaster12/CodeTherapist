import { Link } from 'react-router-dom';
import { Terminal, BrainCircuit, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionLink = motion.create(Link);

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
  }
};

const pillVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 } 
  }
};

export default function Home() {
  const categories = [
    "Syntax Error", "Logic Error", "Conceptual Gap", "Architecture Issue", 
    "Tooling Problem", "Debugging Skill Gap", "Overengineering", "Burnout"
  ];

  return (
    <div className="flex flex-col gap-24 py-12">
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="text-center max-w-3xl mx-auto space-y-6"
      >
        <motion.div 
          variants={fadeInUp}
          className="inline-block px-3 py-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[11px] font-medium text-[var(--text-secondary)] mb-4 shadow-sm"
        >
          Code Therapist v1.0
        </motion.div>
        
        <motion.h1 
          variants={fadeInUp}
          className="text-[32px] md:text-[48px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]"
        >
          Developers know they are stuck.<br/>
          <span className="text-[var(--text-secondary)]">We tell them why.</span>
        </motion.h1>
        
        <motion.p 
          variants={fadeInUp}
          className="text-[14px] leading-relaxed text-[var(--text-secondary)] max-w-2xl mx-auto"
        >
          Existing tools give you code fixes. We give you a diagnosis. Stop treating the symptoms and start understanding the root cause of your struggle.
        </motion.p>
        
        <motion.div variants={fadeInUp} className="pt-4">
          <MotionLink 
            to="/diagnose" 
            className="inline-flex items-center gap-2 h-9 px-6 rounded-md bg-[var(--text-primary)] text-[var(--bg-void)] font-medium text-[13px] shadow-[0_0_12px_var(--accent-glow)] transition-colors hover:bg-neutral-200"
            whileHover={{ 
              scale: 1.02, 
              boxShadow: "0 0 20px rgba(255, 255, 255, 0.12)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            Start Diagnosis <ArrowRight className="w-4 h-4" />
          </MotionLink>
        </motion.div>
      </motion.section>

      {/* How It Works */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="space-y-12"
      >
        <motion.div variants={fadeInUp} className="text-center">
          <h2 className="text-[18px] font-medium text-[var(--text-primary)]">How It Works</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mt-2">A surgical approach to debugging.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -5, borderColor: 'var(--border-muted)', backgroundColor: 'var(--bg-surface-elevated)' }}
            className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t-[1px] border-t-white/[0.03] space-y-4 shadow-sm transition-colors duration-200 cursor-default"
          >
            <div className="w-8 h-8 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
              <Terminal className="w-4 h-4 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-[14px] font-medium text-[var(--text-primary)]">1. Input Context</h3>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
              Share your error, code snippet, and emotional state. We look at the whole picture, not just the stack trace.
            </p>
          </motion.div>
          
          {/* Card 2 */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -5, borderColor: 'var(--border-muted)', backgroundColor: 'var(--bg-surface-elevated)' }}
            className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t-[1px] border-t-white/[0.03] space-y-4 shadow-sm transition-colors duration-200 cursor-default"
          >
            <div className="w-8 h-8 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-[14px] font-medium text-[var(--text-primary)]">2. Semantic Diagnosis</h3>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
              Our engine classifies your struggle against 8 psychological and technical archetypes using vector search.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ y: -5, borderColor: 'var(--border-muted)', backgroundColor: 'var(--bg-surface-elevated)' }}
            className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t-[1px] border-t-white/[0.03] space-y-4 shadow-sm transition-colors duration-200 cursor-default"
          >
            <div className="w-8 h-8 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
              <Activity className="w-4 h-4 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-[14px] font-medium text-[var(--text-primary)]">3. Targeted Prescription</h3>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
              Receive a 4-part plan: Why you're stuck, an immediate fix, what to study, and how to prevent it.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Difference Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="p-8 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] border-t-[1px] border-t-white/[0.03] shadow-sm relative overflow-hidden group"
      >
        <div className="absolute inset-0 border border-white/[0.01] rounded-lg group-hover:border-white/[0.04] transition-colors duration-500 pointer-events-none" />
        
        <h2 className="text-[18px] font-medium text-[var(--text-primary)] mb-8 text-center">What Makes It Different</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h3 className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Traditional Tools</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-[13px] text-[var(--text-secondary)]"><div className="mt-0.5 text-[var(--border-muted)] font-mono">×</div> Give you raw code to copy-paste</li>
              <li className="flex gap-3 text-[13px] text-[var(--text-secondary)]"><div className="mt-0.5 text-[var(--border-muted)] font-mono">×</div> Assume all bugs are logic errors</li>
              <li className="flex gap-3 text-[13px] text-[var(--text-secondary)]"><div className="mt-0.5 text-[var(--border-muted)] font-mono">×</div> You learn nothing, repeat the same mistake</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-[11px] text-[var(--text-primary)] uppercase tracking-wider font-medium">Code Therapist</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-[13px] text-[var(--text-primary)]"><CheckCircle2 className="w-4 h-4 mt-0.5 text-[var(--text-secondary)] text-white" /> Diagnoses the human behind the keyboard</li>
              <li className="flex gap-3 text-[13px] text-[var(--text-primary)]"><CheckCircle2 className="w-4 h-4 mt-0.5 text-[var(--text-secondary)] text-white" /> Identifies burnout, overengineering, and gaps</li>
              <li className="flex gap-3 text-[13px] text-[var(--text-primary)]"><CheckCircle2 className="w-4 h-4 mt-0.5 text-[var(--text-secondary)] text-white" /> Prescribes targeted learning to break the cycle</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Categories Showcase */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="space-y-8 pb-12"
      >
        <motion.div variants={fadeInUp} className="text-center">
          <h2 className="text-[18px] font-medium text-[var(--text-primary)]">Diagnostic Categories</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mt-2">We classify your struggle into one of these core archetypes.</p>
        </motion.div>
        
        <motion.div 
          className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
        >
          {categories.map((cat) => (
            <motion.div 
              key={cat} 
              variants={pillVariants}
              whileHover={{ 
                scale: 1.05, 
                borderColor: 'var(--border-muted)', 
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)'
              }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[12px] font-medium text-[var(--text-secondary)] transition-all cursor-default"
            >
              {cat}
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
}

