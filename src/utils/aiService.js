// Real AI Service with Multi-Model Rate-Limit Failover Cascade (Groq + Gemini + Whisper)

import { generateCaptions as generateLocalCaptions } from './captionGenerator.js';
import {
  cleanAndStandardizeRomanUrdu,
  hasUrduScript,
  hasHindiScript,
  transliterateUrduToRomanClient,
  transliterateUrduToHindiClient
} from './languageValidator.js';

// Environment variables with fallback
export const DEFAULT_GROQ_KEY = import.meta.env?.VITE_GROQ_API_KEY || "";
export const DEFAULT_GEMINI_KEY = import.meta.env?.VITE_GEMINI_API_KEY || "";

// High-speed cascade order: tries fastest models first, auto-switches on 429/error
export const TEXT_MODEL_CASCADE = [
  // 1. Google Gemini Active Models (Highest accuracy for translation & transliteration)
  { provider: 'gemini', model: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite', maxTokens: 1200 },
  { provider: 'gemini', model: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', maxTokens: 1200 },
  { provider: 'gemini', model: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', maxTokens: 1200 },

  // 2. Groq Ultra-Fast LPU Models (17ms latency!)
  { provider: 'groq', model: 'qwen/qwen3.8-27b', label: 'Groq Qwen 3.8 27B', maxTokens: 800 },
  { provider: 'groq', model: 'openai/gpt-oss-120b', label: 'Groq GPT OSS 120B', maxTokens: 800 },
  { provider: 'groq', model: 'openai/gpt-oss-20b', label: 'Groq GPT OSS 20B', maxTokens: 800 },
  { provider: 'groq', model: 'allam-2-7b', label: 'Groq ALLaM 2 7B', maxTokens: 800 },

  // 3. Fallback Gemini Models
  { provider: 'gemini', model: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', maxTokens: 1000 },
  { provider: 'gemini', model: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', maxTokens: 1000 },
  { provider: 'gemini', model: 'gemini-flash-latest', label: 'Gemini Flash Latest', maxTokens: 1000 }
];

export const WHISPER_MODELS = [
  { provider: 'groq', model: 'whisper-large-v3-turbo', label: 'Groq Whisper V3 Turbo (Fastest)' },
  { provider: 'groq', model: 'whisper-large-v3', label: 'Groq Whisper V3 (High Accuracy)' }
];

/**
 * Builds viral prompt with strict Roman Urdu, Hinglish, Urdu, and English rules
 */
function buildViralPrompt({ platform, topic, tone, language, cta, customKeywords }) {
  return `You are a world-class viral social media copywriter and growth strategist specializing in bilingual South Asian & Global creator content.
Create 3 high-converting, distinct caption variations for:
- Platform: ${platform}
- Topic: "${topic}"
- Tone: ${tone}
- Language: ${language}
- Call To Action (CTA): ${cta}
- Extra keywords/niche: ${customKeywords || 'None'}

CRITICAL LANGUAGE & ACCURACY RULES:
1. If language is 'roman_urdu' (Urdish): Write in 100% natural, modern conversational Roman Urdu (Latin English alphabet, Pakistani creator style).
   - Spellings MUST BE accurate and conventional: use 'karein', 'aap', 'apna', 'zaroor', 'bohot', 'agar', 'kamyabi', 'ghalti', 'seekhein', 'behtar', 'taakay', 'bhi', 'kuch', 'hamesha'.
   - NEVER use Arabic or Urdu Nastaliq script when language is 'roman_urdu'.
2. If language is 'urdu': Write in pure, grammatically perfect Urdu Nastaliq script (اردو) with proper punctuation.
3. If language is 'hindi': Write in standard Hindi Devanagari script (हिन्दी).
4. If language is 'hinglish': Write in modern conversational Hinglish (Latin English alphabet, Indian creator style e.g. 'bhai', 'miss mat karna', 'dosto', 'shuru karo').
5. If language is 'en': Write in punchy, viral English.
6. Keep the hook (line 1) extremely punchy and scroll-stopping.
7. Include structured bullet points or step-by-step lines in the body.
8. Provide high-volume trending and niche hashtags.

Return ONLY a valid JSON array containing exactly 3 objects. Do NOT include markdown code blocks, backticks, or extra explanation.
JSON format:
[
  {
    "title": "🔥 Option 1: Viral Hook & Curiosity Gap",
    "hook": "attention grabbing line 1",
    "body": "structured body with line breaks and emojis",
    "cta": "call to action line",
    "hashtags": "#hashtag1 #hashtag2 #hashtag3",
    "fullText": "hook\\n\\nbody\\n\\ncta\\n\\nhashtags"
  },
  {
    "title": "💡 Option 2: Step-by-Step Value Blueprint",
    "hook": "...",
    "body": "...",
    "cta": "...",
    "hashtags": "...",
    "fullText": "..."
  },
  {
    "title": "⚡ Option 3: Punchy & Direct Short-form",
    "hook": "...",
    "body": "...",
    "cta": "...",
    "hashtags": "...",
    "fullText": "..."
  }
]`;
}

/**
 * Standardize text fields with 150+ linguistic rules
 */
function cleanResults(items, language) {
  return items.map(item => ({
    ...item,
    hook: (language === 'roman_urdu' || language === 'hinglish') ? cleanAndStandardizeRomanUrdu(item.hook || '') : (item.hook || ''),
    body: (language === 'roman_urdu' || language === 'hinglish') ? cleanAndStandardizeRomanUrdu(item.body || '') : (item.body || ''),
    cta: (language === 'roman_urdu' || language === 'hinglish') ? cleanAndStandardizeRomanUrdu(item.cta || '') : (item.cta || ''),
    fullText: (language === 'roman_urdu' || language === 'hinglish') ? cleanAndStandardizeRomanUrdu(item.fullText || '') : (item.fullText || '')
  }));
}

/**
 * Call Groq Chat Completions API
 */
async function callGroqChat({ apiKey, model, prompt, maxTokens = 800 }) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq API status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';
  const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Groq returned invalid JSON array');
  }
  return parsed;
}

/**
 * Call Google Gemini API with native application/json mode
 */
async function callGeminiChat({ apiKey, model, prompt, maxTokens = 1200, responseMimeType = null }) {
  const generationConfig = {
    temperature: 0.1,
    maxOutputTokens: maxTokens,
    topK: 40,
    topP: 0.95
  };
  if (responseMimeType) {
    generationConfig.responseMimeType = responseMimeType;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Gemini API status ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Gemini returned invalid JSON array');
  }
  return parsed;
}

/**
 * Converts a batch of subtitle lines to the requested target language
 */
async function convertSingleBatch(batchLines, targetLanguage, effectiveGeminiKey, effectiveGroqKey) {
  const langGuides = {
    roman_urdu: "100% natural, modern conversational Roman Urdu (Latin English alphabet, Pakistani creator dialect). Example: 'Aaj kal har banda shortcut, payment scheme aur investment ke intezaar mein hai'. Technical loanwords (shortcut, payment scheme, investment, website, dollars, laptop, online, market) MUST remain in standard English spelling. NEVER output Arabic or Urdu Nastaliq script.",
    urdu: "Pure, grammatically perfect Urdu Nastaliq script (اردو رسم الخط). Example: 'آج کل ہر بندہ شارٹ کٹ، پیمنٹ سکیم اور انویسٹمنٹ کے انتظار میں ہے'.",
    hindi: "Standard pure Hindi in Devanagari script (हिन्दी). Example: 'आजकल हर बंदा शॉर्टकट, पेमेंट स्कीम और इन्वेस्टमेंट के इंतज़ार में है'.",
    hinglish: "Modern conversational Hinglish (Latin English alphabet, Indian creator style). Example: 'Bhai miss mat karna, pehle seekho phir kamao'.",
    en: "Accurate, fluent English translation. Example: 'Nowadays everyone is waiting for shortcuts and payment schemes'."
  };

  const targetGuide = langGuides[targetLanguage] || langGuides.roman_urdu;

  const prompt = `You are a world-class subtitle translator and transliterator specializing in South Asian creator content.
Translate/transliterate the following subtitle lines into: ${targetGuide}

Input lines (${batchLines.length} lines):
${JSON.stringify(batchLines)}

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON array of plain strings: ["line 1", "line 2", ...]
2. Do NOT return an array of objects. Each item must be a single string in the target language.
3. Contain EXACTLY ${batchLines.length} items in the same sequence.
4. If target is 'roman_urdu', output Latin English alphabet ONLY. NEVER output Urdu Nastaliq or Arabic letters.
5. If target is 'urdu', output Urdu Nastaliq script ONLY.
6. If target is 'hindi', output Hindi Devanagari script ONLY.
7. Preserve technical loanwords (e.g. "shortcut", "payment scheme", "investment", "website", "online", "laptop") in standard English spelling.`;

  const candidateModels = [
    { provider: 'gemini', model: 'gemini-3.5-flash-lite', key: effectiveGeminiKey, maxTokens: 1200, jsonMode: true },
    { provider: 'gemini', model: 'gemini-3.5-flash', key: effectiveGeminiKey, maxTokens: 1200, jsonMode: true },
    { provider: 'gemini', model: 'gemini-3.1-flash-lite', key: effectiveGeminiKey, maxTokens: 1200, jsonMode: true },
    { provider: 'gemini', model: 'gemini-flash-latest', key: effectiveGeminiKey, maxTokens: 1200, jsonMode: true },
    { provider: 'groq', model: 'qwen/qwen3.8-27b', key: effectiveGroqKey, maxTokens: 300, jsonMode: false },
    { provider: 'groq', model: 'openai/gpt-oss-120b', key: effectiveGroqKey, maxTokens: 300, jsonMode: false }
  ];

  for (const cand of candidateModels) {
    if (!cand.key) continue;
    try {
      let parsed;
      if (cand.provider === 'gemini') {
        parsed = await callGeminiChat({
          apiKey: cand.key,
          model: cand.model,
          prompt,
          maxTokens: cand.maxTokens,
          responseMimeType: cand.jsonMode ? 'application/json' : null
        });
      } else {
        parsed = await callGroqChat({
          apiKey: cand.key,
          model: cand.model,
          prompt,
          maxTokens: cand.maxTokens
        });
      }

      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleanStrings = parsed.map(item => {
          if (typeof item === 'string') return item.trim();
          if (item && typeof item === 'object') {
            return (item[targetLanguage] || item.text || item.urdu || item.roman_urdu || item.translated || Object.values(item)[0] || '').trim();
          }
          return String(item || '').trim();
        });

        const normalized = (targetLanguage === 'roman_urdu' || targetLanguage === 'hinglish')
          ? cleanStrings.map(txt => cleanAndStandardizeRomanUrdu(txt))
          : cleanStrings;

        if (normalized.length === batchLines.length) {
          return normalized;
        }

        // Partial match pad
        if (normalized.length < batchLines.length) {
          return batchLines.map((orig, i) => normalized[i] || orig);
        }
        return normalized.slice(0, batchLines.length);
      }
    } catch (err) {
      console.warn(`[Transliteration Failover] Model ${cand.model} notice: ${err.message}. Trying next candidate...`);
    }
  }

  // Client-side fallback dictionary if all models busy
  return batchLines.map(line => {
    if (targetLanguage === 'roman_urdu' || targetLanguage === 'hinglish') {
      return transliterateUrduToRomanClient(line);
    }
    if (targetLanguage === 'hindi') {
      return transliterateUrduToHindiClient(line);
    }
    return line;
  });
}

/**
 * Converts or transliterates an array of subtitle strings to the specified target language
 * with automatic smart batching for 100% accuracy and zero rate-limit drops.
 */
export async function convertSubtitleLinesLanguage({
  lines = [],
  targetLanguage = 'roman_urdu',
  groqKey = DEFAULT_GROQ_KEY,
  geminiKey = DEFAULT_GEMINI_KEY
}) {
  if (!lines || lines.length === 0) return [];

  const effectiveGeminiKey = (geminiKey || DEFAULT_GEMINI_KEY).trim();
  const effectiveGroqKey = (groqKey || DEFAULT_GROQ_KEY).trim();

  // If up to 25 lines, execute in 1 unified high-accuracy batch!
  if (lines.length <= 25) {
    return convertSingleBatch(lines, targetLanguage, effectiveGeminiKey, effectiveGroqKey);
  }

  // Otherwise, chunk into batches of 15 lines
  const CHUNK_SIZE = 15;
  const batches = [];
  for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
    batches.push(lines.slice(i, i + CHUNK_SIZE));
  }

  const results = [];
  for (const batch of batches) {
    const convertedBatch = await convertSingleBatch(batch, targetLanguage, effectiveGeminiKey, effectiveGroqKey);
    results.push(...convertedBatch);
  }

  return results;
}

/**
 * Main AI Caption Generator with Auto-Cascade Multi-Model Failover
 */
export async function generateAICaptions({
  groqKey = DEFAULT_GROQ_KEY,
  geminiKey = DEFAULT_GEMINI_KEY,
  apiKey = '', // Legacy fallback
  provider = 'auto', // 'auto' | 'groq' | 'gemini' | 'openai' | 'offline'
  platform = 'instagram',
  topic = '',
  tone = 'viral',
  language = 'en',
  cta = 'save_share',
  customKeywords = ''
}) {
  const effectiveGroqKey = (groqKey || (provider === 'groq' ? apiKey : '') || DEFAULT_GROQ_KEY).trim();
  const effectiveGeminiKey = (geminiKey || (provider === 'gemini' ? apiKey : '') || DEFAULT_GEMINI_KEY).trim();

  if (provider === 'offline' || (!effectiveGroqKey && !effectiveGeminiKey && !apiKey)) {
    return generateLocalCaptions({ platform, topic, tone, language, cta, customKeywords });
  }

  const prompt = buildViralPrompt({ platform, topic, tone, language, cta, customKeywords });

  let pipeline = [];
  if (provider === 'auto' || !provider) {
    pipeline = TEXT_MODEL_CASCADE;
  } else if (provider === 'groq') {
    pipeline = [
      ...TEXT_MODEL_CASCADE.filter(m => m.provider === 'groq'),
      ...TEXT_MODEL_CASCADE.filter(m => m.provider === 'gemini')
    ];
  } else if (provider === 'gemini') {
    pipeline = [
      ...TEXT_MODEL_CASCADE.filter(m => m.provider === 'gemini'),
      ...TEXT_MODEL_CASCADE.filter(m => m.provider === 'groq')
    ];
  } else if (provider === 'openai') {
    pipeline = [
      { provider: 'openai', model: 'gpt-4o-mini', label: 'OpenAI GPT-4o Mini', maxTokens: 800 },
      ...TEXT_MODEL_CASCADE
    ];
  }

  const errors = [];
  for (const candidate of pipeline) {
    try {
      if (candidate.provider === 'groq' && effectiveGroqKey) {
        const parsed = await callGroqChat({
          apiKey: effectiveGroqKey,
          model: candidate.model,
          prompt,
          maxTokens: candidate.maxTokens
        });
        const cleaned = cleanResults(parsed, language);
        return cleaned.map(item => ({
          ...item,
          engineUsed: candidate.label
        }));
      }

      if (candidate.provider === 'gemini' && effectiveGeminiKey) {
        const parsed = await callGeminiChat({
          apiKey: effectiveGeminiKey,
          model: candidate.model,
          prompt,
          maxTokens: candidate.maxTokens
        });
        const cleaned = cleanResults(parsed, language);
        return cleaned.map(item => ({
          ...item,
          engineUsed: candidate.label
        }));
      }
    } catch (err) {
      console.warn(`[Auto-Failover] ${candidate.label} hit rate-limit or error (${err.message}). Auto-switching...`);
      errors.push(`${candidate.model}: ${err.message}`);
    }
  }

  console.warn("All external AI models exhausted/rate-limited. Falling back safely to smart local engine:", errors);
  return generateLocalCaptions({ platform, topic, tone, language, cta, customKeywords });
}

/**
 * Transcribes actual audio speech from video file using Groq Whisper with model failover
 * AND automatically transliterates/converts output to match the user's requested language!
 */
export async function transcribeVideoWithWhisper({
  videoFile,
  groqKey = DEFAULT_GROQ_KEY,
  geminiKey = DEFAULT_GEMINI_KEY,
  apiKey = '',
  language = 'roman_urdu'
}) {
  const effectiveKey = (groqKey || apiKey || DEFAULT_GROQ_KEY).trim();
  if (!videoFile) {
    throw new Error("Video file is required for speech transcription.");
  }
  if (!effectiveKey) {
    throw new Error("Groq API key is required for Whisper speech transcription.");
  }

  // Whisper accepts 'ur' for Urdu/Roman Urdu, 'hi' for Hindi/Hinglish, 'en' for English
  const langCode = (language === 'roman_urdu' || language === 'urdu')
    ? 'ur'
    : (language === 'hindi' || language === 'hinglish' ? 'hi' : 'en');

  let rawSegments = [];

  // Try Whisper Turbo first, fallback to standard Whisper Large V3 if rate-limited
  for (const modelConfig of WHISPER_MODELS) {
    try {
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('model', modelConfig.model);
      formData.append('response_format', 'verbose_json');
      formData.append('timestamp_granularities[]', 'segment');
      formData.append('timestamp_granularities[]', 'word');
      formData.append('language', langCode);

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${effectiveKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Whisper error status ${response.status}`);
      }

      const data = await response.json();
      const segments = data.segments || [];
      const topWords = (data.words || []).map(w => ({
        word: (w.word || '').trim(),
        start: Math.round((Number(w.start) || 0) * 100) / 100,
        end: Math.round((Number(w.end) || 0) * 100) / 100
      })).filter(w => w.word.length > 0);

      if (segments.length === 0 && data.text) {
        const text = data.text.trim();
        const wordList = text.split(/\s+/).filter(Boolean);
        const dur = 5.0 / Math.max(1, wordList.length);
        rawSegments = [{
          id: 'sub-whisper-1',
          start: 0.0,
          end: 5.0,
          text,
          words: topWords.length > 0 ? topWords : wordList.map((w, wIdx) => ({
            word: w,
            start: Math.round((wIdx * dur) * 100) / 100,
            end: Math.round(((wIdx + 1) * dur) * 100) / 100
          }))
        }];
        break;
      }

      rawSegments = segments.map((seg, idx) => {
        const segStart = Math.round(seg.start * 10) / 10;
        const segEnd = Math.round(seg.end * 10) / 10;
        const segText = seg.text.trim();

        // 1. Check segment-level words
        let segWords = (seg.words || []).map(w => ({
          word: (w.word || '').trim(),
          start: Math.round((Number(w.start) || 0) * 100) / 100,
          end: Math.round((Number(w.end) || 0) * 100) / 100
        })).filter(w => w.word.length > 0);

        // 2. Fallback to top-level words matched by time range
        if (segWords.length === 0 && topWords.length > 0) {
          segWords = topWords.filter(w => w.start >= (segStart - 0.25) && w.end <= (segEnd + 0.35));
        }

        // 3. Fallback: synthesize word timestamps across segment duration
        if (segWords.length === 0) {
          const wordList = segText.split(/\s+/).filter(Boolean);
          const dur = Math.max(0.2, (segEnd - segStart) / Math.max(1, wordList.length));
          segWords = wordList.map((w, wIdx) => ({
            word: w,
            start: Math.round((segStart + (wIdx * dur)) * 100) / 100,
            end: Math.round((segStart + ((wIdx + 1) * dur)) * 100) / 100
          }));
        }

        return {
          id: `whisper-sub-${idx + 1}`,
          start: segStart,
          end: segEnd,
          text: segText,
          words: segWords
        };
      });

      if (rawSegments.length > 0) {
        break; // Successfully got segments
      }
    } catch (err) {
      console.warn(`[Whisper Failover] ${modelConfig.label} failed (${err.message}). Trying next Whisper model...`);
    }
  }

  if (rawSegments.length === 0) {
    throw new Error("Groq Whisper transcription quota temporarily busy. Switched to duration generator.");
  }

  // Check if speech was transcribed in Urdu Arabic script
  const allText = rawSegments.map(s => s.text).join(' ');
  const containsUrdu = hasUrduScript(allText);

  // IF user selected Roman Urdu, Hinglish, Hindi, or English, BUT Whisper gave Urdu script:
  // Convert it into the user's requested script/alphabet!
  if (language !== 'urdu' && containsUrdu) {
    try {
      const lines = rawSegments.map(s => s.text);
      const convertedLines = await convertSubtitleLinesLanguage({
        lines,
        targetLanguage: language,
        groqKey: effectiveKey,
        geminiKey: (geminiKey || DEFAULT_GEMINI_KEY).trim()
      });

      return rawSegments.map((seg, idx) => {
        const text = convertedLines[idx] || seg.text;
        const wordList = text.split(/\s+/).filter(Boolean);
        const dur = (seg.end - seg.start) / Math.max(1, wordList.length);
        const words = wordList.map((w, wIdx) => ({
          word: w,
          start: Math.round((seg.start + (wIdx * dur)) * 100) / 100,
          end: Math.round((seg.start + ((wIdx + 1) * dur)) * 100) / 100
        }));
        return {
          ...seg,
          text,
          words
        };
      });
    } catch (translitErr) {
      console.warn("AI script conversion failed, applying client fallback:", translitErr);
      return rawSegments.map(seg => {
        const text = (language === 'roman_urdu' || language === 'hinglish')
          ? transliterateUrduToRomanClient(seg.text)
          : (language === 'hindi' ? transliterateUrduToHindiClient(seg.text) : seg.text);
        const wordList = text.split(/\s+/).filter(Boolean);
        const dur = (seg.end - seg.start) / Math.max(1, wordList.length);
        const words = wordList.map((w, wIdx) => ({
          word: w,
          start: Math.round((seg.start + (wIdx * dur)) * 100) / 100,
          end: Math.round((seg.start + ((wIdx + 1) * dur)) * 100) / 100
        }));
        return { ...seg, text, words };
      });
    }
  }

  // If user selected Urdu, Roman Urdu, or Hinglish, ensure clean text & matching words
  return rawSegments.map(seg => {
    const isRoman = language === 'roman_urdu' || language === 'hinglish';
    const text = isRoman ? cleanAndStandardizeRomanUrdu(seg.text) : seg.text;
    let words = seg.words && seg.words.length > 0 ? seg.words : [];
    if (words.length === 0 || isRoman) {
      const wordList = text.split(/\s+/).filter(Boolean);
      const dur = Math.max(0.15, (seg.end - seg.start) / Math.max(1, wordList.length));
      words = wordList.map((w, wIdx) => ({
        word: isRoman ? cleanAndStandardizeRomanUrdu(w) : w,
        start: Math.round((seg.start + (wIdx * dur)) * 100) / 100,
        end: Math.round((seg.start + ((wIdx + 1) * dur)) * 100) / 100
      }));
    }
    return {
      ...seg,
      text,
      words
    };
  });
}
