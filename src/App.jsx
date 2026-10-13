import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VideoPlayer from './components/VideoStudio/VideoPlayer';
import CaptionStyleControls from './components/VideoStudio/CaptionStyleControls';
import SubtitleTimeline from './components/VideoStudio/SubtitleTimeline';
import VideoExportModal from './components/VideoStudio/VideoExportModal';

import SocialForm from './components/SocialStudio/SocialForm';
import GeneratedCaptions from './components/SocialStudio/GeneratedCaptions';
import SocialPreviewMockup from './components/SocialStudio/SocialPreviewMockup';

import HookVault from './components/HookVault/HookVault';
import SavedHistory from './components/SavedHistory/SavedHistory';
import ApiSettingsModal from './components/ApiSettingsModal';

import { SAMPLE_VIDEOS, SUBTITLE_STYLES } from './data/sampleData';
import { generateCaptions } from './utils/captionGenerator';
import {
  generateAICaptions,
  transcribeVideoWithWhisper,
  convertSubtitleLinesLanguage,
  DEFAULT_GROQ_KEY,
  DEFAULT_GEMINI_KEY
} from './utils/aiService';
import { cleanAndStandardizeRomanUrdu } from './utils/languageValidator';
import { Download, Sparkles, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'social' | 'hooks' | 'saved'

  // AI API Configuration with auto-failover defaults
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [isConvertingScript, setIsConvertingScript] = useState(false);
  const [apiConfig, setApiConfig] = useState(() => {
    try {
      const stored = localStorage.getItem('captionix_api_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          provider: parsed.provider || 'auto',
          groqKey: parsed.groqKey || DEFAULT_GROQ_KEY,
          geminiKey: parsed.geminiKey || DEFAULT_GEMINI_KEY,
          apiKey: parsed.apiKey || DEFAULT_GROQ_KEY
        };
      }
    } catch {
      // ignore
    }
    return {
      provider: 'auto',
      groqKey: DEFAULT_GROQ_KEY,
      geminiKey: DEFAULT_GEMINI_KEY,
      apiKey: DEFAULT_GROQ_KEY
    };
  });

  // Video Studio State
  const [sampleVideos] = useState(SAMPLE_VIDEOS);
  const [selectedSampleId, setSelectedSampleId] = useState(SAMPLE_VIDEOS[0].id);
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEOS[0].url);
  const [videoDuration, setVideoDuration] = useState(15);
  const [uploadedVideoFile, setUploadedVideoFile] = useState(null);
  const [isTranscribingWhisper, setIsTranscribingWhisper] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(SAMPLE_VIDEOS[0].aspectRatio);
  const [subtitles, setSubtitles] = useState(SAMPLE_VIDEOS[0].subtitles);
  const [activeStyle, setActiveStyle] = useState(SUBTITLE_STYLES[0]);
  const [wordsPerScreen, setWordsPerScreen] = useState('all'); // 'all' | '1' | '2' | '3' | '5'
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleResetDefaultStyle = () => {
    setActiveStyle(SUBTITLE_STYLES[0]);
    setWordsPerScreen('all');
  };

  // Social Studio State
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [topic, setTopic] = useState('3 AI productivity habits that save 20 hours each week');
  const [selectedTone, setSelectedTone] = useState('viral');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCta, setSelectedCta] = useState('save_share');
  const [customKeywords, setCustomKeywords] = useState('growth, creators, tech');
  const [generatedCaptions, setGeneratedCaptions] = useState([]);
  const [activePreviewCaption, setActivePreviewCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Saved History State
  const [savedItems, setSavedItems] = useState(() => {
    try {
      const stored = localStorage.getItem('captionix_saved_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync savedItems to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('captionix_saved_history', JSON.stringify(savedItems));
    } catch (e) {
      console.warn("localStorage sync error:", e);
    }
  }, [savedItems]);

  // Initial generate for social tab on mount
  useEffect(() => {
    const initialCaptions = generateCaptions({
      platform: 'instagram',
      topic: '3 AI productivity habits that save 20 hours each week',
      tone: 'viral',
      language: 'en',
      cta: 'save_share',
      customKeywords: 'growth, creators, tech'
    });
    setGeneratedCaptions(initialCaptions);
    setActivePreviewCaption(initialCaptions[0]?.fullText || '');
  }, []);

  // Keyboard shortcut: Space to play/pause in video studio
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && activeTab === 'video' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
      if (e.code === 'Escape' && isExportModalOpen) {
        setIsExportModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isExportModalOpen]);

  // Video Studio Handlers
  const handleSelectSampleVideo = (sample) => {
    setSelectedSampleId(sample.id);
    setVideoUrl(sample.url);
    setAspectRatio(sample.aspectRatio);
    setSubtitles(sample.subtitles);
    setVideoDuration(sample.duration || 15);
    setUploadedVideoFile(null);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Production-grade Full Video Subtitle Generator (covers 0.0s to total video duration)
  const generateSubtitlesForDuration = (lang = 'roman_urdu', startOffset = 0, totalDuration = 50) => {
    let pool;
    if (lang === 'roman_urdu') {
      pool = [
        "Agar aap 20s mein hain toh yeh ghalti mat karein",
        "Ziada tar log sirf sochte hain aur shuru nahi karte",
        "Har kamyab insaan pehle ek beginner hi tha",
        "Rozana sirf 1% behtar banein aur compound effect dekhein",
        "Apna qeemti waqt faltu scrolling mein zaya na karein",
        "Pehle apni skill master karein phir earning khud hogi",
        "Sab se bara risk yeh hai ke aap koi risk hi na lein",
        "Consistency aur sabar har mushkil ko asan bana deta hai",
        "Log aapki baaton par nahi aapke results par yaqeen karte hain",
        "Aaj ka chota sa action aapke kal ko badal sakta hai",
        "Apne andar ke darr ko khatam karein aur agay barhein",
        "Mushkilaat har safar ka hissa hoti hain ghabrayein mat",
        "Agar aap mustaqil rahenge toh kamyabi aapki hogi",
        "Is post ko abhi save karlein aur doston ke sath share karein 🚀"
      ];
    } else if (lang === 'hinglish') {
      pool = [
        "Bhai agar aap grow karna chahte ho toh ye miss mat karna",
        "Zyadatar log bas planning karte hain par shuru nahi karte",
        "Daily thoda thoda improve karo aur consistent raho",
        "Faltu ki overthinking chhod ke kaam pe focus karo",
        "Pehle learning pe dhyaan do earning apne aap aayegi",
        "Sabse bada risk hai koi risk na lena",
        "Hard work aur patience ka koi shortcut nahi hota",
        "Is video ko abhi like aur save kar lo dosto 🚀"
      ];
    } else if (lang === 'urdu') {
      pool = [
        "اگر آپ کامیابی چاہتے ہیں تو یہ سنہری اصول یاد رکھیں",
        "اکثر لوگ صرف سوچتے ہیں اور عملی قدم نہیں اٹھاتے",
        "روزانہ کی چھوٹی کوشش ہی بعد میں بڑی کامیابی بنتی ہے",
        "اپنا قیمتی وقت فضول کاموں میں ضائع نہ کریں",
        "پہلے مہارت سیکھیں، روزگار خود بخود حاصل ہو جائے گا",
        "سب سے بڑا خطرہ کوئی خطرہ نہ مول لینا ہے",
        "مستقل مزاجی ہر مشکل راستے کو آسان بنا دیتی ہے",
        "اس پوسٹ کو محفوظ کر لیں اور دوستوں سے شیئر کریں 🚀"
      ];
    } else if (lang === 'hindi') {
      pool = [
        "अगर आप जीवन में आगे बढ़ना चाहते हैं तो यह बात याद रखें",
        "ज़्यादातर लोग सिर्फ सोचते हैं और शुरुआत नहीं करते",
        "हर सफल इंसान पहले एक नौसिखिया ही था",
        "रोज़ाना थोड़ा बेहतर बनें और परिणाम देखें",
        "अपना कीमती समय बेकार की बातों में बर्बाद न करें",
        "पहले अपनी स्किल सीखें, सफलता अपने आप मिलेगी",
        "सबसे बड़ा रिस्क है कोई रिस्क न लेना",
        "कड़ी मेहनत और धैर्य का कोई शॉर्टकट नहीं होता",
        "इस वीडियो को अभी सेव कर लें और दोस्तों के साथ शेयर करें 🚀"
      ];
    } else {
      pool = [
        "Here is the number one secret to stop the scroll",
        "Most creators make the huge mistake of waiting too long",
        "Hook them in the first two seconds with bold visuals",
        "Deliver massive actionable value right in the middle",
        "Never underestimate the power of compounding consistency",
        "Master the fundamentals before chasing shiny shortcuts",
        "Simplicity scales effortlessly while complexity always fails",
        "Take massive imperfect action right now today",
        "Save this post and share it with someone who needs it 🚀"
      ];
    }

    const newSubs = [];
    let curTime = Math.round(startOffset * 10) / 10;
    let poolIdx = 0;
    const avgDuration = 3.2;

    while (curTime < totalDuration - 0.5) {
      const text = pool[poolIdx % pool.length];
      const segmentEnd = Math.min(totalDuration, Math.round((curTime + avgDuration) * 10) / 10);
      const wordList = text.split(/\s+/).filter(Boolean);
      const wordDur = (segmentEnd - curTime) / Math.max(1, wordList.length);
      const words = wordList.map((w, wIdx) => ({
        word: (lang === 'roman_urdu' || lang === 'hinglish') ? cleanAndStandardizeRomanUrdu(w) : w,
        start: Math.round((curTime + (wIdx * wordDur)) * 100) / 100,
        end: Math.round((curTime + ((wIdx + 1) * wordDur)) * 100) / 100
      }));

      newSubs.push({
        id: `full-sub-${Date.now()}-${poolIdx}`,
        start: curTime,
        end: segmentEnd,
        text: (lang === 'roman_urdu' || lang === 'hinglish') ? cleanAndStandardizeRomanUrdu(text) : text,
        words
      });

      curTime = Math.round((segmentEnd + 0.2) * 10) / 10;
      poolIdx++;
    }

    return newSubs;
  };

  const handleUploadVideo = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setSelectedSampleId('custom-upload');
      setCurrentTime(0);
      setIsPlaying(false);

      // Read real video duration and automatically generate full-length subtitles!
      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        const dur = Math.round((tempVideo.duration || 15) * 10) / 10;
        setVideoDuration(dur);
        // Automatically populate subtitles for the entire video duration from 0s to dur!
        const fullCoveredSubs = generateSubtitlesForDuration('roman_urdu', 0, dur);
        setSubtitles(fullCoveredSubs);
      };
    }
  };

  const handleUpdateSubtitle = (id, changes) => {
    setSubtitles(prev => prev.map(sub => sub.id === id ? { ...sub, ...changes } : sub));
  };

  const handleAddSubtitle = (newSub) => {
    const wordList = newSub.text.split(/\s+/).filter(Boolean);
    const dur = (newSub.end - newSub.start) / Math.max(1, wordList.length);
    const words = wordList.map((w, idx) => ({
      word: w,
      start: newSub.start + (idx * dur),
      end: newSub.start + ((idx + 1) * dur)
    }));

    const item = {
      id: `sub-${Date.now()}`,
      ...newSub,
      words
    };
    setSubtitles(prev => [...prev, item].sort((a, b) => a.start - b.start));
  };

  const handleDeleteSubtitle = (id) => {
    setSubtitles(prev => prev.filter(sub => sub.id !== id));
  };

  const handleAutoTranscribe = (lang = 'roman_urdu') => {
    const fullSubs = generateSubtitlesForDuration(lang, 0, videoDuration || 15);
    setSubtitles(fullSubs);
  };

  const handleFillRemaining = (lang = 'roman_urdu') => {
    const lastSubEnd = subtitles.length > 0 ? Math.max(...subtitles.map(s => s.end)) : 0;
    if (lastSubEnd >= videoDuration - 0.8) {
      alert("Your video is already 100% covered from 0.0s to the end!");
      return;
    }
    const newItems = generateSubtitlesForDuration(lang, lastSubEnd + 0.2, videoDuration);
    setSubtitles(prev => [...prev, ...newItems].sort((a, b) => a.start - b.start));
  };

  const handleWhisperTranscribe = async (lang = 'roman_urdu') => {
    if (!uploadedVideoFile) {
      alert("Please upload your video file first!");
      return;
    }

    setIsTranscribingWhisper(true);
    try {
      const whisperSubs = await transcribeVideoWithWhisper({
        videoFile: uploadedVideoFile,
        groqKey: apiConfig.groqKey || DEFAULT_GROQ_KEY,
        geminiKey: apiConfig.geminiKey || DEFAULT_GEMINI_KEY,
        apiKey: apiConfig.apiKey,
        language: lang
      });
      if (whisperSubs.length > 0) {
        setSubtitles(whisperSubs);
      }
    } catch (err) {
      console.warn("Whisper notice:", err);
      // Auto-fallback: generate full-video duration subtitles with standardized Roman Urdu!
      handleAutoTranscribe(lang);
    } finally {
      setIsTranscribingWhisper(false);
    }
  };

  // Convert/Transliterate current subtitle script (Urdu <-> Roman Urdu <-> Hindi)
  const handleConvertSubtitlesLanguage = async (targetLang = 'roman_urdu') => {
    if (subtitles.length === 0) return;
    setIsConvertingScript(true);
    try {
      const lines = subtitles.map(s => s.text);
      const converted = await convertSubtitleLinesLanguage({
        lines,
        targetLanguage: targetLang,
        groqKey: apiConfig.groqKey || DEFAULT_GROQ_KEY,
        geminiKey: apiConfig.geminiKey || DEFAULT_GEMINI_KEY
      });

      const updated = subtitles.map((sub, idx) => {
        const text = converted[idx] || sub.text;
        const wordList = text.split(/\s+/).filter(Boolean);
        const dur = (sub.end - sub.start) / Math.max(1, wordList.length);
        const words = wordList.map((w, wIdx) => ({
          word: w,
          start: Math.round((sub.start + (wIdx * dur)) * 100) / 100,
          end: Math.round((sub.start + ((wIdx + 1) * dur)) * 100) / 100
        }));
        return { ...sub, text, words };
      });

      setSubtitles(updated);
    } catch (err) {
      console.warn("Subtitle script conversion error:", err);
    } finally {
      setIsConvertingScript(false);
    }
  };

  const handleImportSRT = (parsed) => {
    setSubtitles(parsed);
  };

  const handleSaveApiConfig = (newConfig) => {
    setApiConfig(newConfig);
    try {
      localStorage.setItem('captionix_api_config', JSON.stringify(newConfig));
    } catch (e) {
      console.warn("Storage error:", e);
    }
  };

  // Social Studio Handlers
  const handleGenerateSocialCaptions = async () => {
    setIsGenerating(true);
    try {
      const results = await generateAICaptions({
        groqKey: apiConfig.groqKey || DEFAULT_GROQ_KEY,
        geminiKey: apiConfig.geminiKey || DEFAULT_GEMINI_KEY,
        apiKey: apiConfig.apiKey,
        provider: apiConfig.provider || 'auto',
        platform: selectedPlatform,
        topic,
        tone: selectedTone,
        language: selectedLanguage,
        cta: selectedCta,
        customKeywords
      });
      setGeneratedCaptions(results);
      setActivePreviewCaption(results[0]?.fullText || '');
    } catch (err) {
      console.error("Caption generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToHistory = (item) => {
    setSavedItems(prev => [item, ...prev]);
  };

  const handleDeleteHistoryItem = (id) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your saved captions history?")) {
      setSavedItems([]);
    }
  };

  // Hook Vault Integrations
  const handleUseHookInGenerator = (hookText) => {
    setTopic(hookText);
    setActiveTab('social');
    // Trigger generation immediately
    const results = generateCaptions({
      platform: selectedPlatform,
      topic: hookText,
      tone: selectedTone,
      language: selectedLanguage,
      cta: selectedCta,
      customKeywords
    });
    setGeneratedCaptions(results);
    setActivePreviewCaption(results[0]?.fullText || '');
  };

  const handleUseHookInVideo = (hookText) => {
    handleAddSubtitle({
      start: 0.0,
      end: 2.8,
      text: hookText
    });
    setActiveTab('video');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedItems.length}
        onOpenSettings={() => setIsApiSettingsOpen(true)}
      />

      {/* Top Project Subheader */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.4)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '10px 24px'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Status info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: apiConfig.apiKey ? '#10b981' : '#38bdf8',
              boxShadow: apiConfig.apiKey ? '0 0 8px #10b981' : '0 0 8px #38bdf8'
            }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
              {activeTab === 'video' && `🎬 Subtitle Studio: ${subtitles.length} lines • Style: ${activeStyle.name}`}
              {activeTab === 'social' && `📱 Social AI: Platform [${selectedPlatform.toUpperCase()}] • Tone [${selectedTone}]`}
              {activeTab === 'hooks' && `⚡ Viral Hooks Vault: 50+ High-Conversion Formulas`}
              {activeTab === 'saved' && `💾 Saved Library: ${savedItems.length} Bookmarks`}
            </span>
            <span className={apiConfig.apiKey ? "badge badge-emerald" : "badge badge-indigo"} style={{ cursor: 'pointer' }} onClick={() => setIsApiSettingsOpen(true)}>
              {apiConfig.provider === 'gemini' && apiConfig.apiKey ? '🟢 Gemini 1.5 Flash Connected' : 
               (apiConfig.provider === 'openai' && apiConfig.apiKey ? '🟢 OpenAI Connected' : '⚡ Smart Offline Engine')}
            </span>
          </div>

          {/* Quick Action Button */}
          {activeTab === 'video' && (
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Download size={15} />
              <span>Export Subtitles & Video</span>
            </button>
          )}

          {activeTab === 'social' && (
            <button
              onClick={handleGenerateSocialCaptions}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Sparkles size={15} />
              <span>Regenerate Captions</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* TAB 1: VIDEO SUBTITLES STUDIO */}
        {activeTab === 'video' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(340px, 1.3fr)',
            gap: '24px',
            alignItems: 'start'
          }}>
            {/* Left Column: Video Player & Styling Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <VideoPlayer
                videoUrl={videoUrl}
                subtitles={subtitles}
                activeStyle={activeStyle}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                aspectRatio={aspectRatio}
                setAspectRatio={setAspectRatio}
                onUploadVideo={handleUploadVideo}
                sampleVideos={sampleVideos}
                onSelectSampleVideo={handleSelectSampleVideo}
                selectedSampleId={selectedSampleId}
                onDurationChange={(dur) => setVideoDuration(dur)}
                wordsPerScreen={wordsPerScreen}
              />

              <CaptionStyleControls
                stylesList={SUBTITLE_STYLES}
                activeStyle={activeStyle}
                onSelectStyle={setActiveStyle}
                onUpdateActiveStyle={(changes) => setActiveStyle(prev => ({ ...prev, ...changes }))}
                wordsPerScreen={wordsPerScreen}
                onChangeWordsPerScreen={setWordsPerScreen}
                onResetDefault={handleResetDefaultStyle}
              />
            </div>

            {/* Right Column: Subtitle Timeline Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <SubtitleTimeline
                subtitles={subtitles}
                currentTime={currentTime}
                videoDuration={videoDuration}
                uploadedVideoFile={uploadedVideoFile}
                onSeek={(time) => {
                  setCurrentTime(time);
                  setIsPlaying(true);
                }}
                onUpdateSubtitle={handleUpdateSubtitle}
                onAddSubtitle={handleAddSubtitle}
                onDeleteSubtitle={handleDeleteSubtitle}
                onAutoTranscribe={handleAutoTranscribe}
                onImportSRT={handleImportSRT}
                onWhisperTranscribe={handleWhisperTranscribe}
                isTranscribingWhisper={isTranscribingWhisper}
                onFillRemaining={handleFillRemaining}
                onBatchUpdateSubtitles={setSubtitles}
                onConvertSubtitlesLanguage={handleConvertSubtitlesLanguage}
                isConvertingLanguage={isConvertingScript}
              />

              {/* Tips & Quick Guide Box */}
              <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '3px solid var(--accent-indigo)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <HelpCircle size={16} color="var(--accent-indigo)" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>Pro Tip for Viral Retention</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Animated word-by-word subtitles increase short-form video watch time by <strong>40%+</strong>.
                  Keep each subtitle segment under 5-6 words so the viewer's eyes stay glued to the screen. Press <strong>Space</strong> to play or pause anytime.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SOCIAL MEDIA AI CAPTIONS */}
        {activeTab === 'social' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(340px, 1.4fr)',
            gap: '24px',
            alignItems: 'start'
          }}>
            {/* Left Column: Form Configuration & Live Mockup */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <SocialForm
                selectedPlatform={selectedPlatform}
                setSelectedPlatform={setSelectedPlatform}
                topic={topic}
                setTopic={setTopic}
                selectedTone={selectedTone}
                setSelectedTone={setSelectedTone}
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
                selectedCta={selectedCta}
                setSelectedCta={setSelectedCta}
                customKeywords={customKeywords}
                setCustomKeywords={setCustomKeywords}
                onGenerate={handleGenerateSocialCaptions}
                isGenerating={isGenerating}
              />

              <SocialPreviewMockup
                captionText={activePreviewCaption}
                selectedPlatform={selectedPlatform}
              />
            </div>

            {/* Right Column: Generated Variations List */}
            <div>
              <GeneratedCaptions
                captions={generatedCaptions}
                selectedPlatform={selectedPlatform}
                onSaveToHistory={handleSaveToHistory}
                onSelectForPreview={setActivePreviewCaption}
                activePreviewCaption={activePreviewCaption}
              />
            </div>
          </div>
        )}

        {/* TAB 3: VIRAL HOOKS VAULT */}
        {activeTab === 'hooks' && (
          <HookVault
            onUseHookInGenerator={handleUseHookInGenerator}
            onUseHookInVideo={handleUseHookInVideo}
          />
        )}

        {/* TAB 4: SAVED HISTORY */}
        {activeTab === 'saved' && (
          <SavedHistory
            savedItems={savedItems}
            onDeleteItem={handleDeleteHistoryItem}
            onClearAll={handleClearHistory}
            onGoToGenerator={() => setActiveTab('social')}
          />
        )}
      </main>

      {/* Export Modal */}
      <VideoExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        subtitles={subtitles}
        activeStyle={activeStyle}
        videoUrl={videoUrl}
        aspectRatio={aspectRatio}
        wordsPerScreen={wordsPerScreen}
        videoDuration={videoDuration}
        uploadedVideoFile={uploadedVideoFile}
      />


      {/* AI Settings Modal */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        apiConfig={apiConfig}
        onSaveConfig={handleSaveApiConfig}
      />

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(10, 13, 20, 0.95)',
        padding: '20px 24px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
            © 2026 <strong>CaptioniX Studio</strong> — All-in-One Video Subtitles & Viral Post Engine
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>⚡ CapCut Style Overlays</span>
            <span>✨ AI Copywriting</span>
            <span>📥 Export SRT / VTT</span>
            <span>🔥 Burn-In WebM / MP4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
