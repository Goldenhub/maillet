import type { Warning, WarningSeverity } from '@/types';
import { useState } from 'react';

interface WarningsPanelProps {
  warnings: Warning[];
  onDismiss?: (id: string) => void;
  dismissedIds?: Set<string>;
}

const severityOrder: Record<WarningSeverity, number> = { error: 0, warning: 1, info: 2 };

const severityIcon: Record<WarningSeverity, string> = {
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export function WarningsPanel({ warnings, onDismiss, dismissedIds }: WarningsPanelProps) {
  const [filter, setFilter] = useState<WarningSeverity | 'all'>('all');

  const visibleWarnings = warnings
    .filter((w) => !dismissedIds?.has(w.id))
    .filter((w) => filter === 'all' || w.severity === filter)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  if (visibleWarnings.length === 0 && warnings.length === 0) {
    return null;
  }

  const counts = {
    error: warnings.filter((w) => w.severity === 'error' && !dismissedIds?.has(w.id)).length,
    warning: warnings.filter((w) => w.severity === 'warning' && !dismissedIds?.has(w.id)).length,
    info: warnings.filter((w) => w.severity === 'info' && !dismissedIds?.has(w.id)).length,
  };

  return (
    <div className="warnings-panel">
      <div className="warnings-header">
        <h3>Warnings ({visibleWarnings.length})</h3>
        <div className="warnings-filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')} type="button">
            All
          </button>
          {counts.error > 0 && (
            <button className={filter === 'error' ? 'active' : ''} onClick={() => setFilter('error')} type="button">
              Errors ({counts.error})
            </button>
          )}
          {counts.warning > 0 && (
            <button className={filter === 'warning' ? 'active' : ''} onClick={() => setFilter('warning')} type="button">
              Warnings ({counts.warning})
            </button>
          )}
          {counts.info > 0 && (
            <button className={filter === 'info' ? 'active' : ''} onClick={() => setFilter('info')} type="button">
              Info ({counts.info})
            </button>
          )}
        </div>
      </div>
      <div className="warnings-list">
        {visibleWarnings.map((warning) => (
          <div key={warning.id} className={`warning-item warning-${warning.severity}`}>
            <span className="warning-icon">{severityIcon[warning.severity]}</span>
            <div className="warning-content">
              <span className="warning-message">{warning.message}</span>
              {warning.suggestion && <span className="warning-suggestion">{warning.suggestion}</span>}
            </div>
            {onDismiss && (
              <button className="warning-dismiss" onClick={() => onDismiss(warning.id)} type="button">
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
