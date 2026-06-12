import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  Zap, 
  BookOpen, 
  ShieldAlert, 
  ArrowLeft, 
  BarChart4, 
  LayoutDashboard 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

const CATEGORY_COLORS = {
  "Syntax Error": "#8a8a8a",
  "Logic Error": "#808080",
  "Conceptual Gap": "#757575",
  "Architecture Issue": "#6b6b6b",
  "Tooling Problem": "#616161",
  "Debugging Skill Gap": "#575757",
  "Overengineering": "#4d4d4d",
  "Burnout": "#424242"
};

const CATEGORY_DESCRIPTIONS = {
  "Syntax Error": "Typo, missing bracket, or basic language grammar mistake",
  "Logic Error": "Flawed reasoning where code runs but produces incorrect outputs",
  "Conceptual Gap": "Misunderstanding of underlying programming concepts or framework behavior",
  "Architecture Issue": "Poor design decisions or structural flaws in the codebase",
  "Tooling Problem": "Environment setup, dependency, build configuration, or package issues",
  "Debugging Skill Gap": "Lacking effective strategies to isolate and reproduce the problem",
  "Overengineering": "Adding unnecessary complexity to a simple problem",
  "Burnout": "Mental exhaustion leading to poor focus and decision-making"
};

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1a1926] border border-[#2d2b3f] rounded-md p-3 shadow-xl text-[12px]">
        <p className="font-medium text-[#f7f7f8]">{data.category}</p>
        <p className="text-[#b4b3c0] mt-1">Match: {(data.score * 100).toFixed(1)}%</p>
        <p className="text-[#686775] text-[10px] mt-1 max-w-[200px] leading-relaxed">
          {CATEGORY_DESCRIPTIONS[data.category] || ""}
        </p>
      </div>
    );
  }
  return null;
};

// Circular Progress Gauge Component
function CircularProgress({ value, color }) {
  const radius = 45;
  const stroke = 6;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value * circumference);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.03)]"
      >
        {/* Background circle */}
        <circle
          stroke="var(--border-subtle)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Foreground circle */}
        <motion.circle
          stroke={color || "#8b8a96"}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[14px] font-mono font-semibold text-[var(--text-primary)]">
          {Math.round(value * 100)}%
        </span>
        <span className="text-[8px] text-[var(--text-muted)] tracking-wider uppercase">Match</span>
      </div>
    </div>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const yAxisWidth = windowWidth < 640 ? 100 : 150;

  if (!result) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full border-2 border-dashed border-[var(--border-subtle)] rounded-lg p-8 text-center space-y-5"
        >
          <div className="w-12 h-12 rounded-full border border-[var(--border-muted)] bg-[var(--bg-surface)] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-5 h-5 text-[var(--text-muted)]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-[14px] font-medium text-[var(--text-primary)]">No Diagnosis Found</h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              No active diagnosis result could be retrieved from the current session history.
            </p>
          </div>
          <Link 
            to="/diagnose" 
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-[var(--border-muted)] bg-[var(--bg-surface)] text-[13px] font-medium transition-colors hover:bg-[var(--border-subtle)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Diagnose Form
          </Link>
        </motion.div>
      </div>
    );
  }

  const { category, confidence, similarityMap, prescription } = result;
  const categoryColor = CATEGORY_COLORS[category] || "#8b8a96";

  // Prepare data for Similarity Map chart
  const chartData = Object.entries(similarityMap || {})
    .map(([cat, score]) => ({
      category: cat,
      score: score,
      color: CATEGORY_COLORS[cat] || "#8b8a96"
    }))
    // Sort descending by score
    .sort((a, b) => b.score - a.score);

  // Stagger animation container config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-5xl mx-auto py-4"
    >
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <Link 
          to="/diagnose" 
          className="inline-flex items-center gap-2 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Diagnose Another Issue
        </Link>
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          View Profile Dashboard
        </Link>
      </div>

      {/* Hero Diagnosis Banner */}
      <motion.div 
        variants={itemVariants}
        className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.03] shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        {/* Subtle decorative color border */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-[4px]"
          style={{ backgroundColor: categoryColor }}
        />
        
        <div className="space-y-2 pl-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-muted)]">
              Diagnosed Struggle Category
            </span>
            <span 
              className="text-[10px] font-mono px-2 py-0.5 rounded-full border text-white"
              style={{ 
                backgroundColor: `${categoryColor}22`, 
                borderColor: categoryColor 
              }}
            >
              {category}
            </span>
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight text-[var(--text-primary)] leading-none">
            {category}
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-xl leading-relaxed">
            {CATEGORY_DESCRIPTIONS[category]}
          </p>
        </div>

        <div className="pr-2 self-center md:self-auto">
          <CircularProgress value={confidence} color={categoryColor} />
        </div>
      </motion.div>

      {/* The Prescription Blocks */}
      <div className="space-y-4">
        <h2 className="text-[14px] font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 pl-1">
          <Zap className="w-4 h-4 text-[var(--text-secondary)]" />
          Clinical AI Prescription
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Why You're Stuck */}
          <motion.div 
            variants={itemVariants}
            className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.03] border-l-2 flex gap-4"
            style={{ borderLeftColor: categoryColor }}
          >
            <div className="text-[var(--text-muted)] mt-1">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Why You're Stuck</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {prescription?.whyStuck || "Unable to retrieve explanation."}
              </p>
            </div>
          </motion.div>

          {/* Card 2: Immediate Action Step */}
          <motion.div 
            variants={itemVariants}
            className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.03] border-l-2 flex gap-4"
            style={{ borderLeftColor: categoryColor }}
          >
            <div className="text-[var(--text-muted)] mt-1">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Immediate Action Step</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {prescription?.immediateStep || "Unable to retrieve immediate step."}
              </p>
            </div>
          </motion.div>

          {/* Card 3: Study Syllabus */}
          <motion.div 
            variants={itemVariants}
            className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.03] border-l-2 flex gap-4"
            style={{ borderLeftColor: categoryColor }}
          >
            <div className="text-[var(--text-muted)] mt-1">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Study Syllabus</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {prescription?.studyNext || "Unable to retrieve concept to study."}
              </p>
            </div>
          </motion.div>

          {/* Card 4: Prevention Guardrails */}
          <motion.div 
            variants={itemVariants}
            className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.03] border-l-2 flex gap-4"
            style={{ borderLeftColor: categoryColor }}
          >
            <div className="text-[var(--text-muted)] mt-1">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Prevention Guardrails</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {prescription?.prevention || "Unable to retrieve prevention advice."}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Grounded References (RAG) */}
      {prescription?.sources && prescription.sources.length > 0 && (
        <motion.div 
          variants={itemVariants}
          className="p-5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.03] shadow-md space-y-3"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--text-muted)]" />
            <h3 className="text-[13px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
              Grounded Reference Documentation
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {prescription.sources.map((src, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 p-2 px-3 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[12px] text-[var(--text-primary)] font-mono"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-focus)] shrink-0" />
                <span>{src.title}</span>
                <span className="text-[var(--text-muted)] text-[10px] ml-1">({src.source})</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Similarity Map Chart */}
      <motion.div 
        variants={itemVariants}
        className="p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.03] shadow-md space-y-4"
      >
        <div className="space-y-1">
          <h2 className="text-[14px] font-medium text-[var(--text-primary)] flex items-center gap-2">
            <BarChart4 className="w-4 h-4 text-[var(--text-secondary)]" />
            Semantic Classification Map
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] font-mono">
            Cosine similarity match scores for all struggle categories
          </p>
        </div>

        <div className="h-[320px] w-full pt-4 pr-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                domain={[0, 1]} 
                tickFormatter={(val) => `${Math.round(val * 100)}%`}
                stroke="var(--text-muted)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category" 
                dataKey="category" 
                stroke="var(--text-primary)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={yAxisWidth}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.01)' }} />
              <Bar 
                dataKey="score" 
                radius={[0, 4, 4, 0]}
                barSize={14}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Footer Navigation Buttons */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--border-subtle)]"
      >
        <button
          onClick={() => navigate('/diagnose')}
          className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-[var(--border-muted)] bg-[var(--bg-surface)] text-[13px] font-medium transition-colors hover:bg-[var(--border-subtle)] cursor-pointer text-[var(--text-primary)]"
        >
          Diagnose Another Issue
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex-1 inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-[var(--accent-purple)] text-white text-[13px] font-medium transition-opacity hover:opacity-90 shadow-md hover:shadow-[0_0_12px_var(--accent-glow)] cursor-pointer"
        >
          View Learning Dashboard
          <LayoutDashboard className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}
