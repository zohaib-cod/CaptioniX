import React, { useState } from 'react';
import { X, Download, FileText, Video, Copy, Check, Sparkles, Loader2, Info, Layers, MonitorPlay, Minimize2, Maximize2, Minus, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateSRT, generateVTT, downloadFile } from '../../utils/subtitleExporter';
import { fixWebmDuration } from '../../utils/webmDurationFixer';

export default function VideoExportModal({
  isOpen,
  onClose,
  subtitles,
  activeStyle,
  videoUrl,
  aspectRatio,
  wordsPerScreen = 'all',
  videoDuration = 15,
  uploadedVideoFile = null
}) {

  const [copied, setCopied] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [burnProgress, setBurnProgress] = useState(0);
  const [burnStatus, setBurnStatus] = useState('');
  const [exportMode, setExportMode] = useState('original'); // 'original' | 'capcut_transparent' | '1080p' | '4k_full' | '720p' | 'capcut_green' | '4k_transparent'
  const [detectedResolution, setDetectedResolution] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const cancelRef = React.useRef(false);

  // Probe native video dimensions so user sees exact upload resolution
  React.useEffect(() => {
    if (!isOpen || !videoUrl) return;
    const probe = document.createElement('video');
    probe.src = videoUrl;
    probe.onloadedmetadata = () => {
      const w = probe.videoWidth;
      const h = probe.videoHeight;
      if (w && h) {
        let tag = '1080p';
        if (w >= 3840 || h >= 3840) tag = '4K UHD';
        else if (w >= 2160 || h >= 2160) tag = '4K';
        else if (w >= 1920 || h >= 1920) tag = '1080p FHD';
        else if (w >= 1280 || h >= 1280) tag = '720p HD';
        else tag = `${w}x${h}`;
        setDetectedResolution({ width: w, height: h, tag });
      }
    };
  }, [isOpen, videoUrl]);


  if (!isOpen) return null;

  const handleCancelBurn = () => {
    cancelRef.current = true;
    setIsBurning(false);
    setBurnProgress(0);
    setBurnStatus('Cancelled');
  };

  const handleDownloadSRT = () => {
    const srt = generateSRT(subtitles);
    downloadFile(srt, 'captions_export.srt', 'text/plain');
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  const handleDownloadVTT = () => {
    const vtt = generateVTT(subtitles);
    downloadFile(vtt, 'captions_export.vtt', 'text/vtt');
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
  };

  const handleCopyText = () => {
    const text = subtitles.map(s => s.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Burn-in Captions or Render 4K Transparent Alpha Overlay
  const handleRenderVideo = async () => {
    cancelRef.current = false;
    setIsBurning(true);
    setBurnProgress(2);
    setBurnStatus('Initializing video encoder...');

    try {
      // Must stay within viewport coordinates so Chromium compositor NEVER throttles requestVideoFrameCallback
      const offscreenDiv = document.createElement('div');
      offscreenDiv.style.cssText = 'position:fixed;bottom:2px;right:2px;width:4px;height:4px;opacity:0.01;pointer-events:none;z-index:99999;overflow:hidden;';
      document.body.appendChild(offscreenDiv);

      const video = document.createElement('video');
      if (!videoUrl.startsWith('blob:')) {
        video.crossOrigin = 'anonymous';
      }
      video.src = videoUrl;
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      offscreenDiv.appendChild(video);

      await new Promise((resolve, reject) => {
        if (video.readyState >= 2) {
          resolve();
          return;
        }
        let settled = false;
        const onReady = () => {
          if (!settled) {
            settled = true;
            video.removeEventListener('loadeddata', onReady);
            video.removeEventListener('canplay', onReady);
            resolve();
          }
        };
        video.addEventListener('loadeddata', onReady);
        video.addEventListener('canplay', onReady);
        video.onerror = () => {
          if (!settled) {
            settled = true;
            reject(new Error(video.error ? video.error.message : 'Video could not be loaded. Please ensure the video link is accessible or upload a local file.'));
          }
        };
        video.load();
        setTimeout(() => {
          if (!settled) {
            settled = true;
            if (video.readyState < 2) {
              reject(new Error("Video could not be loaded (network timeout or CORS restricted)."));
            } else {
              resolve();
            }
          }
        }, 8000);
      });

      // Resolve accurate duration if browser initially reports Infinity on blob URLs
      if (!Number.isFinite(video.duration) || video.duration === 0) {
        try {
          video.currentTime = 1e101;
          await new Promise(r => {
            const onTu = () => {
              video.removeEventListener('timeupdate', onTu);
              video.currentTime = 0;
              r();
            };
            video.addEventListener('timeupdate', onTu);
            setTimeout(() => {
              video.removeEventListener('timeupdate', onTu);
              video.currentTime = 0;
              r();
            }, 600);
          });
        } catch {}
      }

      if (cancelRef.current) {
        try { offscreenDiv.remove(); } catch {}
        return;
      }

      const isOriginal = exportMode === 'original';
      const isCapcutProRes = exportMode === 'capcut_transparent';
      const isTransparent4K = exportMode === '4k_transparent';
      const isTransparent = isCapcutProRes || isTransparent4K;
      const isGreenScreen = exportMode === 'capcut_green';
      const vW = video.videoWidth || (aspectRatio === '9:16' ? 1080 : 1920);
      const vH = video.videoHeight || (aspectRatio === '9:16' ? 1920 : 1080);
      const is4K = exportMode === '4k_full' || isTransparent4K || (isOriginal && (vW >= 2160 || vH >= 2160));

      // Determine canvas dimensions based on chosen mode and native aspect ratio
      let width, height;
      if (isCapcutProRes || isGreenScreen) {
        // High-resolution export for CapCut & Premiere overlays:
        // Must ALWAYS be rendered at crystal-clear Full HD (min 1080p) or 4K so it never gets stretched/blurred
        if (aspectRatio === '9:16') {
          width = Math.max(1080, video.videoWidth && video.videoWidth >= 1080 ? video.videoWidth : 1080);
          height = Math.max(1920, video.videoHeight && video.videoHeight >= 1920 ? video.videoHeight : 1920);
        } else if (aspectRatio === '1:1') {
          width = Math.max(1080, video.videoWidth && video.videoWidth >= 1080 ? video.videoWidth : 1080);
          height = Math.max(1080, video.videoHeight && video.videoHeight >= 1080 ? video.videoHeight : 1080);
        } else {
          width = Math.max(1920, video.videoWidth && video.videoWidth >= 1920 ? video.videoWidth : 1920);
          height = Math.max(1080, video.videoHeight && video.videoHeight >= 1080 ? video.videoHeight : 1080);
        }
        width = width % 2 === 0 ? width : width - 1;
        height = height % 2 === 0 ? height : height - 1;
      } else if (isOriginal && video.videoWidth && video.videoHeight) {
        width = video.videoWidth;
        height = video.videoHeight;
        // Ensure even dimensions required by H.264 & ProRes
        width = width % 2 === 0 ? width : width - 1;
        height = height % 2 === 0 ? height : height - 1;
      } else if (exportMode === '4k_full' || isTransparent4K) {
        // True 4K UHD dimensions
        if (aspectRatio === '9:16') {
          width = 2160;
          height = 3840;
        } else if (aspectRatio === '1:1') {
          width = 2160;
          height = 2160;
        } else {
          width = 3840;
          height = 2160;
        }
      } else if (exportMode === '1080p') {
        if (aspectRatio === '9:16') {
          width = 1080;
          height = 1920;
        } else if (aspectRatio === '1:1') {
          width = 1080;
          height = 1080;
        } else {
          width = 1920;
          height = 1080;
        }
      } else {
        // 720p HD (super fast & smooth)
        if (aspectRatio === '9:16') {
          width = 720;
          height = 1280;
        } else if (aspectRatio === '1:1') {
          width = 720;
          height = 720;
        } else {
          width = 1280;
          height = 720;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      // CRITICAL: alpha: false on non-transparent export prevents premultiplied alpha color corruption!
      // desynchronized MUST be false to ensure clean buffer clearing without ghosting/concentric ring artifacts!
      const ctx = canvas.getContext('2d', {
        alpha: isTransparent,
        colorSpace: 'srgb',
        desynchronized: false
      });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const targetFps = 30;
      const canvasStream = canvas.captureStream(targetFps);
      let combinedStream = canvasStream;

      // Audio capture from source video so video has original sound
      let audioCtx = null;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          audioCtx = new AudioCtx();
          if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
          }
          const dest = audioCtx.createMediaStreamDestination();
          const source = audioCtx.createMediaElementSource(video);
          source.connect(dest);
          // Do not connect to audioCtx.destination to prevent loud speaker echo
          video.muted = false;
          video.volume = 1;
          const audioTracks = dest.stream.getAudioTracks();
          if (audioTracks && audioTracks.length > 0) {
            combinedStream = new MediaStream([
              ...canvasStream.getVideoTracks(),
              audioTracks[0]
            ]);
          }
        }
      } catch (audioErr) {
        console.warn("Audio element source notice:", audioErr);
        try {
          const videoStream = video.captureStream ? video.captureStream() : (video.mozCaptureStream ? video.mozCaptureStream() : null);
          if (videoStream) {
            const tracks = videoStream.getAudioTracks();
            if (tracks && tracks.length > 0) {
              combinedStream = new MediaStream([
                ...canvasStream.getVideoTracks(),
                tracks[0]
              ]);
            }
          }
        } catch (e) {
          console.warn("Stream audio capture fallback notice:", e);
        }
      }

      let mediaRecorder;
      let chosenMime = '';
      // High-fidelity bitrate: 60 Mbps for 4K pristine quality, 28 Mbps for 1080p crisp clarity
      const bitrate = is4K ? 60000000 : (exportMode === '1080p' || isCapcutProRes ? 28000000 : 14000000);
      
      // When exporting transparent video, strictly use codecs with alpha channel support (VP9/VP8)
      // Never use H264 or MP4 for transparent recording because they strip the alpha channel!
      const supportedMimes = isTransparent
        ? [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=vp8',
            'video/webm'
          ]
        : [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp9',
            'video/webm;codecs=h264,opus',
            'video/webm;codecs=h264',
            'video/mp4;codecs=avc1',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=vp8',
            'video/webm'
          ];
      for (const mime of supportedMimes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          try {
            mediaRecorder = new MediaRecorder(combinedStream, {
              mimeType: mime,
              videoBitsPerSecond: bitrate
            });
            chosenMime = mime;
            break;
          } catch (e) {}
        }
      }
      if (!mediaRecorder) {
        mediaRecorder = new MediaRecorder(combinedStream);
        chosenMime = mediaRecorder.mimeType || 'video/webm';
      }

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      let isDone = false;
      let watchdogTimer = null;

      let unfreezeInterval = null;

      const finishRecording = () => {
        if (isDone) return;
        isDone = true;
        if (watchdogTimer) clearTimeout(watchdogTimer);
        if (unfreezeInterval) clearInterval(unfreezeInterval);
        setBurnProgress(100);
        setBurnStatus('Finalizing export file...');
        try {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
          video.pause();
        } catch (e) {
          console.warn("Stop recording notice:", e);
        }
        try { offscreenDiv.remove(); } catch {}
      };

      // Accurate total duration computed from video, props, and subtitles
      const maxSubEnd = subtitles && subtitles.length > 0
        ? Math.max(...subtitles.map(s => Number(s.end) || 0))
        : 0;
      const realVideoDur = Number.isFinite(video.duration) && video.duration > 0
        ? video.duration
        : (videoDuration && Number.isFinite(videoDuration) && videoDuration > 0 ? videoDuration : 15);
      const totalDuration = Math.max(realVideoDur, maxSubEnd, 3);

      mediaRecorder.onstop = async () => {
        if (watchdogTimer) clearTimeout(watchdogTimer);
        if (unfreezeInterval) clearInterval(unfreezeInterval);
        if (cancelRef.current) {
          setIsBurning(false);
          setBurnProgress(0);
          setBurnStatus('');
          try { audioCtx?.close(); } catch {}
          try { offscreenDiv.remove(); } catch {}
          return;
        }

        const rawMime = mediaRecorder.mimeType || 'video/webm';
        let rawBlob = new Blob(chunks, { type: rawMime });

        let downloadBlob = rawBlob;
        let finalFilename = '';
        let targetExt = isCapcutProRes ? 'mov' : (isTransparent4K ? 'webm' : 'mp4');

        if (isOriginal) {
          finalFilename = `CaptioniX_Original_${width}x${height}.${targetExt}`;
        } else if (exportMode === '4k_full') {
          finalFilename = `CaptioniX_4K_UltraHD_Video_${aspectRatio.replace(':', 'x')}.${targetExt}`;
        } else if (exportMode === '1080p') {
          finalFilename = `CaptioniX_1080p_FullHD_Video_${aspectRatio.replace(':', 'x')}.${targetExt}`;
        } else if (exportMode === '720p') {
          finalFilename = `CaptioniX_720p_HD_Video_${aspectRatio.replace(':', 'x')}.${targetExt}`;
        } else if (isGreenScreen) {
          finalFilename = `CaptioniX_CapCut_GreenScreen_Overlay_${aspectRatio.replace(':', 'x')}.mp4`;
        } else if (isCapcutProRes) {
          finalFilename = `CaptioniX_CapCut_Transparent_Overlay_${aspectRatio.replace(':', 'x')}.mov`;
        } else {
          finalFilename = `CaptioniX_4K_Transparent_Overlay_${aspectRatio.replace(':', 'x')}.webm`;
        }

        // Remuxing & file finalization
        if (isCapcutProRes) {
          let remuxSuccessful = false;
          try {
            setBurnStatus('Converting to Apple ProRes 4444 MOV with 100% native transparency for CapCut...');
            const remuxResp = await fetch('/api/remux-video', {
              method: 'POST',
              headers: {
                'Content-Type': 'video/webm',
                'x-filename': finalFilename,
                'x-fps': String(targetFps),
                'x-is-transparent': 'true',
                'x-source-codec': chosenMime.includes('vp8') ? 'vp8' : 'vp9'
              },
              body: rawBlob
            });

            if (remuxResp.ok) {
              downloadBlob = await remuxResp.blob();
              remuxSuccessful = true;
            }
          } catch (remuxErr) {
            console.warn("Remux error for ProRes MOV:", remuxErr);
          }

          if (!remuxSuccessful) {
            setBurnStatus('Finalizing transparent WebM overlay...');
            downloadBlob = await fixWebmDuration(rawBlob, Math.round(totalDuration * 1000), false);
            finalFilename = finalFilename.replace(/\.mov$/, '.webm');
          }
        } else if (isTransparent4K) {
          // For raw transparent overlay mode (alpha WebM for Premiere/DaVinci), patch duration header keeping alpha
          try {
            downloadBlob = await fixWebmDuration(rawBlob, Math.round(totalDuration * 1000), false);
          } catch (patchErr) {
            console.warn("WebM duration header notice:", patchErr);
          }
        } else {
          let remuxSuccessful = false;
          // Try local FFmpeg remux server first if available (e.g. localhost)
          try {
            setBurnStatus('Converting to universal MP4 with anti-freeze PTS sync & Rec.709 colors...');
            const remuxResp = await fetch('/api/remux-video', {
              method: 'POST',
              headers: {
                'Content-Type': 'video/webm',
                'x-filename': finalFilename,
                'x-fps': String(targetFps),
                'x-crf': is4K ? '15' : '16',
                'x-is-4k': is4K ? 'true' : 'false'
              },
              body: rawBlob
            });

            if (remuxResp.ok) {
              downloadBlob = await remuxResp.blob();
              remuxSuccessful = true;
            }
          } catch (remuxErr) {
            console.warn("Local remux server unavailable (e.g. static host/Vercel):", remuxErr);
          }

          // If remux is not available (e.g. static Vercel deployment), sanitize WebM:
          // 1. Reset AlphaMode from 1 to 0 (so Totem / GStreamer won't crash looking for non-existent alpha buffers)
          // 2. Inject accurate duration and timecode metadata so seek bar and length are 100% correct (stops 0:02 freeze)
          if (!remuxSuccessful) {
            setBurnStatus('Finalizing standalone high-compatibility video file...');
            downloadBlob = await fixWebmDuration(rawBlob, Math.round(totalDuration * 1000), true);
            if (!downloadBlob.type.includes('mp4')) {
              finalFilename = finalFilename.replace(/\.mp4$/, '.webm');
            }
          }
        }

        const url = URL.createObjectURL(downloadBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = finalFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsBurning(false);
        setBurnProgress(100);
        setBurnStatus('Download complete!');
        try { audioCtx?.close(); } catch {}
        try { offscreenDiv.remove(); } catch {}
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      };

      // Ensure all custom fonts (Noto Nastaliq Urdu, Montserrat, Cinzel, etc.) are 100% loaded before rendering
      try {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
      } catch (fontErr) {
        console.warn("Fonts ready check notice:", fontErr);
      }

      // Flush buffer chunks every 400ms to keep RAM footprint low (<250MB) even in 4K
      mediaRecorder.start(400);
      video.currentTime = 0;

      // Event listeners on video element to guarantee 100% completion
      video.onended = () => {
        finishRecording();
      };
      video.onpause = () => {
        if (video.currentTime >= totalDuration - 0.25) {
          finishRecording();
        }
      };

      try {
        await video.play();
      } catch (playErr) {
        console.warn("Autoplay with audio blocked, continuing with muted play:", playErr);
        video.muted = true;
        await video.play();
      }

      // Keep alive heartbeat to prevent background video pausing
      unfreezeInterval = setInterval(() => {
        if (isDone || cancelRef.current) {
          clearInterval(unfreezeInterval);
          return;
        }
        if (video.paused && video.currentTime < totalDuration - 0.25) {
          video.play().catch(() => {});
        }
      }, 500);

      // Safety watchdog: guarantees video finishes even if browser events freeze
      watchdogTimer = setTimeout(() => {
        if (!isDone) {
          console.warn("Watchdog safety triggered completion");
          finishRecording();
        }
      }, (totalDuration + 3.0) * 1000);

      const renderFrame = () => {
        if (isDone) return;
        if (cancelRef.current) {
          isDone = true;
          if (watchdogTimer) clearTimeout(watchdogTimer);
          if (unfreezeInterval) clearInterval(unfreezeInterval);
          try {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
            video.pause();
          } catch {}
          setIsBurning(false);
          setBurnProgress(0);
          setBurnStatus('Cancelled');
          try { audioCtx?.close(); } catch {}
          try { offscreenDiv.remove(); } catch {}
          return;
        }

        if (video.ended || video.currentTime >= totalDuration - 0.08) {
          finishRecording();
          return;
        }

        if (isTransparent) {
          // Transparent background: clear entire canvas with alpha 0
          ctx.clearRect(0, 0, width, height);
        } else if (isGreenScreen) {
          // Solid green screen background for CapCut Chroma Key overlay
          ctx.fillStyle = '#00FF00';
          ctx.fillRect(0, 0, width, height);
        } else {
          // Draw video background with high-quality aspect-fit cover (preserves true native proportions)
          const srcAspect = vW / vH;
          const dstAspect = width / height;

          let sx = 0, sy = 0, sw = vW, sh = vH;
          if (Math.abs(srcAspect - dstAspect) > 0.005) {
            if (srcAspect > dstAspect) {
              sw = vH * dstAspect;
              sx = (vW - sw) / 2;
            } else {
              sh = vW / dstAspect;
              sy = (vH - sh) / 2;
            }
          }
          ctx.drawImage(video, sx, sy, sw, sh, 0, 0, width, height);
        }

        // Find current subtitle
        const curTime = video.currentTime;
        const currentSub = subtitles.find(s => curTime >= s.start && curTime <= s.end);

        if (currentSub) {
          // Always ensure word-level timestamps exist (synthesize if missing)
          let allWords = currentSub.words && currentSub.words.length > 0 ? currentSub.words : null;
          if (!allWords) {
            const rawText = currentSub.text || '';
            const wordList = rawText.trim().split(/\s+/).filter(Boolean);
            const dur = Math.max(0.15, (currentSub.end - currentSub.start) / Math.max(1, wordList.length));
            allWords = wordList.map((w, wIdx) => ({
              word: w,
              start: Math.round((currentSub.start + (wIdx * dur)) * 100) / 100,
              end: Math.round((currentSub.start + ((wIdx + 1) * dur)) * 100) / 100
            }));
          }

          // Pacing chunking (e.g. 1 word, 2 words, 3 words, etc.)
          let visibleWords = allWords;
          if (wordsPerScreen && wordsPerScreen !== 'all') {
            const chunkSize = parseInt(wordsPerScreen, 10);
            if (!isNaN(chunkSize) && chunkSize > 0) {
              const chunks = [];
              for (let i = 0; i < allWords.length; i += chunkSize) {
                chunks.push(allWords.slice(i, i + chunkSize));
              }
              const activeChunk = chunks.find(c => curTime >= c[0].start && curTime <= c[c.length - 1].end);
              if (activeChunk) {
                visibleWords = activeChunk;
              } else {
                const past = chunks.filter(c => curTime >= c[0].start);
                visibleWords = past.length > 0 ? past[past.length - 1] : chunks[0];
              }
            }
          }

          const posY = height * ((activeStyle.position || 75) / 100);
          const baseScale = width / 400;
          const scaledFontSize = Math.round((activeStyle.fontSize || 24) * baseScale);
          const sid = activeStyle.id || 'hormozi';

          // Detect Urdu / Arabic / RTL script
          const isSubRTL = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(currentSub.text || '');
          const fontFamily = isSubRTL
            ? "'Noto Nastaliq Urdu', 'Montserrat', sans-serif"
            : `${activeStyle.fontFamily || 'Montserrat'}, sans-serif`;

          ctx.textBaseline = 'middle';

          // Determine font weight from style
          const getFontWeight = () => {
            if (['hormozi', 'capcut', 'devin', 'bubble', 'nas', 'tiktok', 'rapid', 'comic', 'redalert', 'mumbai'].includes(sid)) return 900;
            if (['raj', 'karaoke', 'iman'].includes(sid)) return 800;
            if (['glow'].includes(sid)) return 800;
            if (['netflix', 'skool', 'dhruv', 'beerbiceps', 'varun'].includes(sid)) return 700;
            if (['abdaal', 'minimal'].includes(sid)) return 600;
            return 700;
          };
          const fontWeight = getFontWeight();

          // Strictly 1 active word to prevent double highlight blobs
          let activeWordIdx = -1;
          for (let i = 0; i < visibleWords.length; i++) {
            const w = visibleWords[i];
            const isLast = i === visibleWords.length - 1;
            if (curTime >= w.start && (isLast ? curTime <= w.end : curTime < w.end)) {
              activeWordIdx = i;
              break;
            }
          }
          if (activeWordIdx === -1 && visibleWords.length > 0) {
            const matching = visibleWords.filter(w => curTime >= w.start);
            if (matching.length > 0) {
              activeWordIdx = visibleWords.indexOf(matching[matching.length - 1]);
            }
          }

          // Measure words individually
          ctx.font = `${fontWeight} ${scaledFontSize}px ${fontFamily}`;
          const spaceWidth = ctx.measureText(' ').width;

          const measuredWords = visibleWords.map((w, idx) => {
            const isWordActive = idx === activeWordIdx;
            const wordFontSize = isWordActive ? Math.round(scaledFontSize * 1.18) : scaledFontSize;
            const wordFontWeight = isWordActive ? Math.min(900, fontWeight + 100) : fontWeight;
            ctx.font = `${wordFontWeight} ${wordFontSize}px ${fontFamily}`;
            const wordText = activeStyle.textTransform === 'uppercase' ? w.word.toUpperCase() : w.word;
            const wordWidth = ctx.measureText(wordText).width;
            return {
              ...w,
              renderedText: wordText,
              isWordActive,
              wordWidth,
              wordFontSize,
              wordFontWeight
            };
          });

          // Break words into lines if line width exceeds 84% canvas width (prevents edge overflow)
          const maxLineWidth = width * 0.84;
          const lines = [];
          let curLine = [];
          let curLineWidth = 0;

          measuredWords.forEach(w => {
            const wTotal = w.wordWidth + spaceWidth;
            if (curLine.length > 0 && (curLineWidth + w.wordWidth) > maxLineWidth) {
              lines.push({ words: curLine, lineWidth: curLineWidth - spaceWidth });
              curLine = [w];
              curLineWidth = wTotal;
            } else {
              curLine.push(w);
              curLineWidth += wTotal;
            }
          });
          if (curLine.length > 0) {
            lines.push({ words: curLine, lineWidth: curLineWidth - spaceWidth });
          }

          const lineHeight = Math.round(scaledFontSize * 1.36);
          const totalBlockHeight = lines.length * lineHeight;
          const startBlockY = posY - (totalBlockHeight / 2) + (lineHeight / 2);

          // ── Per-style color resolver functions ──
          // Returns the correct regular (non-active) word fill color matching the CSS preview
          const getRegularWordColor = () => {
            switch (sid) {
              case 'hormozi': case 'capcut': case 'devin': case 'tiktok': case 'nas':
              case 'bubble': case 'raj': case 'skool': case 'netflix': case 'dhruv':
              case 'redalert': case 'rapid':
                return '#ffffff';
              case 'karaoke':   return 'rgba(255, 255, 255, 0.45)';
              case 'glow':      return '#ffffff';
              case 'minimal':   return '#ffffff';
              case 'neon':      return '#f43f5e';
              case 'synthwave': return '#f43f5e';
              case 'comic':     return '#111827';
              case 'abdaal':    return '#f8fafc';
              case 'iman':      return '#cbd5e1';
              case 'mumbai':    return '#fef08a';
              case 'varun':     return '#94a3b8';
              case 'beerbiceps':return '#e2e8f0';
              default:          return activeStyle.color || '#ffffff';
            }
          };

          // Returns the correct active word fill color matching the CSS preview
          const getActiveWordColor = () => {
            // For bright background pill styles, black text provides maximum contrast
            if (['tiktok', 'nas'].includes(sid)) {
              return '#000000';
            }
            if (sid === 'bubble') {
              return '#0f172a';
            }
            // If user customized the active word color in the UI, use user's custom color!
            if (activeStyle.activeColor && activeStyle.activeColor !== 'inherit') {
              return activeStyle.activeColor;
            }
            switch (sid) {
              case 'hormozi':   return '#facc15';
              case 'capcut':    return '#10b981';
              case 'devin':     return '#a3e635';
              case 'glow':      return '#38bdf8';
              case 'neon':      return '#a855f7';
              case 'synthwave': return '#22d3ee';
              case 'bubble':    return '#0f172a';
              case 'nas':       return '#000000';
              case 'tiktok':    return '#000000';
              case 'comic':     return '#dc2626';
              case 'raj':       return '#facc15';
              case 'iman':      return '#fbbf24';
              case 'mumbai':    return '#ffffff';
              case 'varun':     return '#22d3ee';
              case 'skool':     return '#4ade80';
              case 'netflix':   return '#fbbf24';
              case 'minimal':   return '#6366f1';
              case 'karaoke':   return '#fbbf24';
              case 'abdaal':    return '#c084fc';
              case 'redalert':  return '#fef08a';
              case 'beerbiceps':return '#f59e0b';
              case 'dhruv':     return '#f87171';
              case 'rapid':     return '#facc15';
              default:          return activeStyle.activeColor || '#fde047';
            }
          };

          // Does this style need text stroke (black outline) like CSS -webkit-text-stroke?
          const needsStroke = () => {
            return ['hormozi', 'capcut', 'devin', 'tiktok', 'rapid'].includes(sid)
              || (activeStyle.stroke && activeStyle.stroke !== 'none');
          };

          // Does this style have a full-line background container (pill/box)?
          const hasLineBackground = ['minimal', 'netflix', 'skool', 'dhruv', 'comic', 'redalert'].includes(sid);

          // Does the active word get its own per-word background pill?
          const hasActiveWordBg = ['hormozi', 'bubble', 'nas', 'tiktok', 'mumbai', 'varun'].includes(sid);

          // Does this style need glow/text-shadow effects? Only true neon/glow styles
          const hasGlowEffect = ['glow', 'neon', 'synthwave'].includes(sid);

          // Render each wrapped line
          lines.forEach((line, lineIdx) => {
            const lineY = startBlockY + (lineIdx * lineHeight);
            const lineWidth = line.lineWidth;
            const s = width / 720; // universal scale factor

            // ── LINE-LEVEL BACKGROUNDS ──
            if (hasLineBackground) {
              const padX = Math.round(20 * s);
              const padY = Math.round(10 * s);
              let radius, bgColor;

              switch (sid) {
                case 'minimal':
                  bgColor = 'rgba(15, 23, 42, 0.85)';
                  radius = Math.round(9999 * s); // pill shape
                  break;
                case 'netflix':
                  bgColor = 'rgba(0, 0, 0, 0.78)';
                  radius = Math.round(8 * s);
                  break;
                case 'skool':
                  bgColor = 'rgba(15, 23, 42, 0.85)';
                  radius = Math.round(12 * s);
                  break;
                case 'dhruv':
                  bgColor = 'rgba(10, 20, 42, 0.88)';
                  radius = Math.round(8 * s);
                  break;
                case 'comic':
                  bgColor = '#facc15';
                  radius = Math.round(8 * s);
                  break;
                case 'redalert':
                  bgColor = '#dc2626';
                  radius = Math.round(6 * s);
                  break;
                default:
                  bgColor = 'rgba(15, 23, 42, 0.90)';
                  radius = Math.round(12 * s);
              }

              ctx.fillStyle = bgColor;
              ctx.beginPath();
              ctx.roundRect(
                (width / 2) - (lineWidth / 2) - padX,
                lineY - (scaledFontSize / 2) - padY,
                lineWidth + (padX * 2),
                scaledFontSize + (padY * 2),
                radius
              );
              ctx.fill();

              // Comic: black border
              if (sid === 'comic') {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = Math.round(3 * s);
                ctx.stroke();
              }
              // Redalert: white border
              if (sid === 'redalert') {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = Math.round(2 * s);
                ctx.stroke();
              }
              // Dhruv: red left border accent
              if (sid === 'dhruv') {
                ctx.fillStyle = '#ef4444';
                const bx = (width / 2) - (lineWidth / 2) - padX;
                const by = lineY - (scaledFontSize / 2) - padY;
                const bh = scaledFontSize + (padY * 2);
                ctx.fillRect(bx, by, Math.round(4 * s), bh);
              }
              // Skool, Netflix, Minimal: subtle white border
              if (['skool', 'netflix', 'minimal'].includes(sid)) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
                ctx.lineWidth = Math.round(1 * s);
                ctx.stroke();
              }
            }

            // ── DRAW EACH WORD ──
            const drawSingleWord = (w, curWordX) => {
              ctx.save();
              const isWordActive = w.isWordActive;
              const wordFontSize = w.wordFontSize;
              const wFontWeight = w.wordFontWeight;
              // Keep vertical alignment uniform across all words in line
              const wordY = lineY;

              ctx.font = `${wFontWeight} ${wordFontSize}px ${fontFamily}`;
              ctx.textAlign = 'left';

              // ── PER-WORD ACTIVE BACKGROUND (pill behind active word only) ──
              if (isWordActive && hasActiveWordBg) {
                const wpx = Math.round(wordFontSize * 0.22);
                const wpy = Math.round(wordFontSize * 0.12);
                let wBgColor, wRadius;

                switch (sid) {
                  case 'hormozi':
                    wBgColor = 'rgba(0, 0, 0, 0.85)';
                    wRadius = Math.round(6 * s);
                    break;
                  case 'bubble':
                    wBgColor = '#38bdf8';
                    wRadius = Math.round(9999 * s);
                    break;
                  case 'nas':
                    wBgColor = '#facc15';
                    wRadius = Math.round(4 * s);
                    break;
                  case 'tiktok':
                    wBgColor = '#facc15';
                    wRadius = Math.round(4 * s);
                    break;
                  case 'mumbai':
                    wBgColor = '#f97316';
                    wRadius = Math.round(8 * s);
                    break;
                  case 'varun':
                    wBgColor = 'rgba(34, 211, 238, 0.18)';
                    wRadius = Math.round(6 * s);
                    break;
                  default:
                    wBgColor = activeStyle.activeBg || 'rgba(0,0,0,0.7)';
                    wRadius = Math.round(6 * s);
                }

                ctx.fillStyle = wBgColor;
                ctx.beginPath();
                ctx.roundRect(
                  curWordX - wpx,
                  wordY - (wordFontSize / 2) - wpy,
                  w.wordWidth + (wpx * 2),
                  wordFontSize + (wpy * 2),
                  wRadius
                );
                ctx.fill();

                // Varun: cyan border on active word
                if (sid === 'varun') {
                  ctx.strokeStyle = '#22d3ee';
                  ctx.lineWidth = Math.max(1, Math.round(1.5 * s));
                  ctx.stroke();
                }
              }

              // ── CRISP OUTLINE / CONTRAST CONTOUR ──
              // Note: If word is on a bright pill badge (tiktok, nas, bubble), do NOT draw black stroke over dark text!
              const isBadgeActive = isWordActive && hasActiveWordBg && ['tiktok', 'nas', 'bubble'].includes(sid);
              const shouldHeavyStroke = !isBadgeActive && needsStroke();

              if (!isBadgeActive) {
                ctx.save();
                ctx.strokeStyle = '#000000';
                ctx.lineJoin = 'round';
                ctx.miterLimit = 2;

                if (shouldHeavyStroke) {
                  // Proportional bold outline for comic/hormozi/capcut styles
                  const baseStroke = isSubRTL
                    ? Math.max(1, Math.round(wordFontSize * 0.025))
                    : Math.max(1.5, Math.round(wordFontSize * 0.05));
                  ctx.lineWidth = (sid === 'rapid' && isWordActive) ? baseStroke * 1.5 : baseStroke * 2;
                  ctx.strokeText(w.renderedText, curWordX, wordY);
                } else {
                  // Subtle, crisp dark separating contour for high definition legibility
                  // Guarantees counter holes ('A', 'a', 'o', 'e') remain 100% open, distinct and sharp on all backgrounds
                  const contourWidth = isWordActive
                    ? Math.max(1.5, Math.round(wordFontSize * 0.038))
                    : Math.max(1, Math.round(wordFontSize * 0.022));
                  ctx.strokeStyle = 'rgba(0, 0, 0, 0.95)';
                  ctx.lineWidth = contourWidth;
                  ctx.strokeText(w.renderedText, curWordX, wordY);
                }
                ctx.restore();
              }

              // ── CLEAN DROP SHADOW / SUBTLE RADIANCE ──
              // Use clean drop shadow for depth. Avoid large blurry clouds that cause chroma quantization in WebM
              ctx.shadowBlur = 0;
              ctx.shadowColor = 'transparent';
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;

              if (hasGlowEffect && isWordActive && !isBadgeActive) {
                // Tight radiant aura (max 4-6px) for neon styles without muddy halos
                const activeColor = getActiveWordColor();
                ctx.shadowColor = activeColor || 'rgba(250, 204, 21, 0.8)';
                ctx.shadowBlur = Math.min(4 * s, 6);
              } else if (!isBadgeActive) {
                // Crisp subtle drop shadow for depth and separation
                ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
                ctx.shadowBlur = Math.min(3 * s, 6);
                ctx.shadowOffsetY = Math.max(1, Math.round(2 * s));
              }

              // ── SOLID VIBRANT TEXT FILL ──
              // Always draw solid, 100% opaque, high-contrast text
              if (isWordActive) {
                ctx.fillStyle = getActiveWordColor();
              } else {
                ctx.fillStyle = getRegularWordColor();
              }

              ctx.fillText(w.renderedText, curWordX, wordY);
              ctx.shadowBlur = 0;
              ctx.shadowColor = 'transparent';
              ctx.shadowOffsetY = 0;
              ctx.restore();
            };

            if (isSubRTL) {
              // RTL: Start at line right edge, placing first word on the far right
              let curWordRight = (width / 2) + (lineWidth / 2);
              line.words.forEach(w => {
                const curWordX = curWordRight - w.wordWidth;
                drawSingleWord(w, curWordX);
                curWordRight -= (w.wordWidth + spaceWidth);
              });
            } else {
              // LTR: Start at line left edge, placing first word on the far left
              let curWordX = (width / 2) - (lineWidth / 2);
              line.words.forEach(w => {
                drawSingleWord(w, curWordX);
                curWordX += (w.wordWidth + spaceWidth);
              });
            }
          });
        }


        const pct = Math.min(99, Math.round((video.currentTime / totalDuration) * 100));
        setBurnProgress(pct);
        const modeLabel = isOriginal ? `Original (${width}x${height})` : (is4K ? '4K Ultra HD' : exportMode.toUpperCase());
        setBurnStatus(`Rendering ${modeLabel} (${pct}%)...`);

        let frameScheduled = false;
        const triggerNext = () => {
          if (!frameScheduled && !isDone) {
            frameScheduled = true;
            renderFrame();
          }
        };

        if ('requestVideoFrameCallback' in video) {
          video.requestVideoFrameCallback(() => triggerNext());
        }
        requestAnimationFrame(() => triggerNext());
      };

      if ('requestVideoFrameCallback' in video) {
        video.requestVideoFrameCallback(renderFrame);
      } else {
        requestAnimationFrame(renderFrame);
      }
    } catch (err) {
      if (watchdogTimer) clearTimeout(watchdogTimer);
      if (unfreezeInterval) clearInterval(unfreezeInterval);
      try { offscreenDiv?.remove(); } catch {}
      console.error("Video rendering error:", err);
      alert("Browser rendering error: " + err.message + ". You can always export the SRT file directly!");
      setIsBurning(false);
      setBurnProgress(0);
      setBurnStatus('');
      try { audioCtx?.close(); } catch {}
    }
  };


  // Minimized Floating Widget Mode (shows only the compact export progress level)
  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
        background: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1.5px solid var(--accent-amber)',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 158, 11, 0.35)',
        padding: '16px 18px',
        color: '#f8fafc',
        animation: 'slideUp 0.3s ease'
      }}>
        {/* Minimized Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isBurning ? '12px' : '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isBurning ? (
              <Loader2 size={16} className="spin" color="#f59e0b" />
            ) : (
              <Download size={16} color="#6366f1" />
            )}
            <span style={{ fontWeight: 700, fontSize: '13px', color: isBurning ? '#fde047' : '#fff' }}>
              {isBurning ? `Exporting ${exportMode.toUpperCase()} (${burnProgress}%)` : 'Export Studio (Minimized)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Expand / Maximize Button */}
            <button
              onClick={() => setIsMinimized(false)}
              title="Expand back to full window"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <Maximize2 size={13} />
            </button>
            {/* Close Button */}
            <button
              onClick={() => {
                setIsMinimized(false);
                onClose();
              }}
              title="Close"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-dim)',
                cursor: 'pointer'
              }}
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Minimized Progress / Level Bar */}
        {isBurning ? (
          <div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{
                width: `${burnProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f59e0b, #ef4444, #a855f7)',
                borderRadius: '999px',
                transition: 'width 0.2s ease',
                boxShadow: '0 0 10px rgba(245, 158, 11, 0.8)'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>{burnStatus || 'Rendering video frames...'}</span>
              <button
                onClick={handleCancelBurn}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#f87171',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 6px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Click maximize to choose export options</span>
            <button
              onClick={() => setIsMinimized(false)}
              className="btn-primary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              Maximize
            </button>
          </div>
        )}
      </div>
    );
  }

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
        maxWidth: '580px',
        width: '100%',
        padding: '28px',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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
              <Download size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Export Captions & Video</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Choose your resolution & professional format</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setIsMinimized(true)}
              title="Minimize to floating progress widget"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Minus size={16} />
            </button>
            <button
              onClick={onClose}
              title="Close modal"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>


        {/* Section 1: Video Export Quality Selector */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Select Video Export Quality & Mode
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {/* 1. Original / Source Resolution (Matches Uploaded Video 4K/1080p directly) */}
            <button
              type="button"
              onClick={() => setExportMode('original')}
              style={{
                gridColumn: '1 / -1',
                padding: '14px 14px',
                borderRadius: '10px',
                background: exportMode === 'original' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.28), rgba(168, 85, 247, 0.24))' : 'rgba(255, 255, 255, 0.04)',
                border: exportMode === 'original' ? '1.5px solid #818cf8' : '1px solid var(--border-subtle)',
                color: exportMode === 'original' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: exportMode === 'original' ? '0 0 18px rgba(99, 102, 241, 0.4)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#e0e7ff' }}>
                  👑 Original / Source Resolution
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '9px', padding: '2px 8px' }}>
                  {detectedResolution ? `Same as Upload (${detectedResolution.tag})` : 'Exact Upload Quality'}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.35 }}>
                {detectedResolution ? (
                  <>Auto-matches uploaded video at <strong>{detectedResolution.width}x{detectedResolution.height}</strong>. 0% distortion, 100% original pixel sharpness & true colors.</>
                ) : (
                  <>Downloads at the exact same quality & resolution as your upload (4K stays 4K, 1080p stays 1080p).</>
                )}
              </div>
            </button>

            {/* 2. 1080p Full HD Full Video (Recommended for Reels/TikTok) */}
            <button
              type="button"
              onClick={() => setExportMode('1080p')}
              style={{
                padding: '14px 12px',
                borderRadius: '10px',
                background: exportMode === '1080p' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: exportMode === '1080p' ? '1.5px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                color: exportMode === '1080p' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: exportMode === '1080p' ? '0 0 16px rgba(99, 102, 241, 0.35)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>🌟 1080p Full HD</span>
                <span className="badge badge-indigo" style={{ fontSize: '9px', padding: '1px 6px' }}>Reels / TikTok</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.3 }}>
                High-quality downscale from 4K or native 1080p. <strong>Super crisp, fast & smooth!</strong>
              </div>
            </button>

            {/* 3. 4K Ultra HD Full Video */}
            <button
              type="button"
              onClick={() => setExportMode('4k_full')}
              style={{
                padding: '14px 12px',
                borderRadius: '10px',
                background: exportMode === '4k_full' ? 'rgba(245, 158, 11, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                border: exportMode === '4k_full' ? '1.5px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                color: exportMode === '4k_full' ? '#fde047' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: exportMode === '4k_full' ? '0 0 16px rgba(245, 158, 11, 0.35)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>🔥 4K Ultra HD</span>
                <span className="badge badge-amber" style={{ fontSize: '9px', padding: '1px 6px' }}>2160p UHD</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.3 }}>
                Direct 4K (3840x2160 / 2160x3840). <strong>60 Mbps maximum visual fidelity.</strong>
              </div>
            </button>

            {/* 4. 720p HD Video */}
            <button
              type="button"
              onClick={() => setExportMode('720p')}
              style={{
                padding: '12px 10px',
                borderRadius: '10px',
                background: exportMode === '720p' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                border: exportMode === '720p' ? '1.5px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                color: exportMode === '720p' ? '#6ee7b7' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>⚡ 720p HD</span>
                <span className="badge badge-emerald" style={{ fontSize: '9px', padding: '1px 5px' }}>Fast</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.3 }}>
                Fast export for quick sharing & WhatsApp status
              </div>
            </button>

            {/* 5. CapCut Native Transparent Overlay (.mov - Apple ProRes 4444) */}
            <button
              type="button"
              onClick={() => setExportMode('capcut_transparent')}
              style={{
                gridColumn: '1 / -1',
                padding: '14px 14px',
                borderRadius: '10px',
                background: exportMode === 'capcut_transparent'
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.28), rgba(236, 72, 153, 0.25))'
                  : 'rgba(255, 255, 255, 0.04)',
                border: exportMode === 'capcut_transparent' ? '1.5px solid #c084fc' : '1px solid var(--border-subtle)',
                color: exportMode === 'capcut_transparent' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: exportMode === 'capcut_transparent' ? '0 0 18px rgba(168, 85, 247, 0.45)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f3e8ff' }}>
                  🎬 CapCut Native Transparent Overlay (.mov)
                </span>
                <span className="badge badge-purple" style={{ fontSize: '9px', padding: '2px 8px', background: 'rgba(168, 85, 247, 0.3)', color: '#e9d5ff', border: '1px solid #a855f7' }}>
                  100% Transparent (No Overlay Needed!)
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.35 }}>
                Apple ProRes 4444 MOV with true alpha. Import directly into CapCut (PC & Mac) — <strong>background is already 100% transparent</strong> without clicking overlay or blend mode! Colors stay solid & bright.
              </div>
            </button>

            {/* 6. CapCut Green Screen Chroma Key MP4 */}
            <button
              type="button"
              onClick={() => setExportMode('capcut_green')}
              style={{
                padding: '13px 12px',
                borderRadius: '10px',
                background: exportMode === 'capcut_green' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: exportMode === 'capcut_green' ? '1.5px solid #10b981' : '1px solid var(--border-subtle)',
                color: exportMode === 'capcut_green' ? '#6ee7b7' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: exportMode === 'capcut_green' ? '0 0 16px rgba(16, 185, 129, 0.35)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>
                  🟩 CapCut Green Screen
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '9px', padding: '1px 5px' }}>
                  Chroma Key
                </span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.3 }}>
                MP4 over solid green (#00FF00). Best for CapCut Mobile with Chroma Key cutout.
              </div>
            </button>

            {/* 7. 4K Transparent Alpha Overlay (WebM) */}
            <button
              type="button"
              onClick={() => setExportMode('4k_transparent')}
              style={{
                padding: '13px 12px',
                borderRadius: '10px',
                background: exportMode === '4k_transparent' ? 'rgba(168, 85, 247, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                border: exportMode === '4k_transparent' ? '1.5px solid var(--accent-purple)' : '1px solid var(--border-subtle)',
                color: exportMode === '4k_transparent' ? '#c084fc' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>✨ 4K Alpha WebM</span>
                <span className="badge badge-indigo" style={{ fontSize: '9px', padding: '1px 5px' }}>Premiere/DaVinci</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.3 }}>
                Alpha WebM for Premiere Pro & DaVinci Resolve.
              </div>
            </button>
          </div>
        </div>

        {/* Guidance Banners */}
        {exportMode === 'capcut_transparent' ? (
          <div style={{
            background: 'rgba(168, 85, 247, 0.12)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            fontSize: '11px',
            lineHeight: 1.5,
            color: '#e9d5ff'
          }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', color: '#c084fc' }}>
              <Sparkles size={14} color="#c084fc" />
              <span>CapCut Native Transparency (Apple ProRes 4444):</span>
            </div>
            <div>
              1. Download this <strong>.mov</strong> file.<br/>
              2. Drag and drop it into <strong>CapCut (Desktop)</strong> on the track directly above your video clip.<br/>
              3. <strong>Done!</strong> The background is already 100% transparent. No "Overlay" or blend mode needed, and captions never get stuck!
            </div>
          </div>
        ) : exportMode === '4k_transparent' ? (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            fontSize: '11px',
            lineHeight: 1.5,
            color: '#fca5a5'
          }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', color: '#f87171' }}>
              <AlertTriangle size={15} color="#ef4444" />
              <span>Note for CapCut Users:</span>
            </div>
            <div>
              CapCut cannot decode WebM alpha transparency and displays it with a black screen.
              <br/>
              • <strong>For CapCut native transparency:</strong> Choose <strong>"🎬 CapCut Native Transparent Overlay (.mov)"</strong> above!
            </div>
          </div>
        ) : exportMode === 'capcut_green' ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            fontSize: '11px',
            lineHeight: 1.5,
            color: '#6ee7b7'
          }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <Check size={14} color="#10b981" />
              <span>How to use Green Screen in CapCut:</span>
            </div>
            <div>
              1. In CapCut, import your video on the main track.<br/>
              2. Tap <strong>Overlay → Add overlay</strong> and select this downloaded MP4.<br/>
              3. Select the overlay track, tap <strong>Cutout → Chroma Key</strong>, pick the green color, set intensity to 15, and your captions will overlay transparently!
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginBottom: '16px',
            fontSize: '11px',
            lineHeight: 1.5,
            color: '#6ee7b7'
          }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <Check size={14} color="#10b981" />
              <span>Universal MP4 (CapCut, Reels & All Platforms Compatible):</span>
            </div>
            <div>
              Exports a complete, pristine video with original audio and burned captions in <strong>universal H.264 (yuv420p) + AAC MP4</strong> format. Plays with full video background in CapCut, Instagram, TikTok, and all devices!
            </div>
          </div>
        )}

        {/* Live Rendering Progress Card */}
        {isBurning && (
          <div className="glass-panel" style={{
            padding: '18px 20px',
            marginBottom: '16px',
            border: '1.5px solid var(--accent-amber)',
            background: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.18), rgba(15, 23, 42, 0.95))',
            borderRadius: '14px',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={18} className="spin" color="#f59e0b" />
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#fde047' }}>
                  {exportMode === 'original' && 'Rendering Original Quality Video'}
                  {exportMode === '4k_full' && 'Rendering 4K Ultra HD Full Video'}
                  {exportMode === '1080p' && 'Rendering 1080p Full HD Video'}
                  {exportMode === '720p' && 'Rendering 720p HD Video'}
                  {exportMode === 'capcut_green' && 'Rendering CapCut Green Screen Video'}
                  {exportMode === '4k_transparent' && 'Rendering 4K Alpha Overlay'}
                </span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#fde047', fontFamily: 'monospace' }}>
                {burnProgress}%
              </span>
            </div>

            {/* Glowing Progress bar */}
            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{
                width: `${burnProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f59e0b, #ef4444, #a855f7)',
                borderRadius: '999px',
                transition: 'width 0.2s ease',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.8)'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {burnStatus || 'Burning captions & audio into video...'}
              </div>
              <button
                onClick={handleCancelBurn}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#f87171', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Export Action Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Action 1: Render Video (Selected Mode) */}
          <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                borderRadius: '10px',
                background: exportMode === '4k_full' ? 'rgba(245, 158, 11, 0.2)' : (exportMode === '4k_transparent' ? 'rgba(168, 85, 247, 0.2)' : (exportMode === 'capcut_green' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)')),
                color: exportMode === '4k_full' ? 'var(--accent-amber)' : (exportMode === '4k_transparent' ? 'var(--accent-purple)' : (exportMode === 'capcut_green' ? 'var(--accent-emerald)' : 'var(--accent-indigo)'))
              }}>
                <Video size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>
                    {exportMode === 'original' && '👑 Original Resolution Video (MP4)'}
                    {exportMode === '4k_full' && '🔥 4K Ultra HD Full Video (MP4)'}
                    {exportMode === '1080p' && '🌟 1080p Full HD Video (MP4)'}
                    {exportMode === '720p' && '⚡ 720p HD Video (MP4)'}
                    {exportMode === 'capcut_green' && '🎬 CapCut Chroma Key Green Screen (MP4)'}
                    {exportMode === '4k_transparent' && '✨ 4K Transparent Alpha Captions (.webm)'}
                  </span>
                  <span className={`badge ${exportMode === '4k_full' ? 'badge-amber' : (exportMode === '4k_transparent' ? 'badge-indigo' : (exportMode === 'capcut_green' ? 'badge-emerald' : 'badge-emerald'))}`}>
                    {exportMode === '4k_transparent' ? 'Alpha VP9' : (exportMode === 'capcut_green' ? 'Chroma Key' : 'Complete Video')}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  {exportMode === 'original' && 'Complete native resolution video with original audio & burned captions (100% CapCut & Socials Compatible MP4)'}
                  {exportMode === '4k_full' && 'Direct 4K video with original audio & burned captions (Universal MP4)'}
                  {exportMode === '1080p' && 'Full HD video with audio & burned captions ready to post on Reels / TikTok'}
                  {exportMode === '720p' && 'Fast 720p video export with audio & burned captions'}
                  {exportMode === 'capcut_green' && 'Solid green screen video for 1-click Chroma Key overlay inside CapCut'}
                  {exportMode === '4k_transparent' && 'Transparent animated captions overlay for Premiere / DaVinci (Shows black in CapCut)'}
                </div>
              </div>
            </div>
            <button
              onClick={handleRenderVideo}
              disabled={isBurning}
              className="btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                background: exportMode === '4k_transparent' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : undefined
              }}
            >
              {isBurning ? (
                <>
                  <Loader2 size={14} className="spin" />
                  <span>{burnProgress}%</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>
                    {exportMode === '4k_transparent' ? 'Export 4K Alpha (.webm)' : (
                      exportMode === 'original' ? 'Render Original MP4' : (
                        exportMode === 'capcut_green' ? 'Render Green Screen MP4' : `Render ${exportMode.toUpperCase()} MP4`
                      )
                    )}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Action 2: SRT Subtitle File */}
          <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)' }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>SubRip (.SRT) Format</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Industry standard for Premiere Pro, DaVinci Resolve, CapCut & YouTube
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadSRT}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              <Download size={14} />
              <span>.SRT</span>
            </button>
          </div>

          {/* Action 3: WebVTT File */}
          <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)' }}>
                <FileText size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>WebVTT (.VTT) Format</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Optimized for HTML5 web players and modern video streaming
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadVTT}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              <Download size={14} />
              <span>.VTT</span>
            </button>
          </div>

          {/* Action 4: Plain Text Copy */}
          <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)' }}>
                <Copy size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Copy Script to Clipboard</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  Copies pure text script directly without timestamps
                </div>
              </div>
            </div>
            <button
              onClick={handleCopyText}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '22px', textAlign: 'right' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 22px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
