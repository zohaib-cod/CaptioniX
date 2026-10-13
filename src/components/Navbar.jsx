import React from 'react';
import { Video, Sparkles, Zap, Bookmark, Layers } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, savedCount, onOpenSettings }) {
  const tabs = [
    { id: 'video', label: 'Video Subtitles Studio', icon: Video, badge: 'Reels / CapCut' },
    { id: 'social', label: 'Social AI Captions', icon: Sparkles, badge: 'Viral Post AI' },
    { id: 'hooks', label: 'Viral Hooks Vault', icon: Zap, badge: '50+ Hooks' },
    { id: 'saved', label: 'Saved History', icon: Bookmark, badge: savedCount > 0 ? String(savedCount) : null }
  ];

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 13, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('video')}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
          }}>
            <Layers size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(to right, #ffffff, #c7d2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                CaptioniX
              </span>
              <span className="badge badge-indigo">Studio AI</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.2px' }}>
              Video Subtitles & Viral Social Post Studio
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 20, 34, 0.8)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      color: isActive ? '#ffffff' : 'var(--text-dim)'
                    }}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* AI Settings Button */}
          <button
            onClick={onOpenSettings}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '12px', gap: '6px' }}
            title="Configure Gemini or OpenAI API Key"
          >
            <span style={{ fontSize: '14px' }}>⚙️</span>
            <span>AI Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
