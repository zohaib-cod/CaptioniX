import React, { useState } from 'react';
import { Copy, Check, Bookmark, Eye, Edit3, Sparkles, Hash } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GeneratedCaptions({
  captions,
  selectedPlatform,
  onSaveToHistory,
  onSelectForPreview,
  activePreviewCaption
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [savedIndex, setSavedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSave = (variant, index) => {
    onSaveToHistory({
      id: `saved-${Date.now()}-${index}`,
      platform: selectedPlatform,
      title: variant.title,
      text: variant.fullText,
      timestamp: new Date().toLocaleString()
    });
    setSavedIndex(index);
    setTimeout(() => setSavedIndex(null), 2000);
  };

  if (!captions || captions.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
        <Sparkles size={32} color="var(--accent-indigo)" style={{ marginBottom: '12px', opacity: 0.7 }} />
        <h4 style={{ color: 'var(--text-main)', fontSize: '16px', marginBottom: '6px' }}>Ready to Generate Viral Captions</h4>
        <p style={{ fontSize: '13px', maxWidth: '380px', margin: '0 auto' }}>
          Select your platform, enter your video topic, and click "Generate" to receive 3 tailored variations with hooks and hashtags.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Generated Variations</span>
          <span className="badge badge-emerald">{captions.length} Options Ready</span>
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Click 'Live Mockup' to preview on mobile screen</span>
      </div>

      {captions.map((variant, index) => {
        const isPreviewing = activePreviewCaption === variant.fullText;
        const charCount = variant.fullText.length;
        const hashtagCount = (variant.hashtags.match(/#/g) || []).length;

        return (
          <div
            key={index}
            className="glass-panel"
            style={{
              padding: '20px',
              border: isPreviewing ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
              boxShadow: isPreviewing ? '0 0 20px rgba(99, 102, 241, 0.25)' : 'var(--shadow-card)',
              position: 'relative'
            }}
          >
            {/* Header / Variant Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{variant.title}</span>
                <span className="badge badge-indigo">{charCount} chars</span>
                <span className="badge badge-amber">{hashtagCount} tags</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Live Mockup */}
                <button
                  onClick={() => onSelectForPreview(variant.fullText)}
                  className="btn-secondary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    background: isPreviewing ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: isPreviewing ? 'var(--accent-indigo)' : 'var(--border-subtle)',
                    color: isPreviewing ? '#ffffff' : 'var(--text-muted)'
                  }}
                  title="View how this looks in live mobile card"
                >
                  <Eye size={13} />
                  <span>{isPreviewing ? 'Active in Mockup' : 'Live Mockup'}</span>
                </button>

                {/* Save */}
                <button
                  onClick={() => handleSave(variant, index)}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                  title="Save to favorites"
                >
                  <Bookmark size={13} color={savedIndex === index ? '#10b981' : 'currentColor'} />
                  <span>{savedIndex === index ? 'Saved!' : 'Save'}</span>
                </button>

                {/* Copy */}
                <button
                  onClick={() => handleCopy(variant.fullText, index)}
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '11px' }}
                >
                  {copiedIndex === index ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedIndex === index ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Hook Highlight Box */}
            <div style={{
              background: 'rgba(99, 102, 241, 0.1)',
              borderLeft: '3px solid var(--accent-indigo)',
              padding: '10px 14px',
              borderRadius: '0 8px 8px 0',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--accent-indigo)', letterSpacing: '0.5px', marginBottom: '2px' }}>
                Attention-Grabbing Hook
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
                {variant.hook}
              </div>
            </div>

            {/* Body Text */}
            <div style={{
              fontSize: '13px',
              color: 'var(--text-main)',
              lineHeight: 1.6,
              whiteSpace: 'pre-line',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '12px 14px',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              {variant.body}
            </div>

            {/* CTA */}
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#38bdf8',
              marginBottom: '12px',
              background: 'rgba(6, 182, 212, 0.08)',
              padding: '8px 12px',
              borderRadius: '6px'
            }}>
              {variant.cta}
            </div>

            {/* Hashtags */}
            <div style={{
              fontSize: '11px',
              color: '#818cf8',
              lineHeight: 1.6,
              wordBreak: 'break-word',
              background: 'rgba(15, 23, 42, 0.4)',
              padding: '8px 12px',
              borderRadius: '6px'
            }}>
              {variant.hashtags}
            </div>
          </div>
        );
      })}
    </div>
  );
}
