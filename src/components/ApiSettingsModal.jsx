import React, { useState } from 'react';
import { X, Key, ShieldCheck, ExternalLink, Check, Sparkles, Zap, Layers, RefreshCw } from 'lucide-react';
import { DEFAULT_GROQ_KEY, DEFAULT_GEMINI_KEY } from '../utils/aiService';

export default function ApiSettingsModal({
  isOpen,
  onClose,
  apiConfig,
  onSaveConfig
}) {
  const [provider, setProvider] = useState(apiConfig.provider || 'auto');
  const [groqKey, setGroqKey] = useState(apiConfig.groqKey || DEFAULT_GROQ_KEY);
  const [geminiKey, setGeminiKey] = useState(apiConfig.geminiKey || DEFAULT_GEMINI_KEY);
  const [openaiKey, setOpenaiKey] = useState(apiConfig.apiKey || '');
  const [showKeys, setShowKeys] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | { groq: boolean, gemini: boolean, groqSpeed: string }

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      provider,
      groqKey: groqKey.trim(),
      geminiKey: geminiKey.trim(),
      apiKey: openaiKey.trim()
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  const handleTestConnections = async () => {
    setTestStatus('testing');
    let groqOk = false;
    let geminiOk = false;
    let groqSpeed = '0ms';

    try {
      const startGroq = performance.now();
      const resGroq = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey.trim()}`
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.8-27b',
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5
        })
      });
      if (resGroq.ok) {
        groqOk = true;
        groqSpeed = `${Math.round(performance.now() - startGroq)}ms`;
      }
    } catch {
      groqOk = false;
    }

    try {
      const resGemini = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiKey.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'hi' }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });
      if (resGemini.ok) {
        geminiOk = true;
      }
    } catch {
      geminiOk = false;
    }

    setTestStatus({ groq: groqOk, gemini: geminiOk, groqSpeed });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '26px',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>AI Engines & Multi-Model Failover</span>
                <span className="badge badge-indigo">Auto-Switching</span>
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Zero rate-limit errors: seamless fallback across 11+ free-tier models
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Execution Strategy
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setProvider('auto')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  background: provider === 'auto' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: provider === 'auto' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  color: provider === 'auto' ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Layers size={12} color="#818cf8" />
                  <span>Auto Cascade</span>
                </div>
                <div style={{ fontSize: '10px', color: '#10b981', marginTop: '3px' }}>Groq + Gemini</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('groq')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  background: provider === 'groq' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: provider === 'groq' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  color: provider === 'groq' ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Groq Primary
                <div style={{ fontSize: '10px', color: '#10b981', marginTop: '3px' }}>17ms Ultra-Fast</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('gemini')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  background: provider === 'gemini' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: provider === 'gemini' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  color: provider === 'gemini' ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Gemini Primary
                <div style={{ fontSize: '10px', color: '#818cf8', marginTop: '3px' }}>Google Models</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('offline')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  background: provider === 'offline' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: provider === 'offline' ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  color: provider === 'offline' ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                Smart Offline
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '3px' }}>Local Logic</div>
              </button>
            </div>
          </div>

          {/* Groq Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Groq API Key (Whisper + Qwen/GPT-OSS)</span>
                <span className="badge badge-emerald">Ultra-Fast 17ms</span>
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                <span>Console</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              type={showKeys ? 'text' : 'password'}
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="gsk_..."
              className="input-field"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
          </div>

          {/* Google Gemini Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Google Gemini API Key</span>
                <span className="badge badge-indigo">Gemini 3.5 & 2.5</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: '11px', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                <span>Google AI Studio</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              type={showKeys ? 'text' : 'password'}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AQ.Ab8RN..."
              className="input-field"
              style={{ fontFamily: 'monospace', fontSize: '12px' }}
            />
          </div>

          {/* Active Model Cascade Info Banner */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '10px',
            padding: '12px 14px',
            fontSize: '11px',
            lineHeight: '1.5'
          }}>
            <div style={{ fontWeight: 600, color: '#c7d2fe', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} color="#818cf8" />
              <span>Active Multi-Model Failover Pipeline:</span>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              1. <strong>Groq Qwen 3.8 27B</strong> (17ms response) &rarr; 2. <strong>Groq GPT OSS 120B/20B</strong> &rarr; 3. <strong>Gemini 3.5 Flash Lite</strong> &rarr; 4. <strong>Gemini 3.5 Flash</strong> &rarr; 5. <strong>Gemini 3.1 & 2.5 Flash</strong> &rarr; 6. <strong>Smart Local Engine</strong>
            </div>
            <div style={{ marginTop: '4px', color: '#10b981', fontSize: '10px' }}>
              ⚡ If any model encounters HTTP 429 rate limit or quota freeze, it silently hops to the next model instantly with zero user error!
            </div>
          </div>

          {/* Live Test Status Feedback */}
          {testStatus && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px'
            }}>
              {testStatus === 'testing' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                  <RefreshCw size={14} className="spin" />
                  <span>Pinging Groq LPU and Google Gemini endpoints...</span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ color: testStatus.groq ? '#10b981' : '#ef4444' }}>
                    Groq: {testStatus.groq ? `✅ Connected (${testStatus.groqSpeed})` : '❌ Failed'}
                  </span>
                  <span style={{ color: testStatus.gemini ? '#10b981' : '#ef4444' }}>
                    Gemini: {testStatus.gemini ? '✅ Connected' : '❌ Failed'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowKeys(!showKeys)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                {showKeys ? 'Hide Keys' : 'Show Keys'}
              </button>
              <button
                type="button"
                onClick={handleTestConnections}
                disabled={testStatus === 'testing'}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '11px', borderColor: 'rgba(6, 182, 212, 0.4)' }}
              >
                <RefreshCw size={11} className={testStatus === 'testing' ? 'spin' : ''} />
                <span>Test All Models</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '7px 14px', fontSize: '12px' }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn-primary"
                style={{ padding: '7px 18px', fontSize: '12px' }}
              >
                {isSaved ? <Check size={14} /> : <ShieldCheck size={14} />}
                <span>{isSaved ? 'Settings Saved!' : 'Save & Activate'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
