'use client';

import { useState, KeyboardEvent, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './pplx-input.module.css';

function PplxInputComponent() {
  const [query, setQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (query.trim()) {
      window.open(`https://perplexity.ai?q=${encodeURIComponent(query)}`, '_blank');
      setQuery('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div 
      className={styles.retroInputContainer}
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      <div className={styles.retroInputWrapper}>
        <input
          type="text"
          autoFocus={isVisible}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Whats on your mind?"
          className={styles.retroInput}
        />
        <button
          onClick={handleSubmit}
          className={styles.retroButton}
          aria-label="Search"
        >
          GO
        </button>
      </div>
    </div>
  );
}

const PplxInput = dynamic(() => Promise.resolve(PplxInputComponent), {
  ssr: false
});

export default PplxInput;