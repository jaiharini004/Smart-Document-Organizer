import React, { useState, useEffect, useCallback } from 'react';
import DocumentUpload from '../components/DocumentUpload';
import SearchBar from '../components/SearchBar';
import DocumentList from '../components/DocumentList';
import { documentAPI } from '../services/api';
import { Layers } from 'lucide-react';

const Home = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (searchQuery) {
        data = await documentAPI.searchDocuments(searchQuery);
      } else {
        data = await documentAPI.getDocuments();
      }
      setDocuments(data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setError("Unable to load documents. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Initial fetch and fetch on search change
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Polling for pending/processing documents
  useEffect(() => {
    const hasPending = documents.some(
      (doc) => doc.status === 'pending' || doc.status === 'processing'
    );

    if (hasPending && !searchQuery) {
      const intervalId = setInterval(() => {
        fetchDocuments();
      }, 3000);
      return () => clearInterval(intervalId);
    }
  }, [documents, searchQuery, fetchDocuments]);

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers color="var(--accent-color)" /> Dashboard
          </h1>
          <p>Manage, upload, and search your categorized documents.</p>
        </div>
      </div>

      <div className="mb-10">
        <DocumentUpload onUploadSuccess={fetchDocuments} />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2>Your Documents</h2>
        <SearchBar onSearch={setSearchQuery} />
      </div>

      {error ? (
        <div className="glass-panel p-6" style={{ borderLeft: '4px solid var(--status-failed)' }}>
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--status-failed)' }}>Error Loading Data</h3>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <DocumentList documents={documents} loading={loading} />
      )}
    </div>
  );
};

export default Home;
