import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Upload, Sparkles, Smartphone, Monitor, Square } from 'lucide-react';
import { formatSecondsToDisplay } from '../../utils/subtitleExporter';

export default function VideoPlayer({
  videoUrl,
  subtitles,
  activeStyle,
  currentTime,
  setCurrentTime,
  isPlaying,
  setIsPlaying,
  aspectRatio,
  setAspectRatio,
  onUploadVideo,
  sampleVideos,
  onSelectSampleVideo,
  selectedSampleId,
  onDurationChange,
  wordsPerScreen = 'all'
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [duration, setDuration] = useState(15);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const fileInputRef = useRef(null);

  // Sync play/pause with parent state
  useEffect(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.play().catch(e => {
        console.warn("Autoplay prevented:", e);
        setIsPlaying(false);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Handle video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration && (!duration || duration === 15)) {
        setDuration(videoRef.current.duration);
        if (onDurationChange) onDurationChange(videoRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 15;
      setDuration(dur);
      if (onDurationChange) {
        onDurationChange(dur);
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Find currently active subtitle
  const activeSubtitle = subtitles.find(
    sub => currentTime >= sub.start && currentTime <= sub.end
  );

  // Calculate container aspect ratio dimensions
  const getAspectStyles = () => {
    switch (aspectRatio) {
      case '9:16':
        return { width: '310px', height: '550px' };
      case '1:1':
        return { width: '420px', height: '420px' };
      case '16:9':
      default:
        return { width: '560px', height: '315px' };
    }
  };

  const aspectDims = getAspectStyles();

  return (
    <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Bar: Aspect Ratio & Preset Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* Preset Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>PRESETS:</span>
          {sampleVideos.map(sv => (
            <button
              key={sv.id}
              onClick={() => onSelectSampleVideo(sv)}
              style={{
                background: selectedSampleId === sv.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: selectedSampleId === sv.id ? '1px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                color: selectedSampleId === sv.id ? '#ffffff' : 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {sv.title}
            </button>
          ))}
        </div>

        {/* Upload Custom Video */}
        <div>
          <input
            type="file"
            accept="video/*"
            ref={fileInputRef}
            onChange={onUploadVideo}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            <Upload size={14} />
            <span>Upload Video</span>
          </button>
        </div>
      </div>

      {/* Aspect Ratio Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <button
          onClick={() => setAspectRatio('9:16')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: aspectRatio === '9:16' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: aspectRatio === '9:16' ? '1px solid var(--accent-indigo)' : '1px solid transparent',
            color: aspectRatio === '9:16' ? '#fff' : 'var(--text-dim)',
            cursor: 'pointer'
          }}
        >
          <Smartphone size={14} /> 9:16 Reel / TikTok
        </button>
        <button
          onClick={() => setAspectRatio('16:9')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: aspectRatio === '16:9' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: aspectRatio === '16:9' ? '1px solid var(--accent-indigo)' : '1px solid transparent',
            color: aspectRatio === '16:9' ? '#fff' : 'var(--text-dim)',
            cursor: 'pointer'
          }}
        >
          <Monitor size={14} /> 16:9 YouTube
        </button>
        <button
          onClick={() => setAspectRatio('1:1')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: aspectRatio === '1:1' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: aspectRatio === '1:1' ? '1px solid var(--accent-indigo)' : '1px solid transparent',
            color: aspectRatio === '1:1' ? '#fff' : 'var(--text-dim)',
            cursor: 'pointer'
          }}
        >
          <Square size={14} /> 1:1 Square Post
        </button>
      </div>

      {/* Video Viewport Container */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px 0'
      }}>
        <div
          ref={containerRef}
          style={{
            width: aspectDims.width,
            height: aspectDims.height,
            position: 'relative',
            background: '#05070a',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Main Video Element */}
          <video
            ref={videoRef}
            src={videoUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            playsInline
            loop
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
          />

              {/* Subtitles Overlay */}
          {activeSubtitle && (
            <div
              className={`caption-overlay ${activeStyle.className || ''}`}
              style={{
                top: `${activeStyle.position || 75}%`,
                fontSize: `${activeStyle.fontSize || 24}px`,
                fontFamily: `var(--font-${activeStyle.fontFamily?.toLowerCase().replace(/\s+/g, '') || 'sans'}), sans-serif`,
                textTransform: activeStyle.textTransform || 'none'
              }}
            >
              {(() => {
                let allWords = activeSubtitle.words && activeSubtitle.words.length > 0 ? activeSubtitle.words : null;
                if (!allWords) {
                  const text = activeSubtitle.text || '';
                  const wordList = text.trim().split(/\s+/).filter(Boolean);
                  const dur = Math.max(0.15, (activeSubtitle.end - activeSubtitle.start) / Math.max(1, wordList.length));
                  allWords = wordList.map((w, wIdx) => ({
                    word: w,
                    start: Math.round((activeSubtitle.start + (wIdx * dur)) * 100) / 100,
                    end: Math.round((activeSubtitle.start + ((wIdx + 1) * dur)) * 100) / 100
                  }));
                }

                if (allWords.length === 0) {
                  return <span className="regular-word">{activeSubtitle.text}</span>;
                }

                let visibleWords = allWords;
                if (wordsPerScreen && wordsPerScreen !== 'all') {
                  const chunkSize = parseInt(wordsPerScreen, 10);
                  if (!isNaN(chunkSize) && chunkSize > 0) {
                    const chunks = [];
                    for (let i = 0; i < allWords.length; i += chunkSize) {
                      chunks.push(allWords.slice(i, i + chunkSize));
                    }
                    const activeChunk = chunks.find(c => currentTime >= c[0].start && currentTime <= c[c.length - 1].end);
                    if (activeChunk) {
                      visibleWords = activeChunk;
                    } else {
                      const past = chunks.filter(c => currentTime >= c[0].start);
                      visibleWords = past.length > 0 ? past[past.length - 1] : chunks[0];
                    }
                  }
                }

                return visibleWords.map((w, idx) => {
                  const isWordActive = currentTime >= w.start && currentTime <= w.end;
                  return (
                    <span
                      key={idx}
                      className={isWordActive ? 'active-word' : 'regular-word'}
                      style={{
                        margin: '0 4px',
                        display: 'inline-block',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      {w.word}
                    </span>
                  );
                });
              })()}
            </div>
          )}

          {/* Big Center Play Button Overlay when paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.85)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 30px rgba(99, 102, 241, 0.6)',
                transition: 'all 0.2s ease',
                zIndex: 20
              }}
            >
              <Play size={28} color="#ffffff" style={{ marginLeft: '4px' }} />
            </div>
          )}
        </div>
      </div>

      {/* Video Control Bar */}
      <div style={{
        background: 'rgba(15, 20, 34, 0.6)',
        borderRadius: '12px',
        padding: '12px 16px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Scrubber slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)', minWidth: '40px' }}>
            {formatSecondsToDisplay(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 15}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            style={{
              flex: 1,
              accentColor: 'var(--accent-indigo)',
              height: '5px',
              borderRadius: '9999px',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-dim)', minWidth: '40px', textAlign: 'right' }}>
            {formatSecondsToDisplay(duration)}
          </span>
        </div>

        {/* Buttons: Play, Restart, Volume, Speed */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={togglePlay}
              className="btn-primary"
              style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
            </button>

            <button
              onClick={handleRestart}
              className="btn-secondary"
              style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
              title="Restart"
            >
              <RotateCcw size={15} />
            </button>

            <button
              onClick={toggleMute}
              className="btn-secondary"
              style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>

          {/* Speed Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Speed:</span>
            {[0.75, 1, 1.25, 1.5].map(speed => (
              <button
                key={speed}
                onClick={() => handleSpeedChange(speed)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 'none',
                  background: playbackSpeed === speed ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                  color: playbackSpeed === speed ? '#a5b4fc' : 'var(--text-dim)',
                  cursor: 'pointer'
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
