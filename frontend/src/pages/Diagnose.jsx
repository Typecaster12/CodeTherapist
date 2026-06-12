import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Code2, Clock, AlertTriangle, Terminal, Play, Shield, ShieldAlert, Check, X } from 'lucide-react';


const emotions = [
  { value: 'Frustrated', label: 'Frustrated', desc: 'Blocked by stubborn bugs' },
  { value: 'Confused', label: 'Confused', desc: 'Code behaves unpredictably' },
  { value: 'Overwhelmed', label: 'Overwhelmed', desc: 'Too many things breaking' },
  { value: 'Anxious', label: 'Anxious', desc: 'Stressed about deadlines' },
  { value: 'Calm', label: 'Calm', desc: 'Patient but stuck' }
];

const FORM_STORAGE_KEY = 'code_therapist_diagnose_draft';

const defaultFormData = {
  goal: '',
  tech: '',
  timeStuck: '',
  emotion: '',
  error: '',
  code: ''
};

function loadDraft() {
  try {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    return saved ? { ...defaultFormData, ...JSON.parse(saved) } : defaultFormData;
  } catch {
    return defaultFormData;
  }
}

export default function Diagnose() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(loadDraft);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVPIScanning, setIsVPIScanning] = useState(false);
  const [vpiScanResult, setVpiScanResult] = useState(null);
  const [showVPIModal, setShowVPIModal] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  // Persist draft to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // ignore storage errors
    }
  }, [formData]);

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

  const runDiagnosis = async (errorText, codeText) => {
    setIsSubmitting(true);
    setSubmitError('');
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    try {
      const response = await api.post('/diagnose', {
        goal: formData.goal,
        tech: formData.tech,
        timeStuck: Number(formData.timeStuck),
        emotion: formData.emotion,
        error: errorText,
        code: codeText
      });

      clearInterval(interval);
      try {
        localStorage.removeItem(FORM_STORAGE_KEY);
      } catch {
        // ignore storage access errors in some environments
      }
      setFormData(defaultFormData);
      
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitError('');
    setIsVPIScanning(true);

    try {
      const vpiRes = await api.post('/vpi/scan', {
        error: formData.error,
        code: formData.code
      });

      setIsVPIScanning(false);

      if (vpiRes.data.is_safe) {
        // Safe: proceed with original inputs
        await runDiagnosis(formData.error, formData.code);
      } else {
        // Sensitive data detected: show modal for review
        setVpiScanResult(vpiRes.data);
        setShowVPIModal(true);
      }
    } catch (err) {
      console.warn("VPI scan failed. Falling back to direct submit.", err);
      setIsVPIScanning(false);
      // Degrade gracefully: submit original inputs directly
      await runDiagnosis(formData.error, formData.code);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto py-6 relative"
    >
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

        {isVPIScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-void)]/85 backdrop-blur-sm"
          >
            <div className="max-w-md w-full px-6 text-center space-y-4">
              <Shield className="w-12 h-12 text-[var(--text-muted)] animate-pulse mx-auto" />
              <div className="space-y-1">
                <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">VPI Privacy Shield Active</h3>
                <p className="text-[12px] text-[var(--text-secondary)]">Scanning inputs for credentials and sensitive data...</p>
              </div>
            </div>
          </motion.div>
        )}

        {showVPIModal && vpiScanResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-void)]/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-2xl w-full bg-[var(--bg-surface)] border border-[var(--border-muted)] rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[#12111a]/40">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-yellow-500" />
                  <div>
                    <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Privacy Redaction Verification</h3>
                    <p className="text-[11px] text-[var(--text-muted)] font-mono">Verifiable Private Interface (VPI)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVPIModal(false)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                <div className="p-4 rounded bg-yellow-950/10 border border-yellow-900/30 text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
                  We scanned your inputs and detected credentials or personal information. For your privacy, Code Therapist will automatically redact these details before diagnosing.
                </div>

                {/* Findings List */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Detected Sensitive Data</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {vpiScanResult.findings.map((finding, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
                        <span className="text-[12px] text-[var(--text-primary)] font-medium">{finding.type}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-yellow-950/20 text-yellow-400 border border-yellow-900/40">
                          {finding.count} found
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Redacted Payload Preview */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Sanitized Preview (Verifiable Payload)</span>
                  
                  {vpiScanResult.error_redacted !== formData.error && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">Redacted Error Log:</div>
                      <pre className="p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded text-[11px] font-mono text-[var(--text-secondary)] overflow-x-auto max-h-[100px] whitespace-pre-wrap">
                        {vpiScanResult.error_redacted}
                      </pre>
                    </div>
                  )}

                  {vpiScanResult.code_redacted !== formData.code && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">Redacted Code Snippet:</div>
                      <pre className="p-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded text-[11px] font-mono text-[var(--text-secondary)] overflow-x-auto max-h-[140px] whitespace-pre-wrap">
                        {vpiScanResult.code_redacted}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-[#12111a]/40 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowVPIModal(false)}
                  className="h-9 px-4 rounded-md border border-[var(--border-muted)] bg-[var(--bg-surface)] text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-all cursor-pointer"
                >
                  Cancel & Edit inputs
                </button>
                <button
                  onClick={() => {
                    setShowVPIModal(false);
                    runDiagnosis(vpiScanResult.error_redacted, vpiScanResult.code_redacted);
                  }}
                  className="h-9 px-4 rounded-md bg-[var(--text-primary)] text-[var(--bg-void)] text-[12px] font-semibold hover:opacity-90 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Confirm & Send Sanitized Data
                </button>
              </div>
            </motion.div>
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
    </motion.div>
  );
}
