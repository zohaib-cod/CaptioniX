import React from 'react';
import { Sparkles, Hash, MessageSquare, Globe, Target } from 'lucide-react';
import { SOCIAL_PLATFORMS, TONE_OPTIONS, LANGUAGE_OPTIONS } from '../../data/sampleData';

export default function SocialForm({
  selectedPlatform,
  setSelectedPlatform,
  topic,
  setTopic,
  selectedTone,
  setSelectedTone,
  selectedLanguage,
  setSelectedLanguage,
  selectedCta,
  setSelectedCta,
  customKeywords,
  setCustomKeywords,
  onGenerate,
  isGenerating
}) {
  const quickTopics = [
    '3 AI tools saving 20 hours/week',
    'Why consistency beats talent every single time',
    'Freelancing mein pehla high-paying client kaisay lein',
    '5 common fitness mistakes killing your progress'
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--accent-purple)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Social Caption AI Generator</h3>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
          Craft viral hooks, structured body copy, CTAs, and smart hashtag groups
        </p>
      </div>

      {/* Platform Selector Buttons */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
          1. Select Target Social Platform
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
          {SOCIAL_PLATFORMS.map(p => {
            const isSelected = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: isSelected ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic / Idea Input */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            2. Video Summary / Post Idea
          </label>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>What is your content about?</span>
        </div>
        <textarea
          rows={3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., How to get high paying freelancing clients with cold emails, or 5 productivity habits..."
          className="textarea-field"
          style={{ resize: 'vertical' }}
        />
        {/* Quick suggestions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', alignSelf: 'center' }}>Quick Try:</span>
          {quickTopics.map((qt, idx) => (
            <button
              key={idx}
              onClick={() => setTopic(qt)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              {qt}
            </button>
          ))}
        </div>
      </div>

      {/* Tone & Style Selection */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
          3. Tone & Personality
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
          {TONE_OPTIONS.map(tone => {
            const isSelected = selectedTone === tone.id;
            return (
              <div
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? '#ffffff' : 'var(--text-main)' }}>
                  {tone.label}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>
                  {tone.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Language & CTA Controls in Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {/* Language Selector */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Language / Script
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="select-field"
          >
            {LANGUAGE_OPTIONS.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.label}</option>
            ))}
          </select>
        </div>

        {/* CTA Selector */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Primary Call to Action (CTA)
          </label>
          <select
            value={selectedCta}
            onChange={(e) => setSelectedCta(e.target.value)}
            className="select-field"
          >
            <option value="save_share">📌 Save & Share</option>
            <option value="comment">💬 Comment & Discuss</option>
            <option value="link_bio">🔗 Click Link in Bio</option>
            <option value="follow">🚀 Follow for More</option>
          </select>
        </div>
      </div>

      {/* Custom Hashtags / Keywords */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
          Custom Keywords or Niche (Optional)
        </label>
        <input
          type="text"
          value={customKeywords}
          onChange={(e) => setCustomKeywords(e.target.value)}
          placeholder="e.g. videoediting, freelancepakistan, dropshipping"
          className="input-field"
        />
      </div>

      {/* Generate Action Button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '15px',
          marginTop: '6px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
        }}
      >
        <Sparkles size={18} />
        <span>{isGenerating ? 'AI Crafting Viral Captions...' : 'Generate 3 Viral Captions Now'}</span>
      </button>
    </div>
  );
}
