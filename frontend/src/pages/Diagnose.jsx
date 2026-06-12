import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Code2, Clock, AlertTriangle, Terminal, Play } from 'lucide-react';

const emotions = [
  { value: 'Frustrated', label: 'Frustrated', desc: 'Blocked by stubborn bugs' },
  { value: 'Confused', label: 'Confused', desc: 'Code behaves unpredictably' },
  { value: 'Overwhelmed', label: 'Overwhelmed', desc: 'Too many things breaking' },
  { value: 'Anxious', label: 'Anxious', desc: 'Stressed about deadlines' },
  { value: 'Calm', label: 'Calm', desc: 'Patient but stuck' }
];

export default function Diagnose() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    goal: '',
    tech: '',
    timeStuck: '',
    emotion: '',
    error: '',
    code: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    'Parsing stack traces & syntax context...',
    'Generating semantic problem embedding...',
    'Running cosine similarity checks across struggle categories...',
    'Consulting Gemini Prescription Engine...'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const selectEmotion = (val) => {
    setFormData((prev) => ({ ...prev, emotion: val }));
    if (errors.emotion) {
      setErrors((prev) => ({ ...prev, emotion: '' }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.goal.trim()) {
      tempErrors.goal = 'What you are trying to build is required.';
    } else if (formData.goal.trim().length < 10) {
      tempErrors.goal = 'Please write a bit more detail (min 10 characters).';
    }

    if (!formData.tech.trim()) {
      tempErrors.tech = 'Technology stack is required (e.g., React, Python).';
    }

    if (!formData.timeStuck) {
      tempErrors.timeStuck = 'Time spent stuck is required.';
    } else if (Number(formData.timeStuck) <= 0) {
      tempErrors.timeStuck = 'Time spent stuck must be at least 1 minute.';
    }

    if (!formData.emotion) {
      tempErrors.emotion = 'Please select your emotional state.';
    }

    if (!formData.error.trim()) {
      tempErrors.error = 'Error message or compiler log is required.';
    }

    if (!formData.code.trim()) {
      tempErrors.code = 'Code snippet is required.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');
    setLoadingStep(0);

    // Simulate loading status updates
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    try {
      const response = await axios.post('http://localhost:8000/diagnose', {
        goal: formData.goal,
        tech: formData.tech,
        timeStuck: Number(formData.timeStuck),
        emotion: formData.emotion,
        error: formData.error,
        code: formData.code
      });

      clearInterval(interval);
      // Give a tiny buffer for the transition
      setTimeout(() => {
        navigate('/results', { state: { result: response.data } });
      }, 500);

    } catch (err) {
      clearInterval(interval);
      setIsSubmitting(false);
      console.error(err);
      setSubmitError(
        err.response?.data?.detail || 'Failed to submit diagnosis. Make sure backend API is running.'
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 relative">
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-void)]/90 backdrop-blur-md"
          >
            <div className="max-w-md w-full px-6 text-center space-y-6">
              {/* Spinner */}
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-white/[0.05]" />
                <div className="absolute inset-0 rounded-full border-2 border-t-[var(--text-primary)] animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[16px] font-medium text-[var(--text-primary)]">Diagnosing Struggle</h3>
                <p className="text-[13px] text-[var(--text-secondary)] transition-all duration-300">
                  {steps[loadingStep]}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 mb-8">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
          Clinical Diagnosis
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Provide your environment details and debugger output to start the diagnostic scan.
        </p>
      </div>

      {submitError && (
        <div className="mb-6 p-4 rounded-lg bg-red-950/20 border border-red-900/50 text-[13px] text-red-400 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-1">API Request Failed</h4>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Meta context */}
        <div className="space-y-6 p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t-[1px] border-t-white/[0.02] shadow-sm">
          
          {/* Goal Input */}
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[var(--text-primary)] flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--text-muted)]" /> What are you trying to build?
            </label>
            <input
              type="text"
              name="goal"
              value={formData.goal}
              onChange={handleInputChange}
              placeholder="e.g. Setting up JWT authentication on login endpoint"
              className="w-full h-9 px-3 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
            />
            {errors.goal && <p className="text-[11px] text-red-400">{errors.goal}</p>}
          </div>

          {/* Tech Stack & Stuck Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[var(--text-muted)]" /> Technology / Tech Stack
              </label>
              <input
                type="text"
                name="tech"
                value={formData.tech}
                onChange={handleInputChange}
                placeholder="e.g. React, Node.js, FastAPI"
                className="w-full h-9 px-3 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
              />
              {errors.tech && <p className="text-[11px] text-red-400">{errors.tech}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--text-muted)]" /> Time Spent Stuck (minutes)
              </label>
              <input
                type="number"
                name="timeStuck"
                value={formData.timeStuck}
                onChange={handleInputChange}
                placeholder="e.g. 90"
                min="1"
                className="w-full h-9 px-3 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[13px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
              />
              {errors.timeStuck && <p className="text-[11px] text-red-400">{errors.timeStuck}</p>}
            </div>
          </div>

          {/* Emotion Card Selection */}
          <div className="space-y-3">
            <label className="text-[12px] font-medium text-[var(--text-primary)]">
              Primary Emotional State
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {emotions.map((emo) => {
                const active = formData.emotion === emo.value;
                return (
                  <div
                    key={emo.value}
                    onClick={() => selectEmotion(emo.value)}
                    className={`p-3 rounded-md border text-left cursor-pointer transition-all duration-200 ${
                      active
                        ? 'bg-[var(--bg-surface-elevated)] border-[var(--border-focus)]'
                        : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-muted)]'
                    }`}
                  >
                    <div className="text-[13px] font-medium text-[var(--text-primary)]">
                      {emo.label}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-1">
                      {emo.desc}
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.emotion && <p className="text-[11px] text-red-400">{errors.emotion}</p>}
          </div>

        </div>

        {/* Right Panel - Textareas */}
        <div className="space-y-6 p-6 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] border-t-[1px] border-t-white/[0.02] shadow-sm flex flex-col justify-between">
          <div className="space-y-6 w-full">
            {/* Error Message */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-[var(--text-primary)] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--text-muted)]" /> Error Message or Log
              </label>
              <textarea
                name="error"
                value={formData.error}
                onChange={handleInputChange}
                placeholder="Paste the compiler exception, traceback or error message here..."
                rows="4"
                className="w-full p-3 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[12px] font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] transition-colors resize-y"
              />
              {errors.error && <p className="text-[11px] text-red-400">{errors.error}</p>}
            </div>

            {/* Code Snippet */}
            <div className="space-y-2">
              <label className="text-[12px] font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--text-muted)]" /> Code Snippet
              </label>
              <textarea
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="// Paste the code file or function block causing issues..."
                rows="7"
                className="w-full p-3 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[12px] font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] transition-colors resize-y"
              />
              {errors.code && <p className="text-[11px] text-red-400">{errors.code}</p>}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 h-10 rounded-md bg-[var(--text-primary)] text-[var(--bg-void)] font-semibold text-[13px] hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-md"
            >
              <Play className="w-4 h-4 fill-current" /> Run Struggle Diagnostics
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
