import React, { useState } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Share2, Repeat2, ThumbsUp } from 'lucide-react';

export default function SocialPreviewMockup({ captionText, selectedPlatform }) {
  const [activeMockupTab, setActiveMockupTab] = useState(selectedPlatform || 'instagram');
  const [expanded, setExpanded] = useState(false);

  const displayText = captionText || "Your generated caption will appear here in real-time. Select a variation or click 'Live Mockup' to preview how your hook, body, and hashtags render.";

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Device Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Live Social Media Mockup</h4>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Simulate real viewer experience</span>
        </div>

        {/* Mockup tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px' }}>
          {['instagram', 'tiktok', 'linkedin', 'twitter'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveMockupTab(tab)}
              style={{
                background: activeMockupTab === tab ? 'var(--accent-indigo)' : 'transparent',
                border: 'none',
                color: activeMockupTab === tab ? '#fff' : 'var(--text-dim)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'twitter' ? 'X / Twitter' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Mockup Canvas Container */}
      <div style={{
        background: 'rgba(5, 7, 12, 0.7)',
        borderRadius: '16px',
        padding: '24px 16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '440px',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Instagram Mockup */}
        {activeMockupTab === 'instagram' && (
          <div className="ig-post-card" style={{ width: '100%' }}>
            {/* Post Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                  padding: '2px'
                }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                    CX
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    captionix_creator
                    <span style={{ color: '#38bdf8', fontSize: '10px' }}>✓</span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Original Audio</div>
                </div>
              </div>
              <MoreHorizontal size={16} color="var(--text-muted)" />
            </div>

            {/* Post Media Area */}
            <div style={{
              height: '240px',
              background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                fontFamily: 'var(--font-montserrat)',
                fontSize: '18px',
                fontWeight: 900,
                color: '#ffffff',
                textTransform: 'uppercase',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)'
              }}>
                {displayText.split('\n')[0].slice(0, 75)}...
              </div>
              <div style={{
                marginTop: '12px',
                background: 'rgba(250, 204, 21, 0.9)',
                color: '#000',
                fontWeight: 800,
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px'
              }}>
                WATCH FULL REEL ⚡
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '14px' }}>
                <Heart size={20} color="#ff3040" fill="#ff3040" />
                <MessageCircle size={20} color="#ffffff" />
                <Send size={20} color="#ffffff" />
              </div>
              <Bookmark size={20} color="#ffffff" />
            </div>

            {/* Likes & Caption Text */}
            <div style={{ padding: '0 14px 14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>14,892 likes</div>
              <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                <strong style={{ marginRight: '6px' }}>captionix_creator</strong>
                <span>
                  {expanded ? displayText : `${displayText.slice(0, 110)}... `}
                </span>
                {displayText.length > 110 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                  >
                    {expanded ? 'less' : 'more'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TikTok Mockup */}
        {activeMockupTab === 'tiktok' && (
          <div className="tiktok-card">
            {/* TikTok Video Overlay Simulation */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at center, #1e293b 0%, #030712 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '16px',
              color: '#ffffff'
            }}>
              {/* Right Side Buttons */}
              <div style={{
                position: 'absolute',
                right: '12px',
                bottom: '100px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'center'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={20} fill="#f43f5e" color="#f43f5e" />
                  </div>
                  <span style={{ fontSize: '10px', marginTop: '2px', display: 'block' }}>84.2K</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={20} />
                  </div>
                  <span style={{ fontSize: '10px', marginTop: '2px', display: 'block' }}>1,290</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bookmark size={20} />
                  </div>
                  <span style={{ fontSize: '10px', marginTop: '2px', display: 'block' }}>18.4K</span>
                </div>
              </div>

              {/* Bottom Creator Info & Caption */}
              <div style={{ maxWidth: '230px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '6px' }}>@growth_master</div>
                <div style={{ fontSize: '12px', lineHeight: 1.4, color: '#f1f5f9' }}>
                  {displayText.slice(0, 120)}...
                </div>
                <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '6px', fontWeight: 600 }}>
                  🎵 Original Sound - viral_audio
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LinkedIn Mockup */}
        {activeMockupTab === 'linkedin' && (
          <div style={{
            maxWidth: '460px',
            width: '100%',
            background: '#1b222d',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#0a66c2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                CX
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>CaptioniX AI Founder</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Building the future of short-form media • 2h</div>
              </div>
            </div>

            <div style={{ fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '14px' }}>
              {expanded ? displayText : `${displayText.slice(0, 160)}... `}
              {displayText.length > 160 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  style={{ background: 'none', border: 'none', color: '#0a66c2', fontWeight: 600, cursor: 'pointer' }}
                >
                  {expanded ? 'see less' : '...see more'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><ThumbsUp size={15} /> Like</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><MessageCircle size={15} /> Comment</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><Repeat2 size={15} /> Repost</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><Send size={15} /> Send</span>
            </div>
          </div>
        )}

        {/* Twitter Mockup */}
        {activeMockupTab === 'twitter' && (
          <div style={{
            maxWidth: '460px',
            width: '100%',
            background: '#000000',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1d9bf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                𝕏
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>CaptioniX</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>@captionix_app · 18m</span>
                </div>
                <div style={{ fontSize: '14px', lineHeight: 1.5, marginTop: '8px', whiteSpace: 'pre-line' }}>
                  {displayText.slice(0, 280)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', color: 'var(--text-dim)', maxWidth: '340px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><MessageCircle size={15} /> 48</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><Repeat2 size={15} /> 124</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><Heart size={15} /> 890</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}><Share2 size={15} /></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
