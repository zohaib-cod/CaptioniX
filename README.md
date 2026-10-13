# ⚡ CaptioniX Studio

<div align="center">

![CaptioniX Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop&q=80)

### **The All-In-One AI Video Subtitle Studio & Viral Content Engine**

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-8.0-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)](https://ffmpeg.org/)
[![Groq](https://img.shields.io/badge/Groq-Whisper%20V3-f55036?style=for-the-badge)](https://groq.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini%20Flash-4285f4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

*Create scroll-stopping Alex Hormozi & CapCut-style animated captions, transcribe speech with Groq Whisper, and generate viral social media copy in Roman Urdu, Urdu, Hindi, Hinglish, and English.*

---

</div>

## 🌟 Highlights & Key Features

### 🎬 1. Viral Caption Studio
* **20+ Designer Templates:** Pixel-perfect styles inspired by **Alex Hormozi**, **CapCut Trending**, **Devin Jaffe**, **Iman Gadzhi**, **Raj Shamani**, **BeerBiceps**, **Ali Abdaal**, **Neon Synthwave**, **Comic Pop**, **Netflix Minimal**, and more.
* **Karaoke Word-by-Word Animation:** Active words dynamically highlight with vibrant colors, pill backgrounds, SVG glow effects, and micro-scale animations (1.18x size pop).
* **Flexible Pacing Controls:** Display 1 word, 2 words, 3 words, 5 words, or full sentences per screen.
* **Bilingual Multi-Script Support:** Seamlessly switch and transliterate between **Roman Urdu (Urdish)**, **Urdu Nastaliq (اردو)**, **Hindi Devanagari (हिन्दी)**, **Hinglish**, and **English**.
* **1-Click Grammar & Spell-Check:** 150+ linguistic rules to auto-correct common Roman Urdu and Hinglish spelling inconsistencies.

---

### 🎙️ 2. High-Speed Speech Transcription
* **Groq Whisper Large V3:** Ultra-fast speech recognition (LPU-accelerated, transcribing 30s audio in under 2 seconds) with exact **word-level timestamps**.
* **Live Voice Dictate:** Built-in Web Speech API microphone dictation to speak and immediately add captions at the current playback position.
* **SRT & VTT Support:** 1-click import and export of standard subtitle files.

---

### 🚀 3. Studio-Grade Video Rendering (Anti-Freeze & True Colors)
* **Monotonic PTS Normalization:** Eliminates player stutters, frozen frames, and keyframe hangs with strict timecode reconstruction via FFmpeg.
* **100% Rec.709 Color Preservation:** Locks in standard BT.709 color matrix metadata to ensure original contrast, highlights, and skin tones never wash out.
* **Universal MP4 Compatibility:** Encoded using standard `H.264 (yuv420p)` and `AAC 256k` for instant, smooth playback across iOS, Android, macOS, Windows, and all social platforms.
* **Native 4K & 1080p Export:** Auto-detects source resolution (`👑 Original / Source Resolution`), supports pristine 4K UHD (60 Mbps), high-fidelity 1080p, 720p, and **4K Transparent Alpha WebM** overlay for Premiere Pro / DaVinci Resolve editors.

---

### 💡 4. Social Studio & Viral Hook Engine
* **Multi-Platform Copywriter:** Generates high-converting captions and hashtags tailored for Instagram Reels, TikTok, YouTube Shorts, LinkedIn, X (Twitter), and Facebook.
* **3 High-Impact Angles:**
  1. *Viral Hook & Curiosity Gap*
  2. *Step-by-Step Value Blueprint*
  3. *Punchy & Direct Short-Form*
* **Curated Hook Vault:** 50+ battle-tested viral hooks organized by niche (Finance, Tech, Productivity, Storytelling, Controversial).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Vanilla CSS Glassmorphism |
| **Icons** | Lucide React |
| **Video Processing** | HTML5 Canvas, MediaRecorder API, FFmpeg 8.0 |
| **AI Speech-to-Text** | Groq Whisper Large V3 / Turbo |
| **AI Copywriting** | Google Gemini 2.5 / 3.5 Flash & Groq Llama-3 / Qwen Cascade |
| **Subtitles** | Custom EBML WebM duration fixer, SRT / VTT parsers |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18.0 or higher)
* **npm** or **yarn** / **pnpm**
* **FFmpeg** installed on your system (for server-side universal MP4 remuxing)
  ```bash
  # Ubuntu / Debian
  sudo apt update && sudo apt install ffmpeg

  # macOS (Homebrew)
  brew install ffmpeg

  # Windows (Chocolatey)
  choco install ffmpeg
  ```

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zohaib-cod/CaptioniX.git
   cd CaptioniX
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API Keys (Optional but Recommended):**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Add your free keys:
   ```env
   VITE_GROQ_API_KEY=gsk_your_groq_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(You can also input your API keys directly in the app UI via the **Settings (⚙️)** modal without modifying any code).*

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```text
CaptioniX/
├── public/                 # Static assets & sample audio/video
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Navigation header & tab switcher
│   │   ├── ApiSettingsModal.jsx    # Model configuration & API keys modal
│   │   ├── VideoStudio/            # Video player, timeline & styling
│   │   │   ├── VideoPlayer.jsx         # Live video preview with caption overlay
│   │   │   ├── SubtitleTimeline.jsx    # Segment editor, timeline & mic dictate
│   │   │   ├── CaptionStyleControls.jsx# 20+ viral style cards & typography
│   │   │   └── VideoExportModal.jsx    # 4K/1080p canvas render & MP4 export
│   │   ├── SocialStudio/           # Viral AI post generator
│   │   │   ├── SocialForm.jsx          # Topic, tone, CTA & prompt builder
│   │   │   └── SocialPreviewMockup.jsx # Live platform mockups (IG, TikTok, etc.)
│   │   └── HookVault/              # 50+ viral hook templates library
│   ├── data/
│   │   └── sampleData.js           # Subtitle styles, presets & hooks data
│   ├── utils/
│   │   ├── aiService.js            # Gemini & Groq multi-model cascade
│   │   ├── languageValidator.js    # Roman Urdu & Hindi standardization rules
│   │   ├── subtitleExporter.js     # SRT & VTT generator / parser
│   │   └── webmDurationFixer.js    # EBML header duration patcher
│   ├── App.jsx                     # Core application layout & state
│   ├── main.jsx                    # Application entry point
│   └── index.css                   # Premium dark glassmorphism design system
├── vite.config.js          # Vite config with FFmpeg stream-to-disk middleware
├── package.json
└── README.md
```

---

## 🎯 How to Use

1. **Upload Video:** Drag and drop your video (MP4, MOV, WebM up to 4K).
2. **Generate Captions:**
   * Click **AI Transcribe Full Video** to let Whisper detect speech automatically with word timestamps, OR
   * Use **Voice Dictate** to speak missing lines directly into your microphone, OR
   * Import an existing `.srt` / `.vtt` file.
3. **Customize Style:** Choose from 20+ viral templates (Hormozi, Devin, CapCut, etc.) and fine-tune font size, color, outline, and words-per-screen.
4. **Export:** Click **Export Video**, pick your preferred quality (**👑 Original Source**, **1080p Full HD**, **4K Ultra HD**, or **Transparent Alpha**), and download your finished video!

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/zohaib-cod/CaptioniX/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/zohaib-cod">Zohaib</a> • Powered by Google Gemini & Groq</sub>
</div>
