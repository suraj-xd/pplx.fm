'use client';

import { useState, KeyboardEvent } from 'react';
import dynamic from 'next/dynamic';
import styles from './pplx-input.module.css';

function PplxInputComponent() {
  const [query, setQuery] = useState('');

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
    <div className={styles.retroInputContainer}>
      <div className={styles.retroInputWrapper}>
        <input
          type="text"
          autoFocus
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