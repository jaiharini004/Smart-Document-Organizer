import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Layers } from 'lucide-react';
import StatusBadge from './StatusBadge';

const DocumentList = ({ documents, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-panel p-6" style={{ height: '180px' }}>
            <div style={{ height: '24px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '1rem', width: '80%' }}></div>
            <div style={{ height: '16px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.5rem', width: '50%' }}></div>
            <div style={{ height: '16px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '1rem', width: '60%' }}></div>
          </div>
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="glass-panel p-8 text-center animate-fade-in">
        <FileText size={48} color="var(--text-secondary)" style={{ margin: '0 auto', marginBottom: '1rem', opacity: 0.5 }} />
        <h3 className="mb-2">No documents found</h3>
        <p>Upload a new document or try adjusting your search.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {documents.map((doc) => (
        <Link to={`/documents/${doc.id}`} key={doc.id}>
          <div className="glass-panel p-6 h-full flex-col justify-between" style={{ display: 'flex' }}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={doc.status} />
                {doc.category && (
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '9999px'
                  }}>
                    {doc.category}
                  </span>
                )}
              </div>
              
              <h3 className="text-sm font-semibold mb-3" style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                display: '-webkit-box', 
                WebkitLineClamp: 2, 
                WebkitBoxOrient: 'vertical' 
              }}>
                {doc.original_name}
              </h3>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} />
                <span>Uploaded {formatDate(doc.uploaded_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers size={14} />
                <span>{doc.page_count ? `${doc.page_count} pages` : 'Pending processing...'}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DocumentList;
