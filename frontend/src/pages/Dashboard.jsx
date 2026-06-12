import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { 
  Activity, 
  Clock, 
  Code2, 
  AlertOctagon, 
  BookOpen, 
  HelpCircle,
  Database,
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1926] border border-[#2d2b3f] rounded-md p-2 shadow-xl text-[12px]">
        {label && <p className="font-mono text-[#f7f7f8] mb-1">{label}</p>}
        {payload.map((p, index) => (
          <p key={index} className="text-[#b4b3c0]">
            {p.name}: <span className="font-mono text-[#f7f7f8]">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [sessionsRes, profileRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/sessions?limit=15`),
          axios.get(`${API_BASE_URL}/sessions/profile`)
        ]);
        setSessions(sessionsRes.data);
        setProfile(profileRes.data);
        setError(null);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Could not load analytics. Please check that the backend is running.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Format date helper
  const formatDate = (isoString) => {
    try {
      if (!isoString) return '';
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return isoString;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-4 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-8 w-48 bg-[#1a1926] rounded-md border border-[var(--border-subtle)]" />
        
        {/* Metrics Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#12111a] rounded-lg border border-[var(--border-subtle)]" />
          ))}
        </div>

        {/* First Chart Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 h-[350px] bg-[#12111a] rounded-lg border border-[var(--border-subtle)]" />
          <div className="lg:col-span-4 h-[350px] bg-[#12111a] rounded-lg border border-[var(--border-subtle)]" />
        </div>

        {/* Second Chart Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 h-[350px] bg-[#12111a] rounded-lg border border-[var(--border-subtle)]" />
          <div className="lg:col-span-8 h-[350px] bg-[#12111a] rounded-lg border border-[var(--border-subtle)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-[var(--border-muted)] rounded-lg p-6 bg-[var(--bg-surface)] text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-red-950/20 border border-red-900/30 flex items-center justify-center mx-auto text-red-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Connection Error</h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              {error}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="h-8 px-4 rounded-md border border-[var(--border-muted)] bg-[var(--bg-surface-elevated)] text-[12px] font-medium transition-colors hover:bg-[var(--border-subtle)] cursor-pointer text-[var(--text-primary)]"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const hasData = profile && profile.totalSessions > 0;

  if (!hasData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full border-2 border-dashed border-[var(--border-subtle)] rounded-lg p-10 text-center space-y-6"
        >
          <div className="w-14 h-14 rounded-full border border-[var(--border-muted)] bg-[var(--bg-surface)] flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6 text-[var(--text-muted)]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-[15px] font-medium text-[var(--text-primary)]">No Analytics Available</h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              You haven't run any code diagnostics yet. Start diagnosing your programming blockers to build your learning profile.
            </p>
          </div>
          <Link 
            to="/diagnose" 
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-[var(--accent-purple)] text-white text-[13px] font-medium transition-opacity hover:opacity-90 shadow-md hover:shadow-[0_0_12px_var(--accent-glow)]"
          >
            Diagnose Your First Bug
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // Find top blocker name
  const topBlocker = profile.categoryDistribution?.[0]?.category || "None";
  const problematicTech = profile.technologyDistribution?.[0]?.tech || "None";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto py-2"
    >
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--text-primary)] tracking-tight">
            Learning Profile & Analytics
          </h1>
          <p className="text-[12px] text-[var(--text-muted)] font-mono">
            Diagnostic statistics compiled from live debugger sessions
          </p>
        </div>
        <Link 
          to="/diagnose" 
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[var(--accent-purple)] text-white text-[12px] font-medium transition-opacity hover:opacity-90 shadow-md hover:shadow-[0_0_12px_var(--accent-glow)]"
        >
          New Diagnosis
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <motion.div 
          variants={cardVariants}
          className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.02] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Total Sessions</span>
            <p className="text-[22px] font-semibold text-[var(--text-primary)] font-mono leading-none">
              {profile.totalSessions}
            </p>
          </div>
          <div className="text-[var(--text-muted)]">
            <Database className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Metric 2 */}
        <motion.div 
          variants={cardVariants}
          className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.02] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Avg Time Stuck</span>
            <p className="text-[22px] font-semibold text-[var(--text-primary)] font-mono leading-none">
              {profile.avgTimeStuck}<span className="text-[12px] font-normal text-[var(--text-secondary)] ml-1">mins</span>
            </p>
          </div>
          <div className="text-[var(--text-muted)]">
            <Clock className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Metric 3 */}
        <motion.div 
          variants={cardVariants}
          className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.02] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Top Blocker</span>
            <p className="text-[15px] font-medium text-[var(--text-primary)] truncate max-w-[170px] leading-tight">
              {topBlocker}
            </p>
          </div>
          <div className="text-[var(--text-muted)]">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </motion.div>

        {/* Metric 4 */}
        <motion.div 
          variants={cardVariants}
          className="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.02] flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Problematic Tech</span>
            <p className="text-[15px] font-medium text-[var(--text-primary)] truncate max-w-[170px] leading-tight">
              {problematicTech}
            </p>
          </div>
          <div className="text-[var(--text-muted)]">
            <Code2 className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* Learning Insights Block */}
      <motion.div 
        variants={cardVariants}
        className="p-5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.02] space-y-3"
      >
        <h3 className="text-[13px] font-mono text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Learning Insights & Trends
        </h3>
        <ul className="space-y-2">
          {profile.insights?.map((insight, idx) => (
            <li key={idx} className="text-[13px] text-[var(--text-secondary)] flex items-start gap-2.5 leading-relaxed">
              <span className="text-[var(--text-muted)] mt-1 font-mono text-[10px]">{idx + 1}.</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* First Chart Row: Weekly Trends & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Diagnosis Trends (cols-8) */}
        <motion.div 
          variants={cardVariants}
          className="lg:col-span-8 p-5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.02] flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Weekly Diagnosis Trends</h3>
            <p className="text-[11px] text-[var(--text-muted)] font-mono">Volume of diagnostic sessions tracked over time</p>
          </div>

          <div className="h-[250px] w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profile.weeklyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="week" 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Diagnostics"
                  stroke="#8b8a96" 
                  strokeWidth={2}
                  dot={{ r: 3, stroke: '#12111a', strokeWidth: 1, fill: '#8b8a96' }}
                  activeDot={{ r: 5, stroke: '#12111a', strokeWidth: 1, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Struggle Category Distribution (cols-4) */}
        <motion.div 
          variants={cardVariants}
          className="lg:col-span-4 p-5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.02] flex flex-col justify-between"
        >
          <div className="mb-2">
            <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Common Struggle Categories</h3>
            <p className="text-[11px] text-[var(--text-muted)] font-mono">Share percentage breakdown of classified struggles</p>
          </div>

          <div className="h-[220px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={profile.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="category"
                >
                  {(profile.categoryDistribution || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[entry.category] || "#8b8a96"} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Count */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[18px] font-semibold text-[var(--text-primary)] font-mono">
                {profile.totalSessions}
              </span>
              <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Total</span>
            </div>
          </div>

          {/* Mini Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-3 mt-1">
            {(profile.categoryDistribution || []).slice(0, 4).map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 truncate">
                <span 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: CATEGORY_COLORS[entry.category] || "#8b8a96" }}
                />
                <span className="truncate">{entry.category} ({entry.count})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Second Row: Technology Blocker Distribution & Session History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Technology Blocker Distribution (cols-4) */}
        <motion.div 
          variants={cardVariants}
          className="lg:col-span-4 p-5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.02] flex flex-col justify-between"
        >
          <div className="mb-4">
            <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Technology Blocker Distribution</h3>
            <p className="text-[11px] text-[var(--text-muted)] font-mono">Count of struggles encountered per tech stack</p>
          </div>

          <div className="h-[250px] w-full pr-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={profile.technologyDistribution || []}
                layout="vertical"
                margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
              >
                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="var(--text-muted)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  allowDecimals={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="tech" 
                  stroke="var(--text-primary)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  width={65}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="Blockers"
                  fill="#757575" 
                  radius={[0, 3, 3, 0]}
                  barSize={10}
                >
                  {(profile.technologyDistribution || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? "#8a8a8a" : "#575757"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Session History Table (cols-8) */}
        <motion.div 
          variants={cardVariants}
          className="lg:col-span-8 p-5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t border-t-white/[0.02] flex flex-col justify-between overflow-hidden"
        >
          <div className="mb-4">
            <h3 className="text-[14px] font-medium text-[var(--text-primary)]">Diagnostic History Logs</h3>
            <p className="text-[11px] text-[var(--text-muted)] font-mono">List of recent clinical diagnostics records</p>
          </div>

          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-left text-[12px] min-w-[500px]">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)] uppercase bg-[#12111a]/40">
                  <th className="py-2.5 px-5">Timestamp</th>
                  <th className="py-2.5 px-3">Technology</th>
                  <th className="py-2.5 px-3">Struggle Category</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Emotion</th>
                  <th className="py-2.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]/50">
                {sessions.map((session, index) => (
                  <tr 
                    key={session._id || index}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-2.5 px-5 font-mono text-[11px] text-[var(--text-secondary)]">
                      {formatDate(session.timestamp)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[var(--text-primary)]">
                      {session.technology}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span 
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[session.diagnosedCategory] || "#8b8a96" }}
                        />
                        <span className="text-[var(--text-secondary)] truncate max-w-[120px]">
                          {session.diagnosedCategory}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--text-muted)]">
                      {Math.round((session.confidence || 0) * 100)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#1a1926] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                        {session.emotion}
                      </span>
                    </td>
                    <td className="py-2.5 px-5 text-right">
                      <Link
                        to="/results"
                        state={{ 
                          result: {
                            category: session.diagnosedCategory,
                            confidence: session.confidence,
                            prescription: session.prescription,
                            similarityMap: { [session.diagnosedCategory]: session.confidence } // basic fallback
                          } 
                        }}
                        className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1 underline"
                      >
                        Inspect
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
