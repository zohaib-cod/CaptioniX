import React, { useState } from 'react';
import { Zap, Search, Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VIRAL_HOOKS } from '../../data/sampleData';

export default function HookVault({ onUseHookInGenerator, onUseHookInVideo }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const categories = ['All', 'Curiosity Gap', 'Contrarian Take', 'Step-by-Step Value', 'Desi / Roman Urdu', 'Urgency & FOMO'];

  const filteredHooks = VIRAL_HOOKS.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.hook.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.niche.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (hookText, index) => {
    navigator.clipboard.writeText(hookText);
    setCopiedIndex(index);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
            }}>
              <Zap size={20} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Viral Hooks Vault</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Psychologically proven opening lines to stop the scroll in first 3 seconds
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-amber">{VIRAL_HOOKS.length}+ Tested Formulas</span>
          <span className="badge badge-indigo">100% Free Access</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search hooks by keyword or niche (e.g., productivity, reel, AI, freelancing)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Categories Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                background: selectedCategory === cat ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                borderColor: selectedCategory === cat ? 'var(--accent-indigo)' : 'var(--border-subtle)',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hooks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '14px' }}>
        {filteredHooks.map((item, index) => (
          <div
            key={index}
            className="glass-card"
            style={{
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px'
            }}
          >
            <div>
              {/* Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge badge-indigo">{item.category}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{item.niche}</span>
              </div>

              {/* Hook Statement */}
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                lineHeight: 1.5,
                background: 'rgba(0,0,0,0.25)',
                padding: '12px',
                borderRadius: '8px',
                borderLeft: '3px solid #f59e0b'
              }}>
                "{item.hook}"
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => handleCopy(item.hook, index)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                {copiedIndex === index ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => onUseHookInVideo(item.hook)}
                  className="btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '11px' }}
                  title="Add this hook to video subtitle line"
                >
                  <span>To Video Subtitle</span>
                </button>

                <button
                  onClick={() => onUseHookInGenerator(item.hook)}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                >
                  <span>Use in AI</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
