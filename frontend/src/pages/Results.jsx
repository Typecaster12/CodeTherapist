import { useLocation, Link } from 'react-router-dom';

export default function Results() {
  const location = useLocation();
  const result = location.state?.result;

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-6">
      <h1 className="text-[24px] font-semibold text-[var(--text-primary)]">Diagnosis Results (Verification Mode)</h1>
      
      {result ? (
        <div className="space-y-4">
          <div className="p-4 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
            <p className="text-[14px] font-medium text-[var(--text-primary)]">
              Diagnosed Category: <span className="text-[var(--text-secondary)] font-semibold">{result.category}</span>
            </p>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Confidence Score: {(result.confidence * 100).toFixed(1)}%
            </p>
          </div>
          
          <pre className="p-4 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[12px] font-mono text-[var(--text-muted)] overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
          
          <div className="pt-4">
            <Link to="/diagnose" className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline">
              Diagnose another issue
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center space-y-4">
          <p className="text-[13px] text-[var(--text-secondary)]">No active diagnosis state found in router history.</p>
          <Link to="/diagnose" className="inline-block px-4 py-2 rounded-md bg-[var(--text-primary)] text-[var(--bg-void)] text-[13px] font-medium transition-opacity hover:opacity-90">
            Go to Diagnose Form
          </Link>
        </div>
      )}
    </div>
  );
}
