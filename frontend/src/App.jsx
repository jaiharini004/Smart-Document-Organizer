import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import Home from './pages/Home';
import DocumentView from './pages/DocumentView';

function App() {
  return (
    <>
      <nav className="navbar">
        <div className="container flex items-center justify-between">
          <Link to="/" className="logo">
            <Layers /> Smart Document Organizer
          </Link>
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span>Alpha Version</span>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/documents/:id" element={<DocumentView />} />
        </Routes>
      </main>
      
      <footer style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        <p>&copy; 2026 Smart Document Organizer. Powered by FastAPI, React & Supabase.</p>
      </footer>
    </>
  );
}

export default App;
