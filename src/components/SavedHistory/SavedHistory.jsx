import React, { useState } from 'react';
import { Bookmark, Trash2, Copy, Check, Download, Search } from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadFile } from '../../utils/subtitleExporter';

export default function SavedHistory({ savedItems, onDeleteItem, onClearAll, onGoToGenerator }) {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filtered = savedItems.filter(item =>
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.text?.toLowerCase().includes(search.toLowerCase()) ||
    item.platform?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    confetti({ particleCount: 40, spread: 45, origin: { y: 0.6 } });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item) => {
    downloadFile(item.text, `${item.platform || 'caption'}_saved.txt`, 'text/plain');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <Bookmark size={20} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Saved Captions & History</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Your personal library of bookmarked captions and content scripts
            </p>
          </div>
        </div>

        {savedItems.length > 0 && (
          <button
            onClick={onClearAll}
            className="btn-danger"
            style={{ fontSize: '12px', padding: '8px 14px' }}
          >
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      {savedItems.length > 0 && (
        <div className="glass-panel" style={{ padding: '12px 16px', position: 'relative' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search saved captions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '38px' }}
          />
        </div>
      )}

      {/* Items List */}
      {savedItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Bookmark size={36} color="var(--text-dim)" style={{ opacity: 0.5, marginBottom: '14px' }} />
          <h4 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '8px' }}>No Saved Captions Yet</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '340px', margin: '0 auto 20px' }}>
            Whenever you generate a caption you like, click the "Save" icon to keep it stored here.
          </p>
          <button onClick={onGoToGenerator} className="btn-primary" style={{ padding: '10px 20px' }}>
            Generate a Caption Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map(item => (
            <div
              key={item.id}
              className="glass-panel"
              style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-indigo" style={{ textTransform: 'capitalize' }}>
                    {item.platform || 'General'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{item.title}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>• {item.timestamp}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleCopy(item.text, item.id)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                  >
                    {copiedId === item.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => handleDownload(item)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px' }}
                    title="Download as .txt"
                  >
                    <Download size={12} />
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="btn-danger"
                    style={{ padding: '6px 10px', fontSize: '11px' }}
                    title="Delete item"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div style={{
                fontSize: '13px',
                color: 'var(--text-main)',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '12px 14px',
                borderRadius: '8px'
              }}>
                {item.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
