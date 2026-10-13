// Sample video presets, transcription data, and viral hooks library

export const SAMPLE_VIDEOS = [
  {
    id: 'demo-roman-urdu',
    title: '🇵🇰 Roman Urdu / Urdish Reel (9:16)',
    aspectRatio: '9:16',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
    duration: 15,
    subtitles: [
      {
        id: 'sub-ru-1',
        start: 0.0,
        end: 2.8,
        text: 'Agar aap 20s mein hain toh yeh ghalti mat karein',
        words: [
          { word: 'Agar', start: 0.0, end: 0.4 },
          { word: 'aap', start: 0.4, end: 0.8 },
          { word: '20s', start: 0.8, end: 1.2 },
          { word: 'mein', start: 1.2, end: 1.5 },
          { word: 'hain', start: 1.5, end: 1.8 },
          { word: 'toh', start: 1.8, end: 2.0 },
          { word: 'yeh', start: 2.0, end: 2.2 },
          { word: 'ghalti', start: 2.2, end: 2.5 },
          { word: 'mat', start: 2.5, end: 2.7 },
          { word: 'karein', start: 2.7, end: 2.8 }
        ]
      },
      {
        id: 'sub-ru-2',
        start: 3.0,
        end: 6.2,
        text: 'Ziada tar log sochte rehte hain aur shuru nahi karte',
        words: [
          { word: 'Ziada', start: 3.0, end: 3.4 },
          { word: 'tar', start: 3.4, end: 3.7 },
          { word: 'log', start: 3.7, end: 4.1 },
          { word: 'sochte', start: 4.1, end: 4.6 },
          { word: 'rehte', start: 4.6, end: 5.0 },
          { word: 'hain', start: 5.0, end: 5.3 },
          { word: 'aur', start: 5.3, end: 5.5 },
          { word: 'shuru', start: 5.5, end: 5.8 },
          { word: 'nahi', start: 5.8, end: 6.0 },
          { word: 'karte', start: 6.0, end: 6.2 }
        ]
      },
      {
        id: 'sub-ru-3',
        start: 6.5,
        end: 10.0,
        text: 'Rozana sirf 1% behtar banein aur compound effect dekhein',
        words: [
          { word: 'Rozana', start: 6.5, end: 7.0 },
          { word: 'sirf', start: 7.0, end: 7.4 },
          { word: '1%', start: 7.4, end: 7.9 },
          { word: 'behtar', start: 7.9, end: 8.4 },
          { word: 'banein', start: 8.4, end: 8.9 },
          { word: 'aur', start: 8.9, end: 9.2 },
          { word: 'compound', start: 9.2, end: 9.6 },
          { word: 'effect', start: 9.6, end: 9.8 },
          { word: 'dekhein', start: 9.8, end: 10.0 }
        ]
      },
      {
        id: 'sub-ru-4',
        start: 10.2,
        end: 14.2,
        text: 'Is post ko abhi save karein aur doston ke sath share karein 🚀',
        words: [
          { word: 'Is', start: 10.2, end: 10.5 },
          { word: 'post', start: 10.5, end: 10.9 },
          { word: 'ko', start: 10.9, end: 11.2 },
          { word: 'abhi', start: 11.2, end: 11.6 },
          { word: 'save', start: 11.6, end: 12.0 },
          { word: 'karein', start: 12.0, end: 12.4 },
          { word: 'aur', start: 12.4, end: 12.7 },
          { word: 'doston', start: 12.7, end: 13.2 },
          { word: 'ke', start: 13.2, end: 13.4 },
          { word: 'sath', start: 13.4, end: 13.7 },
          { word: 'share', start: 13.7, end: 14.0 },
          { word: 'karein', start: 14.0, end: 14.2 }
        ]
      }
    ]
  },
  {
    id: 'demo-reel',
    title: '📱 Motivational Reel (Vertical 9:16)',
    aspectRatio: '9:16',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
    duration: 15,
    subtitles: [
      {
        id: 'sub-1',
        start: 0.0,
        end: 2.2,
        text: 'Stop wasting your 20s on comfort',
        words: [
          { word: 'Stop', start: 0.0, end: 0.4 },
          { word: 'wasting', start: 0.4, end: 0.9 },
          { word: 'your', start: 0.9, end: 1.2 },
          { word: '20s', start: 1.2, end: 1.6 },
          { word: 'on', start: 1.6, end: 1.8 },
          { word: 'comfort', start: 1.8, end: 2.2 }
        ]
      },
      {
        id: 'sub-2',
        start: 2.3,
        end: 4.8,
        text: 'The biggest risk is not taking any risk at all',
        words: [
          { word: 'The', start: 2.3, end: 2.6 },
          { word: 'biggest', start: 2.6, end: 3.0 },
          { word: 'risk', start: 3.0, end: 3.4 },
          { word: 'is', start: 3.4, end: 3.6 },
          { word: 'not', start: 3.6, end: 3.9 },
          { word: 'taking', start: 3.9, end: 4.2 },
          { word: 'any', start: 4.2, end: 4.5 },
          { word: 'risk', start: 4.5, end: 4.8 }
        ]
      },
      {
        id: 'sub-3',
        start: 5.0,
        end: 8.0,
        text: 'Every single successful person was once an amateur',
        words: [
          { word: 'Every', start: 5.0, end: 5.4 },
          { word: 'single', start: 5.4, end: 5.8 },
          { word: 'successful', start: 5.8, end: 6.4 },
          { word: 'person', start: 6.4, end: 6.9 },
          { word: 'was', start: 6.9, end: 7.2 },
          { word: 'once', start: 7.2, end: 7.6 },
          { word: 'an', start: 7.6, end: 7.8 },
          { word: 'amateur', start: 7.8, end: 8.0 }
        ]
      },
      {
        id: 'sub-4',
        start: 8.2,
        end: 11.5,
        text: 'Start creating before you think you are ready',
        words: [
          { word: 'Start', start: 8.2, end: 8.7 },
          { word: 'creating', start: 8.7, end: 9.3 },
          { word: 'before', start: 9.3, end: 9.8 },
          { word: 'you', start: 9.8, end: 10.1 },
          { word: 'think', start: 10.1, end: 10.5 },
          { word: 'you', start: 10.5, end: 10.8 },
          { word: 'are', start: 10.8, end: 11.1 },
          { word: 'ready', start: 11.1, end: 11.5 }
        ]
      },
      {
        id: 'sub-5',
        start: 11.7,
        end: 14.5,
        text: 'Follow for daily mindset shifts and growth',
        words: [
          { word: 'Follow', start: 11.7, end: 12.2 },
          { word: 'for', start: 12.2, end: 12.5 },
          { word: 'daily', start: 12.5, end: 12.9 },
          { word: 'mindset', start: 12.9, end: 13.5 },
          { word: 'shifts', start: 13.5, end: 13.9 },
          { word: 'and', start: 13.9, end: 14.1 },
          { word: 'growth', start: 14.1, end: 14.5 }
        ]
      }
    ]
  },
  {
    id: 'demo-podcast',
    title: '🎙️ Business Podcast (Vertical 9:16)',
    aspectRatio: '9:16',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    poster: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80',
    duration: 15,
    subtitles: [
      {
        id: 'sub-p1',
        start: 0.0,
        end: 2.5,
        text: 'Nobody buys what you do. They buy WHY you do it.',
        words: [
          { word: 'Nobody', start: 0.0, end: 0.5 },
          { word: 'buys', start: 0.5, end: 0.9 },
          { word: 'what', start: 0.9, end: 1.3 },
          { word: 'you', start: 1.3, end: 1.6 },
          { word: 'do', start: 1.6, end: 1.9 },
          { word: 'They', start: 2.0, end: 2.2 },
          { word: 'buy', start: 2.2, end: 2.5 }
        ]
      },
      {
        id: 'sub-p2',
        start: 2.6,
        end: 5.5,
        text: 'When you solve a painful problem, price is irrelevant',
        words: [
          { word: 'When', start: 2.6, end: 2.9 },
          { word: 'you', start: 2.9, end: 3.2 },
          { word: 'solve', start: 3.2, end: 3.7 },
          { word: 'a', start: 3.7, end: 3.9 },
          { word: 'painful', start: 3.9, end: 4.4 },
          { word: 'problem', start: 4.4, end: 4.9 },
          { word: 'price', start: 4.9, end: 5.2 },
          { word: 'is', start: 5.2, end: 5.3 },
          { word: 'irrelevant', start: 5.3, end: 5.5 }
        ]
      },
      {
        id: 'sub-p3',
        start: 5.6,
        end: 9.0,
        text: 'Charge for value created, not hours worked.',
        words: [
          { word: 'Charge', start: 5.6, end: 6.2 },
          { word: 'for', start: 6.2, end: 6.5 },
          { word: 'value', start: 6.5, end: 7.0 },
          { word: 'created', start: 7.0, end: 7.6 },
          { word: 'not', start: 7.7, end: 8.1 },
          { word: 'hours', start: 8.1, end: 8.5 },
          { word: 'worked', start: 8.5, end: 9.0 }
        ]
      },
      {
        id: 'sub-p4',
        start: 9.2,
        end: 14.0,
        text: 'Save this post before you close your next deal 🚀',
        words: [
          { word: 'Save', start: 9.2, end: 9.7 },
          { word: 'this', start: 9.7, end: 10.1 },
          { word: 'post', start: 10.1, end: 10.6 },
          { word: 'before', start: 10.6, end: 11.2 },
          { word: 'you', start: 11.2, end: 11.6 },
          { word: 'close', start: 11.6, end: 12.2 },
          { word: 'your', start: 12.2, end: 12.6 },
          { word: 'next', start: 12.6, end: 13.1 },
          { word: 'deal', start: 13.1, end: 14.0 }
        ]
      }
    ]
  },
  {
    id: 'demo-cinematic',
    title: '🎬 Cinematic Vlog (Horizontal 16:9)',
    aspectRatio: '16:9',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    duration: 15,
    subtitles: [
      {
        id: 'sub-c1',
        start: 0.0,
        end: 3.5,
        text: 'Finding peace away from the city chaos',
        words: [
          { word: 'Finding', start: 0.0, end: 0.6 },
          { word: 'peace', start: 0.6, end: 1.2 },
          { word: 'away', start: 1.2, end: 1.8 },
          { word: 'from', start: 1.8, end: 2.2 },
          { word: 'the', start: 2.2, end: 2.5 },
          { word: 'city', start: 2.5, end: 3.0 },
          { word: 'chaos', start: 3.0, end: 3.5 }
        ]
      },
      {
        id: 'sub-c2',
        start: 3.8,
        end: 7.2,
        text: 'Some places make you realize how small we are',
        words: [
          { word: 'Some', start: 3.8, end: 4.2 },
          { word: 'places', start: 4.2, end: 4.8 },
          { word: 'make', start: 4.8, end: 5.2 },
          { word: 'you', start: 5.2, end: 5.5 },
          { word: 'realize', start: 5.5, end: 6.1 },
          { word: 'how', start: 6.1, end: 6.4 },
          { word: 'small', start: 6.4, end: 6.8 },
          { word: 'we', start: 6.8, end: 7.0 },
          { word: 'are', start: 7.0, end: 7.2 }
        ]
      },
      {
        id: 'sub-c3',
        start: 7.5,
        end: 12.0,
        text: 'Take a breath and enjoy the present moment',
        words: [
          { word: 'Take', start: 7.5, end: 8.0 },
          { word: 'a', start: 8.0, end: 8.2 },
          { word: 'breath', start: 8.2, end: 8.8 },
          { word: 'and', start: 8.8, end: 9.1 },
          { word: 'enjoy', start: 9.1, end: 9.7 },
          { word: 'the', start: 9.7, end: 10.0 },
          { word: 'present', start: 10.0, end: 10.7 },
          { word: 'moment', start: 10.7, end: 12.0 }
        ]
      }
    ]
  }
];

export const SUBTITLE_STYLES = [
  // 1. Hormozi Pop (Default)
  {
    id: 'hormozi',
    name: '🔥 Hormozi Pop',
    description: 'High impact uppercase with yellow active-word badge and bold black outline.',
    category: 'creator',
    className: 'caption-style-hormozi',
    fontFamily: 'Montserrat',
    fontSize: 26,
    textTransform: 'uppercase',
    color: '#ffffff',
    activeColor: '#facc15',
    activeBg: 'rgba(0,0,0,0.85)',
    stroke: '1.5px #000000',
    position: 75,
    isDefault: true
  },
  // 2. Kalakar Iconic: Bubble Style
  {
    id: 'bubble',
    name: '🫧 Bubble Style',
    description: 'Kalakar signature: rounded colorful pill bubble behind the active word with playful bouncy pop.',
    category: 'kalakar',
    className: 'caption-style-bubble',
    fontFamily: 'Montserrat',
    fontSize: 26,
    textTransform: 'none',
    color: '#ffffff',
    activeColor: '#0f172a',
    activeBg: '#38bdf8',
    stroke: 'none',
    position: 75
  },
  // 3. Kalakar Iconic: Raj Shamani
  {
    id: 'raj',
    name: '🎙️ Raj Shamani',
    description: 'Top Indian podcaster style: crisp white typography with vibrant yellow active word punch and sleek shadow.',
    category: 'kalakar',
    className: 'caption-style-raj',
    fontFamily: 'Montserrat',
    fontSize: 25,
    textTransform: 'none',
    color: '#ffffff',
    activeColor: '#facc15',
    activeBg: 'transparent',
    stroke: 'none',
    position: 76
  },
  // 4. Kalakar Iconic: Iman Gadzhi
  {
    id: 'iman',
    name: '👑 Iman Gadzhi',
    description: 'Ultra-luxury agency aesthetic: high-fashion serif font with gold shimmer active word and refined tracking.',
    category: 'creator',
    className: 'caption-style-iman',
    fontFamily: 'Cinzel',
    fontSize: 24,
    textTransform: 'uppercase',
    color: '#e2e8f0',
    activeColor: '#fbbf24',
    activeBg: 'transparent',
    stroke: 'none',
    position: 78
  },
  // 5. MrBeast Neon Glow
  {
    id: 'glow',
    name: '✨ MrBeast Glow',
    description: 'Vibrant cyan & electric blue dual neon glow with bouncy energetic typography.',
    category: 'creator',
    className: 'caption-style-glow',
    fontFamily: 'Outfit',
    fontSize: 28,
    textTransform: 'none',
    color: '#ffffff',
    activeColor: '#38bdf8',
    activeBg: 'transparent',
    stroke: 'none',
    position: 78
  },
  // 6. CapCut Viral Pop
  {
    id: 'capcut',
    name: '🎬 CapCut Viral Pop',
    description: 'Crisp bold white typography with emerald green active-word punch and dark outline.',
    category: 'creator',
    className: 'caption-style-capcut',
    fontFamily: 'Montserrat',
    fontSize: 26,
    textTransform: 'uppercase',
    color: '#ffffff',
    activeColor: '#10b981',
    activeBg: 'transparent',
    stroke: '1.5px #000000',
    position: 75
  },
  // 7. Kalakar Iconic: Devin Jatho
  {
    id: 'devin',
    name: '⚡ Devin Jatho',
    description: 'Kinetic creator energy: electric lime green and cyan high-contrast pop with sharp uppercase tracking.',
    category: 'creator',
    className: 'caption-style-devin',
    fontFamily: 'Montserrat',
    fontSize: 27,
    textTransform: 'uppercase',
    color: '#ffffff',
    activeColor: '#a3e635',
    activeBg: 'transparent',
    stroke: '1px #000000',
    position: 74
  },
  // 8. Kalakar Iconic: Mumbai Bollywood Pop
  {
    id: 'mumbai',
    name: '✨ Mumbai Bollywood',
    description: 'Vibrant Desi festive palette: saffron orange, royal gold, and deep magenta glowing gradient pop.',
    category: 'kalakar',
    className: 'caption-style-mumbai',
    fontFamily: 'Montserrat',
    fontSize: 27,
    textTransform: 'none',
    color: '#ffffff',
    activeColor: '#fb923c',
    activeBg: 'transparent',
    stroke: 'none',
    position: 75
  },
  // 9. Kalakar Iconic: Varun Mayya Cyber
  {
    id: 'varun',
    name: '🤖 Varun Mayya',
    description: 'Futuristic AI creator aesthetic: sleek cyber HUD monospace styling with glowing cyan accents.',
    category: 'kalakar',
    className: 'caption-style-varun',
    fontFamily: 'Space Grotesk',
    fontSize: 24,
    textTransform: 'none',
    color: '#94a3b8',
    activeColor: '#22d3ee',
    activeBg: 'transparent',
    stroke: 'none',
    position: 76
  },
  // 10. Kalakar Iconic: Editing School
  {
    id: 'skool',
    name: '🎓 Editing School',
    description: 'Dark translucent frosted box backing with crisp bold white font and vivid neon emerald active word.',
    category: 'creator',
    className: 'caption-style-skool',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 23,
    textTransform: 'none',
    color: '#ffffff',
    activeColor: '#4ade80',
    activeBg: 'transparent',
    stroke: 'none',
    position: 78
  },
  // 11. Nas Daily
  {
    id: 'nas',
    name: '🟡 Nas Daily',
    description: 'Signature bright yellow box background behind the spoken word with razor-sharp black text.',
    category: 'creator',
    className: 'caption-style-nas',
    fontFamily: 'Montserrat',
    fontSize: 26,
    textTransform: 'uppercase',
    color: '#ffffff',
    activeColor: '#000000',
    activeBg: '#facc15',
    stroke: 'none',
    position: 74
  },
  // 12. BeerBiceps Spiritual Podcast
  {
    id: 'beerbiceps',
    name: '🧘 BeerBiceps',
    description: 'Warm contemplative podcast aesthetic: saffron amber radiance with gentle dark backing.',
    category: 'kalakar',
    className: 'caption-style-beerbiceps',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 24,
    textTransform: 'none',
    color: '#f1f5f9',
    activeColor: '#f59e0b',
    activeBg: 'transparent',
    stroke: 'none',
    position: 77
  },
  // 13. Dhruv Rathee Explainer
  {
    id: 'dhruv',
    name: '📰 Dhruv Rathee',
    description: 'Documentary explainer style: dark navy rounded pill bar with clean white and crimson keyword emphasis.',
    category: 'kalakar',
    className: 'caption-style-dhruv',
    fontFamily: 'Inter',
    fontSize: 23,
    textTransform: 'none',
    color: '#ffffff',
    activeColor: '#ef4444',
    activeBg: 'transparent',
    stroke: 'none',
    position: 80
  },
  // 14. Netflix Cinema Box
  {
    id: 'netflix',
    name: '🟥 Netflix Cinema',
    description: 'Sleek dark translucent frosted bar with warm amber active word for cinematic documentaries.',
    category: 'cinematic',
    className: 'caption-style-netflix',
    fontFamily: 'Inter',
    fontSize: 22,
    textTransform: 'none',
    color: '#ffffff',
    activeColor: '#fbbf24',
    activeBg: 'transparent',
    stroke: 'none',
    position: 80
  },
  // 15. TikTok Box Highlight
  {
    id: 'tiktok',
    name: '🟡 TikTok Highlight',
    description: 'Punchy uppercase with bright yellow pill badge behind active word.',
    category: 'cinematic',
    className: 'caption-style-tiktok',
    fontFamily: 'Montserrat',
    fontSize: 25,
    textTransform: 'uppercase',
    color: '#ffffff',
    activeColor: '#000000',
    activeBg: '#facc15',
    stroke: '1px #000000',
    position: 74
  },
  // 16. Frosted Minimalist
  {
    id: 'minimal',
    name: '🌿 Frosted Minimalist',
    description: 'Clean Apple-style frosted glass capsule with subtle purple highlight.',
    category: 'cinematic',
    className: 'caption-style-minimal',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 22,
    textTransform: 'none',
    color: '#ffffff',
    activeColor: '#818cf8',
    activeBg: 'transparent',
    stroke: 'none',
    position: 80
  },
  // 17. Cyberpunk Neon
  {
    id: 'neon',
    name: '⚡ Cyberpunk Neon',
    description: 'Bold condensed Bebas font with intense magenta & violet neon radiance.',
    category: 'cinematic',
    className: 'caption-style-neon',
    fontFamily: 'Bebas Neue',
    fontSize: 34,
    textTransform: 'uppercase',
    color: '#f43f5e',
    activeColor: '#c084fc',
    activeBg: 'transparent',
    stroke: 'none',
    position: 72
  },
  // 18. Comic Punch
  {
    id: 'comic',
    name: '💥 Comic Punch',
    description: 'Energetic rotated sticker badge with comic border and red accent.',
    category: 'cinematic',
    className: 'caption-style-comic',
    fontFamily: 'Montserrat',
    fontSize: 24,
    textTransform: 'none',
    color: '#111827',
    activeColor: '#dc2626',
    activeBg: 'transparent',
    stroke: 'none',
    position: 75
  },
  // 19. Karaoke Pulse
  {
    id: 'karaoke',
    name: '🎤 Karaoke Pulse',
    description: 'Dim grey text that dynamically illuminates in bright gold as words are spoken.',
    category: 'cinematic',
    className: 'caption-style-karaoke',
    fontFamily: 'Montserrat',
    fontSize: 25,
    textTransform: 'none',
    color: 'rgba(255,255,255,0.45)',
    activeColor: '#fbbf24',
    activeBg: 'transparent',
    stroke: 'none',
    position: 76
  },
  // 20. Ali Abdaal Studio
  {
    id: 'abdaal',
    name: '💎 Ali Abdaal Studio',
    description: 'Clean editorial aesthetic with warm ivory text and pastel lavender accent.',
    category: 'creator',
    className: 'caption-style-abdaal',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 23,
    textTransform: 'none',
    color: '#f8fafc',
    activeColor: '#c084fc',
    activeBg: 'transparent',
    stroke: 'none',
    position: 78
  },
  // 21. Red Alert Impact
  {
    id: 'redalert',
    name: '🚨 Red Alert Impact',
    description: 'High-urgency crimson red badge with bold white uppercase warning text.',
    category: 'cinematic',
    className: 'caption-style-redalert',
    fontFamily: 'Montserrat',
    fontSize: 24,
    textTransform: 'uppercase',
    color: '#ffffff',
    activeColor: '#fef08a',
    activeBg: 'transparent',
    stroke: 'none',
    position: 75
  },
  // 22. 80s Synthwave
  {
    id: 'synthwave',
    name: '📼 80s Synthwave',
    description: 'Retro cyan & hot pink glowing chrome gradient with vaporwave energy.',
    category: 'cinematic',
    className: 'caption-style-synthwave',
    fontFamily: 'Bebas Neue',
    fontSize: 32,
    textTransform: 'uppercase',
    color: '#f43f5e',
    activeColor: '#22d3ee',
    activeBg: 'transparent',
    stroke: 'none',
    position: 72
  },
  // 23. Rapid 1-Word Center
  {
    id: 'rapid',
    name: '⚡ Rapid 1-Word Center',
    description: 'Ultra-large single punch word in the middle of screen for maximum retention.',
    category: 'creator',
    className: 'caption-style-rapid',
    fontFamily: 'Montserrat',
    fontSize: 36,
    textTransform: 'uppercase',
    color: '#ffffff',
    activeColor: '#facc15',
    activeBg: 'transparent',
    stroke: '2px #000000',
    position: 50
  }
];

export const VIRAL_HOOKS = [
  {
    category: 'Curiosity Gap',
    hook: "Most creators don't know this, but here is what happens when you...",
    niche: 'Growth & Business'
  },
  {
    category: 'Curiosity Gap',
    hook: "This one subtle change got me 10x more reach in 7 days:",
    niche: 'Social Media'
  },
  {
    category: 'Curiosity Gap',
    hook: "Stop scrolling if you want to fix your productivity today.",
    niche: 'Lifestyle'
  },
  {
    category: 'Contrarian Take',
    hook: "Unpopular opinion: Hard work alone is NOT going to make you rich.",
    niche: 'Mindset'
  },
  {
    category: 'Contrarian Take',
    hook: "Stop posting every single day. Here is what the algorithm actually wants:",
    niche: 'Marketing'
  },
  {
    category: 'Contrarian Take',
    hook: "Why 99% of people fail with their online business (It's not money):",
    niche: 'Entrepreneurship'
  },
  {
    category: 'Step-by-Step Value',
    hook: "The exact 3-step formula I used to go from 0 to 50k followers:",
    niche: 'Content Creation'
  },
  {
    category: 'Step-by-Step Value',
    hook: "5 free AI tools that feel completely illegal to know:",
    niche: 'AI & Tech'
  },
  {
    category: 'Step-by-Step Value',
    hook: "How to write captions that convert viewers into paying clients:",
    niche: 'Copywriting'
  },
  {
    category: 'Desi / Roman Urdu',
    hook: "Agar aap bhi yeh ghalti kar rahe hain toh abhi band kardein!",
    niche: 'General Viral'
  },
  {
    category: 'Desi / Roman Urdu',
    hook: "Yeh 3 AI tools aapka 10 ghante ka kaam 10 minute mein kar denge:",
    niche: 'Tech & Freelancing'
  },
  {
    category: 'Desi / Roman Urdu',
    hook: "Freelancing mein pehla order lena itna mushkil nahi hai agar...",
    niche: 'Freelancing'
  },
  {
    category: 'Urgency & FOMO',
    hook: "Before Instagram removes this feature, make sure you activate it:",
    niche: 'Instagram Tips'
  },
  {
    category: 'Urgency & FOMO',
    hook: "You have 3 seconds to catch someone's attention. Here's how to win:",
    niche: 'Video Editing'
  }
];

export const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: 'Instagram', maxChars: 2200, hashtagLimit: 30, color: '#e1306c' },
  { id: 'tiktok', name: 'TikTok', icon: 'Video', maxChars: 4000, hashtagLimit: 15, color: '#00f2fe' },
  { id: 'youtube', name: 'YouTube Shorts', icon: 'Youtube', maxChars: 5000, hashtagLimit: 10, color: '#ff0000' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', maxChars: 3000, hashtagLimit: 5, color: '#0a66c2' },
  { id: 'twitter', name: 'X / Twitter', icon: 'Twitter', maxChars: 280, hashtagLimit: 3, color: '#1d9bf0' },
  { id: 'facebook', name: 'Facebook', icon: 'Facebook', maxChars: 63206, hashtagLimit: 10, color: '#1877f2' }
];

export const TONE_OPTIONS = [
  { id: 'viral', label: '🔥 Viral & Hook-heavy', desc: 'Punchy lines, curiosity gaps, maximum comments' },
  { id: 'professional', label: '💼 Professional & Authority', desc: 'Polished, authoritative, industry insights' },
  { id: 'storytelling', label: '📖 Storytelling & Emotional', desc: 'Personal narrative, emotional resonance' },
  { id: 'educational', label: '💡 Educational & Actionable', desc: 'Step-by-step breakdown with bullet points' },
  { id: 'humorous', label: '😂 Relatable & Humorous', desc: 'Witty, conversational, meme-friendly' },
  { id: 'urgency', label: '⚡ Urgent / FOMO', desc: 'Direct, time-sensitive, compelling CTA' },
  { id: 'desi', label: '🇵🇰 Roman Urdu / Hinglish', desc: 'Natural conversational desi slang & relatable tone' }
];

export const LANGUAGE_OPTIONS = [
  { id: 'roman_urdu', label: '🇵🇰 Roman Urdu / Urdish (Pakistani Creator Style)' },
  { id: 'urdu', label: '🇵🇰 اردو (Proper Urdu Nastaliq Script)' },
  { id: 'hindi', label: '🇮🇳 हिन्दी (Hindi Devanagari Script)' },
  { id: 'hinglish', label: '🇮🇳 Hinglish (Desi / Indian Creator Style)' },
  { id: 'en', label: '🌐 English (Global Viral)' },
  { id: 'arabic', label: '🇸🇦 العربية (Arabic)' },
  { id: 'spanish', label: '🇪🇸 Español' }
];
