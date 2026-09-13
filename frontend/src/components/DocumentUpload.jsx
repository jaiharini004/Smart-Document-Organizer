import React, { useState, useRef } from 'react';
import { UploadCloud, File as FileIcon, X, Check } from 'lucide-react';
import { documentAPI } from '../services/api';

const DocumentUpload = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are supported.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      await documentAPI.uploadDocument(file);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error("Upload failed", err);
      setError(err.response?.data?.detail || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-panel p-6 w-full animate-fade-in">
      <h2 className="mb-4">Upload Document</h2>
      
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--accent-color)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <UploadCloud 
            size={48} 
            color={isDragging ? 'var(--accent-color)' : 'var(--text-secondary)'} 
            style={{ margin: '0 auto', marginBottom: '1rem' }} 
          />
          <h3 className="text-sm font-semibold mb-2">Click or drag and drop to upload</h3>
          <p className="text-xs">PDF (Max 10MB)</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="application/pdf"
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div 
          className="flex items-center justify-between"
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div className="flex items-center gap-4">
            <div style={{ color: 'var(--accent-color)' }}>
              <FileIcon size={24} />
            </div>
            <div>
              <p className="font-semibold text-sm">{file.name}</p>
              <p className="text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isUploading && (
              <button 
                onClick={() => setFile(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            )}
            <button 
              className={`btn ${isUploading ? 'btn-secondary animate-pulse' : 'btn-primary'}`}
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Confirm Upload'}
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <p style={{ color: 'var(--status-failed)', marginTop: '1rem', fontSize: '0.875rem' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default DocumentUpload;
