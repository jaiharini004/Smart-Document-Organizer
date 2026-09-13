import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
      <div style={{
        position: 'absolute',
        inset: '0 auto 0 1rem',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
        color: 'var(--text-secondary)'
      }}>
        <Search size={18} />
      </div>
      
      <input
        type="text"
        className="input"
        placeholder="Search documents by content, title, or category..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
      />
      
      {query && (
        <button
          onClick={() => setQuery('')}
          style={{
            position: 'absolute',
            inset: '0 0.75rem 0 auto',
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
