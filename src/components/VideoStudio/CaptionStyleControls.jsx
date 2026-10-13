import React, { useState } from 'react';
import { Palette, Type, MoveVertical, Sparkles, RotateCcw, LayoutGrid, Zap, Filter } from 'lucide-react';

export default function CaptionStyleControls({
  stylesList,
  activeStyle,
  onSelectStyle,
  onUpdateActiveStyle,
  wordsPerScreen = 'all',
  onChangeWordsPerScreen,
  onResetDefault
}) {
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'kalakar' | 'creator' | 'cinematic'

  const COLOR_PALETTE = [
    { label: 'Yellow', value: '#facc15' },
    { label: 'Cyan', value: '#38bdf8' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Amber', value: '#fbbf24' },
    { label: 'Rose', value: '#fb7185' },
    { label: 'Purple', value: '#c084fc' },
    { label: 'White', value: '#ffffff' },
    { label: 'Electric Blue', value: '#06b6d4' }
  ];

  const FONTS = [
    { label: 'Montserrat (Bold / Hormozi / Bubble)', value: 'Montserrat' },
    { label: 'Outfit (Modern / MrBeast)', value: 'Outfit' },
    { label: 'Cinzel (Luxury / Iman Gadzhi)', value: 'Cinzel' },
    { label: 'Space Grotesk (Tech / Varun Mayya)', value: 'Space Grotesk' },
    { label: 'Plus Jakarta Sans (Minimal / Skool / Apple)', value: 'Plus Jakarta Sans' },
    { label: 'Bebas Neue (Tall / Cyberpunk)', value: 'Bebas Neue' },
    { label: 'Inter (Clean / Netflix)', value: 'Inter' }
  ];

  const WORD_PACING_OPTIONS = [
    { id: 'all', label: '🌟 Full Line', desc: 'Standard full sentence with active highlight (Default)', badge: 'Default' },
    { id: '1', label: '⚡ 1 Word', desc: 'Rapid-fire 1 punch word at a time (Hormozi / retention style)', badge: 'Viral' },
    { id: '2', label: '🔥 2 Words', desc: 'Punchy 2-word dynamic chunks', badge: 'Popular' },
    { id: '3', label: '🎬 3 Words', desc: 'CapCut classic 3-word pacing', badge: 'Reels' },
    { id: '4', label: '📝 4 Words', desc: 'Balanced 4-word readable chunks' },
    { id: '5', label: '📄 5 Words', desc: 'Short readable phrase chunks' }
  ];

  // Filter templates by category
  const filteredStyles = stylesList.filter(st => {
    if (selectedCategory === 'all') return true;
    return st.category === selectedCategory;
  });

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header with Reset Default Button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={18} color="var(--accent-indigo)" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Caption Templates & Styling</h3>
          <span className="badge badge-indigo">{stylesList.length} Presets</span>
        </div>

        {onResetDefault && (
          <button
            onClick={onResetDefault}
            className="btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '11px',
              borderColor: 'rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#fef08a',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700
            }}
            title="Reset styling and pacing back to default Hormozi Pop"
          >
            <RotateCcw size={13} />
            <span>↺ Reset to Default</span>
          </button>
        )}
      </div>

      {/* Category Tabs: All, Kalakar & Desi, Viral Creators, Cinematic */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
        {[
          { id: 'all', label: `🌟 All (${stylesList.length})` },
          { id: 'kalakar', label: `✨ Kalakar & Desi (${stylesList.filter(s => s.category === 'kalakar').length})` },
          { id: 'creator', label: `🎬 Creators (${stylesList.filter(s => s.category === 'creator').length})` },
          { id: 'cinematic', label: `📽️ Cinematic (${stylesList.filter(s => s.category === 'cinematic').length})` }
        ].map(cat => {
          const isCatActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: isCatActive ? 700 : 500,
                background: isCatActive ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: isCatActive ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                color: isCatActive ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Preset Style Cards Grid (23 Presets) */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
          Select Template ({filteredStyles.length} Available)
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
          gap: '10px',
          maxHeight: '280px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {filteredStyles.map(st => {
            const isSelected = activeStyle.id === st.id;
            return (
              <div
                key={st.id}
                onClick={() => onSelectStyle(st)}
                className="glass-card"
                style={{
                  padding: '12px 10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  borderColor: isSelected ? 'var(--accent-indigo)' : 'var(--border-subtle)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.22)' : 'var(--bg-card)',
                  boxShadow: isSelected ? '0 0 16px rgba(99, 102, 241, 0.4)' : 'none',
                  position: 'relative',
                  transition: 'all 0.15s ease',
                  borderWidth: isSelected ? '2px' : '1px'
                }}
              >
                {st.isDefault && (
                  <span
                    className="badge badge-emerald"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      fontSize: '8px',
                      padding: '1px 4px'
                    }}
                  >
                    Default
                  </span>
                )}
                {st.category === 'kalakar' && !st.isDefault && (
                  <span
                    className="badge badge-amber"
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      fontSize: '8px',
                      padding: '1px 4px'
                    }}
                  >
                    Desi
                  </span>
                )}
                <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? '#ffffff' : 'var(--text-main)', marginBottom: '4px', marginTop: (st.isDefault || st.category === 'kalakar') ? '6px' : '0' }}>
                  {st.name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', lineHeight: 1.3 }}>
                  {st.description.slice(0, 48)}...
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Words Displayed at a Time (Words Per Screen Control) */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.08)',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid rgba(99, 102, 241, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={15} color="#facc15" />
            <span>Words Displayed at a Time</span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#818cf8', fontWeight: 700 }}>
              {wordsPerScreen === 'all' ? 'Full Line (Default)' : `${wordsPerScreen} Word${wordsPerScreen > 1 ? 's' : ''}`}
            </span>
            {wordsPerScreen !== 'all' && (
              <button
                type="button"
                onClick={() => onChangeWordsPerScreen && onChangeWordsPerScreen('all')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fef08a',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
          {WORD_PACING_OPTIONS.map(opt => {
            const isOptSelected = String(wordsPerScreen) === String(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeWordsPerScreen && onChangeWordsPerScreen(opt.id)}
                style={{
                  padding: '10px 4px',
                  borderRadius: '8px',
                  background: isOptSelected ? 'rgba(99, 102, 241, 0.35)' : 'rgba(255, 255, 255, 0.04)',
                  border: isOptSelected ? '1.5px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  color: isOptSelected ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: isOptSelected ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
                title={opt.desc}
              >
                <div>{opt.label}</div>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
          <p style={{ fontSize: '10px', color: 'var(--text-dim)', margin: 0 }}>
            💡 <em>Pacing Guide:</em> <strong>"1 Word"</strong> for Hormozi viral retention, <strong>"3 Words"</strong> for CapCut reels, or <strong>"Full Line"</strong> for standard!
          </p>
        </div>
      </div>

      {/* Customization Sliders & Selectors */}
      <div style={{
        background: 'rgba(15, 20, 34, 0.5)',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Font Family */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Typography Font
          </label>
          <select
            value={activeStyle.fontFamily || 'Montserrat'}
            onChange={(e) => onUpdateActiveStyle({ fontFamily: e.target.value })}
            className="select-field"
          >
            {FONTS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Font Size Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Text Size
            </label>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--accent-indigo)' }}>
              {activeStyle.fontSize || 24}px
            </span>
          </div>
          <input
            type="range"
            min="16"
            max="48"
            value={activeStyle.fontSize || 24}
            onChange={(e) => onUpdateActiveStyle({ fontSize: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-indigo)', cursor: 'pointer' }}
          />
        </div>

        {/* Position Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Vertical Position
            </label>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--accent-indigo)' }}>
              {activeStyle.position || 75}%
            </span>
          </div>
          <input
            type="range"
            min="15"
            max="88"
            value={activeStyle.position || 75}
            onChange={(e) => onUpdateActiveStyle({ position: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-indigo)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <button
              onClick={() => onUpdateActiveStyle({ position: 20 })}
              className="btn-secondary"
              style={{ padding: '3px 8px', fontSize: '10px' }}
            >
              Top (20%)
            </button>
            <button
              onClick={() => onUpdateActiveStyle({ position: 50 })}
              className="btn-secondary"
              style={{ padding: '3px 8px', fontSize: '10px' }}
            >
              Center (50%)
            </button>
            <button
              onClick={() => onUpdateActiveStyle({ position: 75 })}
              className="btn-secondary"
              style={{ padding: '3px 8px', fontSize: '10px' }}
            >
              Bottom (75%)
            </button>
          </div>
        </div>

        {/* Active Word Highlight Color */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Active Word Highlight Color
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {COLOR_PALETTE.map(c => (
              <div
                key={c.value}
                onClick={() => onUpdateActiveStyle({ activeColor: c.value })}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: c.value,
                  cursor: 'pointer',
                  border: activeStyle.activeColor === c.value ? '2px solid #ffffff' : '2px solid transparent',
                  boxShadow: activeStyle.activeColor === c.value ? '0 0 10px ' + c.value : 'none',
                  transition: 'transform 0.15s ease'
                }}
                title={c.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
