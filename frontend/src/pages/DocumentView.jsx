import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar, FileText, User, Tag, HardDrive } from 'lucide-react';
import { documentAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const DocumentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDocument = async () => {
    try {
      const data = await documentAPI.getDocument(id);
      setDoc(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load document details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  // Poll if still processing
  useEffect(() => {
    if (doc && (doc.status === 'pending' || doc.status === 'processing')) {
      const intervalId = setInterval(async () => {
        try {
          const statusData = await documentAPI.getDocumentStatus(id);
          if (statusData.status === 'processed' || statusData.status === 'failed') {
            fetchDocument(); // refetch full doc
          }
        } catch (e) {
          console.error(e);
        }
      }, 2000);
      return () => clearInterval(intervalId);
    }
  }, [doc, id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    
    setIsDeleting(true);
    try {
      await documentAPI.deleteDocument(id);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Failed to delete document.");
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center h-full">
        <div className="animate-pulse">Loading document details...</div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="container py-8">
        <button className="btn btn-secondary mb-6" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="glass-panel p-8 text-center">
          <h3>Document Not Found</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Back
        </button>
        
        <button 
          className="btn btn-danger" 
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 size={16} /> {isDeleting ? 'Deleting...' : 'Delete Document'}
        </button>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Metadata Top Bar */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={doc.status} />
                <span className="text-xs text-secondary">{doc.id}</span>
              </div>
              <h2 className="mb-1">{doc.original_name}</h2>
              {doc.doc_title && doc.doc_title !== doc.original_name && (
                <p className="text-sm">Title: {doc.doc_title}</p>
              )}
            </div>
            
            {/* Category Badge on the right */}
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1 justify-end" style={{ color: 'var(--text-secondary)' }}>
                <Tag size={14} /> <span className="text-xs font-semibold uppercase tracking-wider">Category</span>
              </div>
              <div style={{
                display: 'inline-flex',
                padding: '0.375rem 0.75rem',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-color)',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                fontSize: '1rem'
              }}>
                {doc.category || 'Uncategorized'}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--text-secondary)' }}>
                <HardDrive size={14} /> <span className="text-xs">File Size</span>
              </div>
              <p className="font-medium">{formatSize(doc.file_size)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--text-secondary)' }}>
                <FileText size={14} /> <span className="text-xs">Pages</span>
              </div>
              <p className="font-medium">{doc.page_count || 'N/A'}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--text-secondary)' }}>
                <User size={14} /> <span className="text-xs">Author</span>
              </div>
              <p className="font-medium">{doc.doc_author || 'Unknown'}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--text-secondary)' }}>
                <Calendar size={14} /> <span className="text-xs">Processed</span>
              </div>
              <p className="font-medium">{doc.processed_at ? formatDate(doc.processed_at) : formatDate(doc.uploaded_at)}</p>
            </div>
          </div>
        </div>
        
        {/* Main Content Pane */}
        <div className="glass-panel h-full flex-col" style={{ display: 'flex', minHeight: '600px' }}>
          <div className="p-6 flex-grow" style={{ backgroundColor: 'rgba(0,0,0,0.2)', overflowY: 'auto' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
              EXTRACTED CONTENT
            </h3>
            
            {doc.status === 'processed' ? (
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                fontFamily: 'monospace', 
                fontSize: '0.875rem',
                lineHeight: '1.6',
                color: 'rgba(255,255,255,0.9)'
              }}>
                {doc.extracted_text || "No text could be extracted from this document."}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-50 py-12">
                <FileText size={48} className="mb-4" />
                <p>Content will appear here once processing is complete.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default DocumentView;
