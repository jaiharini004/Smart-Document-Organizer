import React from 'react';
import { Loader2, CheckCircle2, Clock, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          color: 'var(--status-pending)',
          bg: 'rgba(251, 191, 36, 0.1)',
          icon: <Clock size={14} />,
          text: 'Pending'
        };
      case 'processing':
        return {
          color: 'var(--status-processing)',
          bg: 'rgba(56, 189, 248, 0.1)',
          icon: <Loader2 size={14} className="animate-spin" />,
          text: 'Processing'
        };
      case 'processed':
        return {
          color: 'var(--status-processed)',
          bg: 'rgba(16, 185, 129, 0.1)',
          icon: <CheckCircle2 size={14} />,
          text: 'Processed'
        };
      case 'failed':
        return {
          color: 'var(--status-failed)',
          bg: 'rgba(244, 63, 94, 0.1)',
          icon: <XCircle size={14} />,
          text: 'Failed'
        };
      default:
        return {
          color: 'var(--text-secondary)',
          bg: 'rgba(148, 163, 184, 0.1)',
          icon: <Clock size={14} />,
          text: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.25rem 0.625rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '500',
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}40` // 40 is hex for 25% opacity
      }}
    >
      {config.icon}
      {config.text}
    </div>
  );
};

export default StatusBadge;
