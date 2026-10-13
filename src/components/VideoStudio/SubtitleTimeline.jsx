import React, { useState, useRef } from 'react';
import { Clock, Plus, Trash2, Mic, Sparkles, Upload, Play, Check, AlertTriangle, ShieldCheck, Wand2, Loader2, ArrowRightLeft } from 'lucide-react';
import { formatSecondsToDisplay, parseSRT } from '../../utils/subtitleExporter';
import { cleanAndStandardizeRomanUrdu, hasUrduScript } from '../../utils/languageValidator';

export default function SubtitleTimeline({
  subtitles,
  currentTime,
  videoDuration = 15,
  uploadedVideoFile,
  onSeek,
  onUpdateSubtitle,
  onAddSubtitle,
  onDeleteSubtitle,
  onAutoTranscribe,
  onImportSRT,
  onWhisperTranscribe,
  isTranscribingWhisper,
  onFillRemaining,
  onBatchUpdateSubtitles,
  onConvertSubtitlesLanguage,
  isConvertingLanguage
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [cleanedMessage, setCleanedMessage] = useState(false);
  const fileInputRef = useRef(null);

  const [subLanguage, setSubLanguage] = useState('roman_urdu');

  // Calculate coverage of the video
  const lastSubEnd = subtitles.length > 0 ? Math.max(...subtitles.map(s => s.end)) : 0;
  const coveragePercent = Math.min(100, Math.round((lastSubEnd / Math.max(1, videoDuration)) * 100));
  const isFullyCovered = lastSubEnd >= (videoDuration - 1.0);

  const getLanguageLabel = (lang) => {
    switch (lang) {
      case 'roman_urdu': return 'Roman Urdu';
      case 'urdu': return 'اردو (Urdu)';
      case 'hindi': return 'हिन्दी (Hindi)';
      case 'hinglish': return 'Hinglish';
      case 'en': return 'English';
      default: return 'Language';
    }
  };

  // Switch language and trigger instant script conversion if subtitles exist
  const handleLanguageSelect = (newLang) => {
    setSubLanguage(newLang);
    if (onConvertSubtitlesLanguage && subtitles.length > 0) {
      onConvertSubtitlesLanguage(newLang);
    }
  };

  // Web Speech API Voice Transcription
  const handleVoiceTranscription = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser does not support Web Speech API. Please use Google Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    if (subLanguage === 'roman_urdu' || subLanguage === 'urdu') {
      recognition.lang = 'ur-PK';
    } else if (subLanguage === 'hinglish' || subLanguage === 'hindi') {
      recognition.lang = 'hi-IN';
    } else {
      recognition.lang = 'en-US';
    }

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onAddSubtitle({
          start: Math.max(0, currentTime),
          end: Math.max(0, currentTime + 3.0),
          text: subLanguage === 'roman_urdu' ? cleanAndStandardizeRomanUrdu(transcript) : transcript
        });
      }
      setIsRecording(false);
    };

    recognition.onerror = (e) => {
      console.warn("Speech recognition error:", e);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = parseSRT(event.target.result);
          if (parsed.length > 0) {
            onImportSRT(parsed);
          } else {
            alert("Could not parse SRT file. Please ensure it follows standard format.");
          }
        } catch (err) {
          alert("Error reading subtitle file.");
        }
      };
      reader.readAsText(file);
    }
  };

  // 1-Click Grammar & Spell-Check clean for all lines
  const handleBatchCleanSpellings = () => {
    const updated = subtitles.map(sub => {
      const cleaned = cleanAndStandardizeRomanUrdu(sub.text);
      const wordList = cleaned.split(/\s+/).filter(Boolean);
      const dur = (sub.end - sub.start) / Math.max(1, wordList.length);
      const updatedWords = wordList.map((w, wIdx) => ({
        word: w,
        start: sub.start + (wIdx * dur),
        end: sub.start + ((wIdx + 1) * dur)
      }));
      return { ...sub, text: cleaned, words: updatedWords };
    });
    onBatchUpdateSubtitles(updated);
    setCleanedMessage(true);
    setTimeout(() => setCleanedMessage(false), 2500);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Quick Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Subtitle Segments & Timeline</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>({subtitles.length} lines)</span>
        </div>

        {/* Subtitle Language Switcher & Instant Convert */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Script / Language:</span>
            <select
              value={subLanguage}
              onChange={(e) => handleLanguageSelect(e.target.value)}
              className="select-field"
              style={{ padding: '5px 8px', fontSize: '12px', width: 'auto', fontWeight: 600 }}
            >
              <option value="roman_urdu">🇵🇰 Roman Urdu / Urdish</option>
              <option value="urdu">🇵🇰 اردو (Nastaliq Script)</option>
              <option value="hindi">🇮🇳 हिन्दी (Hindi Devanagari)</option>
              <option value="hinglish">🇮🇳 Hinglish (Roman Hindi)</option>
              <option value="en">🌐 English</option>
            </select>
          </div>

          {/* 1-Click Script Converter Button */}
          {subtitles.length > 0 && onConvertSubtitlesLanguage && (
            <button
              onClick={() => onConvertSubtitlesLanguage(subLanguage)}
              disabled={isConvertingLanguage}
              className="btn-primary"
              style={{
                padding: '5px 12px',
                fontSize: '11px',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                whiteSpace: 'nowrap'
              }}
              title={`Convert all current subtitles to ${getLanguageLabel(subLanguage)}`}
            >
              {isConvertingLanguage ? (
                <>
                  <Loader2 size={13} className="spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft size={13} />
                  <span>Convert to {getLanguageLabel(subLanguage)}</span>
                </>
              )}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* AI Auto-Transcribe Button */}
          <button
            onClick={() => onAutoTranscribe(subLanguage)}
            className="btn-primary"
            style={{ padding: '6px 12px', fontSize: '12px', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
            title="Generate captions across full video duration"
          >
            <Sparkles size={14} />
            <span>AI Transcribe Full Video</span>
          </button>

          {/* Spell check / Normalize */}
          <button
            onClick={handleBatchCleanSpellings}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'rgba(16, 185, 129, 0.4)' }}
            title="Auto-correct spelling and formatting across all lines"
          >
            <ShieldCheck size={14} color="#10b981" />
            <span>{cleanedMessage ? 'Cleaned 100%!' : 'Spell Check & Fix'}</span>
          </button>

          {/* Voice Mic Button */}
          <button
            onClick={handleVoiceTranscription}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isRecording ? '#ef4444' : 'var(--border-subtle)',
              color: isRecording ? '#f87171' : 'var(--text-main)'
            }}
            title="Speak into mic to add caption line"
          >
            <Mic size={14} className={isRecording ? 'pulse' : ''} />
            <span>{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
          </button>

          {/* Import SRT */}
          <input
            type="file"
            accept=".srt,.vtt"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            title="Import .SRT or .VTT file"
          >
            <Upload size={14} />
            <span>Import SRT</span>
          </button>

          {/* Add New Line */}
          <button
            onClick={() => onAddSubtitle({
              start: Math.round(currentTime * 10) / 10,
              end: Math.round((currentTime + 2.5) * 10) / 10,
              text: subLanguage === 'roman_urdu'
                ? 'Naya caption yahan likhein'
                : (subLanguage === 'urdu'
                    ? 'نیا کیپشن یہاں درج کریں'
                    : (subLanguage === 'hindi' ? 'नया कैप्शन यहाँ लिखें' : 'New caption text here'))
            })}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'var(--accent-indigo)' }}
          >
            <Plus size={14} />
            <span>Add Line</span>
          </button>
        </div>
      </div>

      {/* Production Video Duration Coverage Bar */}
      <div style={{
        background: isFullyCovered ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.12)',
        border: isFullyCovered ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isFullyCovered ? (
              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={12} />
                <span>100% Video Coverage Active</span>
              </span>
            ) : (
              <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={12} />
                <span>Partial Video Coverage: {coveragePercent}%</span>
              </span>
            )}
            <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 600 }}>
              {lastSubEnd.toFixed(1)}s of {videoDuration.toFixed(1)}s covered
            </span>
          </div>

          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            Video length: {formatSecondsToDisplay(videoDuration)}
          </span>
        </div>

        {/* Progress Fill Bar */}
        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: `${coveragePercent}%`,
            height: '100%',
            background: isFullyCovered ? 'linear-gradient(90deg, #10b981, #06b6d4)' : 'linear-gradient(90deg, #f59e0b, #ef4444)',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* If not fully covered, 1-Click Auto Fill Button */}
        {!isFullyCovered && onFillRemaining && (
          <button
            onClick={() => onFillRemaining(subLanguage)}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              alignSelf: 'flex-start',
              borderColor: 'rgba(245, 158, 11, 0.5)',
              color: '#fef08a'
            }}
          >
            <Wand2 size={13} />
            <span>Fill Remaining to {videoDuration.toFixed(1)}s</span>
          </button>
        )}
      </div>

      {/* Real Speech Whisper Transcription Banner (if uploaded video present) */}
      {uploadedVideoFile && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎙️ Real Voice Transcription (Whisper AI)</span>
              <span className="badge badge-emerald">Production SaaS</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Transcribes the ACTUAL words spoken in your video and outputs in <strong>{getLanguageLabel(subLanguage)}</strong>.
            </div>
          </div>

          <button
            onClick={() => onWhisperTranscribe(subLanguage)}
            disabled={isTranscribingWhisper}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
            }}
          >
            {isTranscribingWhisper ? (
              <>
                <Loader2 size={14} className="spin" />
                <span>Transcribing & Converting...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Transcribe Video Speech ({getLanguageLabel(subLanguage)})</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Subtitles Timeline List */}
      <div style={{
        maxHeight: '340px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingRight: '6px'
      }}>
        {subtitles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-dim)', fontSize: '13px' }}>
            No subtitle lines yet. Click <strong>"AI Transcribe Full Video"</strong> or <strong>"Add Line"</strong> to start.
          </div>
        ) : (
          subtitles.map((sub, index) => {
            const isActive = currentTime >= sub.start && currentTime <= sub.end;
            const isUrduText = hasUrduScript(sub.text) || subLanguage === 'urdu';

            return (
              <div
                key={sub.id || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                  boxShadow: isActive ? '0 0 12px rgba(99, 102, 241, 0.25)' : 'none'
                }}
              >
                {/* Index & Jump button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => onSeek(sub.start)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isActive ? 'var(--accent-indigo)' : 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Jump to this segment"
                  >
                    <Play size={12} style={{ marginLeft: '1px' }} />
                  </button>
                  <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>#{index + 1}</span>
                </div>

                {/* Timing controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '135px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', width: '30px' }}>Start:</span>
                    <input
                      type="number"
                      step="0.1"
                      value={sub.start}
                      onChange={(e) => onUpdateSubtitle(sub.id, { start: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '58px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: 'var(--text-main)',
                        fontSize: '11px',
                        padding: '2px 4px',
                        fontFamily: 'monospace'
                      }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>s</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', width: '30px' }}>End:</span>
                    <input
                      type="number"
                      step="0.1"
                      value={sub.end}
                      onChange={(e) => onUpdateSubtitle(sub.id, { end: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '58px',
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: 'var(--text-main)',
                        fontSize: '11px',
                        padding: '2px 4px',
                        fontFamily: 'monospace'
                      }}
                    />
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>s</span>
                  </div>
                </div>

                {/* Subtitle text input */}
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={sub.text}
                    onChange={(e) => {
                      const newText = e.target.value;
                      const wordList = newText.split(/\s+/).filter(Boolean);
                      const dur = (sub.end - sub.start) / Math.max(1, wordList.length);
                      const updatedWords = wordList.map((w, wIdx) => ({
                        word: w,
                        start: sub.start + (wIdx * dur),
                        end: sub.start + ((wIdx + 1) * dur)
                      }));
                      onUpdateSubtitle(sub.id, { text: newText, words: updatedWords });
                    }}
                    className="input-field"
                    style={{
                      fontSize: '13px',
                      padding: '6px 10px',
                      fontFamily: isUrduText ? 'var(--font-urdu), serif' : 'inherit',
                      direction: isUrduText ? 'rtl' : 'ltr',
                      textAlign: isUrduText ? 'right' : 'left'
                    }}
                    placeholder="Enter caption text..."
                  />
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteSubtitle(sub.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  title="Delete line"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
