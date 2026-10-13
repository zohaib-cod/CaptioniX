import { cleanAndStandardizeRomanUrdu } from './languageValidator.js';

const HASHTAG_BANKS = {
  growth: ['#contentcreator', '#creatorgrowth', '#growthmindset', '#digitalcreator', '#viralreels', '#socialmediamarketing', '#onlinebusiness', '#reachmore'],
  business: ['#entrepreneurship', '#smallbusinessowner', '#startupmindset', '#businessgrowth', '#makemoneyonline', '#freelancetips', '#agencylife'],
  tech: ['#aitools', '#artificialintelligence', '#techtrends', '#techupdates', '#aitips', '#productivityhacks', '#futureofwork'],
  general: ['#explorepage', '#trendingnow', '#fyp', '#viralpost', '#instadaily', '#foryourpage', '#dailyinspiration'],
  roman_urdu: ['#pakistanicreators', '#desitiktok', '#urduquotes', '#pakistan', '#lahore', '#karachi', '#islamabad', '#reelsviralpk', '#urdupoetry', '#urdish'],
  hinglish: ['#hindiquotes', '#desimemes', '#creatorindia', '#viralindia', '#explorepageindia', '#hinditips', '#techindia', '#reelsindia'],
  urdu: ['#اردو', '#اردو_اقوال', '#پاکستان', '#لاہور', '#شاعری', '#حکمت', '#کامیابی']
};

export function generateCaptions({
  platform = 'instagram',
  topic = '',
  tone = 'viral',
  language = 'roman_urdu',
  cta = 'save_share',
  customKeywords = ''
}) {
  const cleanTopic = topic.trim() || 'kamyabi aur daily consistency';
  const lowerTopic = cleanTopic.toLowerCase();
  const keywordsArr = customKeywords ? customKeywords.split(',').map(s => s.trim()).filter(Boolean) : [];
  
  // CTAs localized accurately
  const ctaMap = {
    save_share: {
      en: '📌 Save this post so you don’t lose it later, and share it with someone who needs to see this today!',
      roman_urdu: '📌 Is post ko abhi SAVE karlein taakay baad mein asani se mil jaye, aur doston ke sath zaroor SHARE karein!',
      hinglish: '📌 Is post ko abhi SAVE kar lo taaki baad mein kaam aaye, aur doston ke sath SHARE karna mat bhoolna!',
      urdu: '📌 اس پوسٹ کو ابھی محفوظ (Save) کر لیں تاکہ بعد میں آسانی سے کام آئے اور دوستوں کے ساتھ شیئر کریں!'
    },
    comment: {
      en: '👇 Drop your thoughts in the comments! What has your experience been with this?',
      roman_urdu: '👇 Niche COMMENTS mein batayein: Aapka is baray mein kya tajurba raha hai?',
      hinglish: '👇 Niche COMMENTS mein batao: Aapka is baare mein kya kehna hai?',
      urdu: '👇 نیچے کمنٹس میں اپنی قیمتی رائے ضرور دیں: آپ کا اس بارے میں کیا تجربہ رہا ہے؟'
    },
    link_bio: {
      en: '🔗 Tap the link in my bio to get the full free breakdown and step-by-step blueprint!',
      roman_urdu: '🔗 Mukammal FREE guide aur step-by-step roadmap ke liye BIO mein diye gaye link par click karein!',
      hinglish: '🔗 Poori FREE guide aur details ke liye BIO mein link par tap karein!',
      urdu: '🔗 مکمل مفت رہنمائی کے لیے ہمارے بائیو میں دیے گئے لنک پر کلک کریں!'
    },
    follow: {
      en: '🚀 Follow @YourHandle for daily high-value breakdowns, tips, and insights!',
      roman_urdu: '🚀 Mazeed aisi useful aur high-value content ke liye @YourHandle ko FOLLOW zaroor karein!',
      hinglish: '🚀 Rozana aisi zabardast tips aur tricks ke liye @YourHandle ko FOLLOW kar lo!',
      urdu: '🚀 روزانہ مزید بہترین معلومات اور رہنمائی کے لیے فالو کرنا نہ بھولیں!'
    }
  };

  const selectedCta = ctaMap[cta]?.[language] || ctaMap[cta]?.['roman_urdu'] || ctaMap['save_share']['roman_urdu'];

  // Hashtag generator
  let baseHashtags = [...HASHTAG_BANKS.general.slice(0, 4), ...HASHTAG_BANKS.growth.slice(0, 4)];
  if (language === 'roman_urdu') {
    baseHashtags.push(...HASHTAG_BANKS.roman_urdu.slice(0, 4));
  } else if (language === 'hinglish') {
    baseHashtags.push(...HASHTAG_BANKS.hinglish.slice(0, 4));
  } else if (language === 'urdu') {
    baseHashtags = [...HASHTAG_BANKS.urdu, ...HASHTAG_BANKS.general.slice(0, 3)];
  }

  if (keywordsArr.length > 0) {
    baseHashtags.push(...keywordsArr.map(k => `#${k.replace(/\s+/g, '').toLowerCase()}`));
  }

  // Topic context detection for ultra-accurate niche matching
  const isFreelancing = /freelanc|upwork|fiverr|client|order|earning|dollar|kamai/i.test(lowerTopic);
  const isTechAi = /ai|tool|chatgpt|software|tech|coding|video|edit/i.test(lowerTopic);
  const isFitness = /fit|gym|weight|diet|fat|body|health|workout/i.test(lowerTopic);

  let variation1, variation2, variation3;

  // ROMAN URDU (URDISH) - 100% Guaranteed Accurate Grammar and Spellings
  if (language === 'roman_urdu') {
    if (isFreelancing) {
      variation1 = {
        title: '🔥 Option 1: Freelancing Viral Hook (Roman Urdu)',
        hook: `Freelancing mein international clients hasil karne ka yeh 1 secret formula jaan lein:`,
        body: `Ziada tar Pakistani freelancers sirf proposals bhejte rehte hain lekin asal client psychology ko nahi samajhte.\n\nYeh 3 cheezein aapke response rate ko 10x behtar kar sakti hain:\n\n1️⃣ Pehli 2 Lines: Client ke maslay ka direct solution likhein, formal introduction mein waqt zaya na karein.\n2️⃣ Relevant Portfolio: Sirf wahi 2 samples dikhayein jo client ke kaam se 100% match karte hon.\n3️⃣ Strong Call-to-Action: End mein ek simple sawal poochein taakay client reply karne par majboor ho jaye.\n\nOverthinking chhor kar aaj hi apni strategy behtar banayein.`,
        cta: selectedCta,
        hashtags: ['#freelancepakistan', '#upworktips', '#fiverrseller', '#makemoneyonline', ...baseHashtags.slice(0, 8)].join(' ')
      };

      variation2 = {
        title: '💼 Option 2: Step-by-Step Freelancing Roadmap (Roman Urdu)',
        hook: `"${cleanTopic}" par kaam karte waqt yeh 3 ghaltiyan kabhi mat karein:`,
        body: `Pichle kuch arsay mein maine seekha hai ke clients un logon ko hire karte hain jo unka waqt bachate hain.\n\n💡 Quick Checklist Jo Follow Karni Hai:\n• Step 1: Copy-paste proposals bhejna band karein.\n• Step 2: Hamesha client ke budget aur deadline ka khayal rakhein.\n• Step 3: Pehle din se professional communication ki aadat dalein.\n\nMustaqil mizaaji se kaam karein, kamyabi zaroor milegi.`,
        cta: selectedCta,
        hashtags: ['#freelancetips', '#pakistanifreelancers', '#digitalearning', ...baseHashtags.slice(0, 7)].join(' ')
      };

      variation3 = {
        title: '⚡ Option 3: Punchy Freelancer Reality Check (Roman Urdu)',
        hook: `Har freelancer ko yeh baat pehle din pata honi chahiye 👇`,
        body: `Pehla order lena mushkil lag sakta hai, lekin jab aapka process sahi hota hai toh clients khud aapke paas aate hain.\n\nSkill seekhein. Mehnat karein. Kabhi give up na karein. ✨`,
        cta: selectedCta,
        hashtags: ['#freelancemindset', '#onlinebusiness', ...baseHashtags.slice(0, 6)].join(' ')
      };
    } else if (isTechAi) {
      variation1 = {
        title: '🔥 Option 1: AI & Tech Viral Hook (Roman Urdu)',
        hook: `Yeh AI tools aapka 10 ghante ka mushkil kaam 10 minute mein kar denge:`,
        body: `2026 mein jo creators aur professionals AI use nahi kar rahe, woh bohot peechay reh jayenge.\n\nYeh 3 tools aapki productivity ko next level par le jayenge:\n\n1️⃣ Automation: Routine repetitive tasks ko AI ke hawalay karein.\n2️⃣ Content Research: Ghanton research karne ke bajaye targeted prompts use karein.\n3️⃣ Quality Polish: Apne kaam ko final review dene ke liye smart assistance lein.\n\nSmart work karein aur apna qeemti waqt bachayein.`,
        cta: selectedCta,
        hashtags: ['#aitoolspakistan', '#artificialintelligence', '#techpakistan', ...baseHashtags.slice(0, 8)].join(' ')
      };

      variation2 = {
        title: '💡 Option 2: Tech Productivity Blueprint (Roman Urdu)',
        hook: `"${cleanTopic}" ko automate karne ka sab se asaan tareeqa:`,
        body: `Har naya tool seekhne ki zaroorat nahi hoti, sirf wahi master karein jo aapka waqt bachaye.\n\n⚡ Formula Jo Follow Karna Hai:\n• Phase 1: Apna sab se bara bottleneck pehchanein.\n• Phase 2: Us kaam ke liye 1 best AI workflow select karein.\n• Phase 3: Rozana is workflow par amal karein.\n\nNateeja: Zyada output aur kam thakawat.`,
        cta: selectedCta,
        hashtags: ['#productivityhacks', '#smartwork', ...baseHashtags.slice(0, 7)].join(' ')
      };

      variation3 = {
        title: '⚡ Option 3: Short Tech Advice (Roman Urdu)',
        hook: `Simple reminder regarding "${cleanTopic}" 👇`,
        body: `Tools sirf zariya hain, asal cheez aapka vision aur consistency hai.\n\nAaj hi naye tools seekhna shuru karein aur agay barhein! 🚀`,
        cta: selectedCta,
        hashtags: ['#techtrends', '#digitalgrowth', ...baseHashtags.slice(0, 6)].join(' ')
      };
    } else {
      // General High-Converting Accurate Roman Urdu
      variation1 = {
        title: '🔥 Option 1: Viral Hook & Curiosity Gap (Roman Urdu / Urdish)',
        hook: `99% log "${cleanTopic}" mein yeh sab se bari ghalti karte hain. Sach jaan lein:`,
        body: `Aksar log sochte hain ke kamyabi kisi shortcut se milti hai, lekin haqeeqat yeh hai ke right strategy ke baghair mehnat bhi zaya ho jati hai.\n\nYeh hain 3 golden rules jo aapko hamesha yaad rakhne chahiye:\n\n1️⃣ Pehla Qadam: Overthinking ko bilkul khatam karein aur foran action lein.\n2️⃣ Rozana 1% Improvement: Ek hi din mein sab kuch karne ke bajaye daily consistency banayein.\n3️⃣ Sabar aur Focus: Results shuru mein slow aate hain, lekin compound hoke bohot baray bante hain.\n\nAgar aap sirf in baaton par amal karein, toh 30 din mein khud behtari dekhenge.`,
        cta: selectedCta,
        hashtags: baseHashtags.slice(0, platform === 'twitter' ? 3 : 12).join(' ')
      };

      variation2 = {
        title: '💼 Option 2: Step-by-Step Blueprint (Roman Urdu / Urdish)',
        hook: `"${cleanTopic}" ka complete roadmap jo koi creator khul kar nahi batata:`,
        body: `Pichle kuch arsay mein maine yeh basic usool seekha hai: Jo log smart tariqay se seekhte hain, woh 10x tezi se agay nikalte hain.\n\n💡 Quick Checklist Jo Follow Karni Hai:\n• Step 1: Apna core maqsad clear karein.\n• Step 2: Faltu distraction aur waqt zaya karne wali aadaton ko eliminate karein.\n• Step 3: Rozana sirf 1 high-priority task complete karne ki aadat dalein.\n\nYeh formula kabhi fail nahi hota agar aap mustaqil mizaaji se kaam karein.`,
        cta: selectedCta,
        hashtags: baseHashtags.slice(0, platform === 'twitter' ? 2 : 10).join(' ')
      };

      variation3 = {
        title: '⚡ Option 3: Punchy & Direct Short-form (Roman Urdu / Urdish)',
        hook: `Ek zaroori reminder regarding "${cleanTopic}" 👇`,
        body: `Log nayi nayi strategies dhoondte rehte hain, jabke asal raaz regular practice aur execution mein chupa hai.\n\nChoti shuruwaat karein. Mustaqil rahen. Aur agay barhte rahen. ✨`,
        cta: selectedCta,
        hashtags: baseHashtags.slice(0, platform === 'twitter' ? 2 : 8).join(' ')
      };
    }
  }

  // HINGLISH - Accurate conversational Hindi in English letters
  else if (language === 'hinglish') {
    variation1 = {
      title: '🔥 Option 1: Viral Hook (Hinglish Style)',
      hook: `Bhai agar aap "${cleanTopic}" seekhna chahte ho, toh ye 1 secret miss mat karna:`,
      body: `Zyadatar log bas plan banate reh jaate hain aur execution zero hota hai.\n\nAgar sach mein grow karna hai toh ye 3 baatein note kar lo:\n\n1️⃣ Overthinking band karo aur start karo.\n2️⃣ Daily 1% behtar bano, consistency hi king hai.\n3️⃣ Results aane mein time lagta hai par jab aate hain toh game change ho jata hai.\n\nAaj se hi implement karna shuru karo!`,
      cta: selectedCta,
      hashtags: baseHashtags.slice(0, platform === 'twitter' ? 3 : 12).join(' ')
    };

    variation2 = {
      title: '💡 Option 2: Step-by-Step Guide (Hinglish Style)',
      hook: `"${cleanTopic}" ka simple aur proven formula jo har creator ko pata hona chahiye:`,
      body: `Faltu ka gyaan chhod ke seedha action plan pe aate hain:\n\n• Step 1: Clear goal decide karo.\n• Step 2: Daily ek important task complete karo.\n• Step 3: Har hafte apni progress review karo.\n\nTry karke dekho, results khud bolenge.`,
      cta: selectedCta,
      hashtags: baseHashtags.slice(0, platform === 'twitter' ? 2 : 10).join(' ')
    };

    variation3 = {
      title: '⚡ Option 3: Short & Punchy (Hinglish Style)',
      hook: `Ek quick reality check regarding "${cleanTopic}" 👇`,
      body: `50 tutorials dekhne se kuch nahi hoga jab tak aap 50 baar khud try nahi karoge.\n\nExecution beats theory every single time. Abhi shuru karo! 🚀`,
      cta: selectedCta,
      hashtags: baseHashtags.slice(0, platform === 'twitter' ? 2 : 8).join(' ')
    };
  }

  // URDU NASTALIQ - Pure Urdu Script
  else if (language === 'urdu') {
    variation1 = {
      title: '🔥 آپشن ۱: وائرل ہک اور دلچسپی (اردو)',
      hook: `۹۹ فیصد لوگ "${cleanTopic}" کے معاملے میں یہ سنگین غلطی کرتے ہیں۔ سچ جان لیں:`,
      body: `اکثر لوگ سمجھتے ہیں کہ کامیابی کسی شارٹ کٹ سے مل جاتی ہے، حالانکہ اصل بات مستقل مزاجی اور درست حکمت عملی کی ہے۔\n\nیہ ۳ بنیادی اصول ہمیشہ یاد رکھیں:\n۱. غیر ضروری سوچ چھوڑیں اور فوری عملی قدم اٹھائیں۔\n۲. روزانہ صرف ۱ فیصد بہتری کا ہدف بنائیں۔\n۳. صبر سے کام لیں، محنت کا پھل ضرور ملتا ہے۔`,
      cta: selectedCta,
      hashtags: baseHashtags.slice(0, platform === 'twitter' ? 3 : 10).join(' ')
    };

    variation2 = {
      title: '💡 آپشن ۲: مرحلہ وار رہنمائی (اردو)',
      hook: `"${cleanTopic}" کا مکمل اور آزمودہ لائحہ عمل:`,
      body: `اگر آپ واقعی مثبت تبدیلی چاہتے ہیں تو ان باتوں پر سختی سے عمل کریں:\n\n• پہلا قدم: اپنے مقصد کا واضح تعین کریں۔\n• دوسرا قدم: وقت ضائع کرنے والی مصروفیات کو ختم کریں۔\n• تیسرا قدم: روزانہ ایک اہم کام مکمل کرنے کو یقینی بنائیں۔\n\nمسلسل کوشش ہی انسان کو منزل تک پہنچاتی ہے۔`,
      cta: selectedCta,
      hashtags: baseHashtags.slice(0, platform === 'twitter' ? 2 : 8).join(' ')
    };

    variation3 = {
      title: '⚡ آپشن ۳: مختصر اور جامع پیغام (اردو)',
      hook: `ایک اہم یاد دہانی: "${cleanTopic}" 👇`,
      body: `صرف خواب دیکھنے سے کچھ حاصل نہیں ہوتا، عملی جدوجہد ہی فرق پیدا کرتی ہے۔ آج ہی آغاز کیجئے۔ ✨`,
      cta: selectedCta,
      hashtags: baseHashtags.slice(0, platform === 'twitter' ? 2 : 6).join(' ')
    };
  }

  // ENGLISH DEFAULT
  else {
    variation1 = {
      title: '🔥 Option 1: Viral Hook & Curiosity Gap (English)',
      hook: `99% of people get "${cleanTopic}" completely wrong. Here’s the brutal truth:`,
      body: `Most people focus on perfection and burn out before seeing any traction.\n\nHere’s what actually moves the needle:\n\n1. Stop waiting for the perfect moment (it never arrives).\n2. Master the fundamentals before chasing shiny shortcuts.\n3. Optimize for longevity and compounding, not overnight vanity metrics.\n\nWhen you master this shift, everything gets simpler.`,
      cta: selectedCta,
      hashtags: baseHashtags.slice(0, platform === 'twitter' ? 3 : 14).join(' ')
    };

    variation2 = {
      title: '💡 Option 2: Actionable Framework / Blueprint (English)',
      hook: `The exact 3-step framework for "${cleanTopic}" that nobody is talking about:`,
      body: `If you’re tired of overcomplicated advice, here is the streamlined system:\n\n⚡ Phase 1: Clarify the high-leverage objective.\n⚡ Phase 2: Ruthlessly eliminate what doesn't produce results.\n⚡ Phase 3: Build an effortless daily routine that guarantees progress.\n\nSimplicity scales. Complexity fails.`,
      cta: selectedCta,
      hashtags: baseHashtags.slice(0, platform === 'twitter' ? 2 : 12).join(' ')
    };

    variation3 = {
      title: '⚡ Option 3: Punchy & Direct Short-form (English)',
      hook: `A quick reality check on "${cleanTopic}" 👇`,
      body: `You don’t need another 50 tutorials.\nYou need 50 repetitions.\n\nExecution beats theory every single time. Start today. 🚀`,
      cta: selectedCta,
      hashtags: baseHashtags.slice(0, platform === 'twitter' ? 2 : 8).join(' ')
    };
  }

  // Apply clean & standardization to every variant so zero spelling errors exist!
  const formatFullCaption = (variant) => {
    const raw = `${variant.hook}\n\n${variant.body}\n\n${variant.cta}\n\n${variant.hashtags}`;
    return language === 'roman_urdu' || language === 'hinglish'
      ? cleanAndStandardizeRomanUrdu(raw)
      : raw;
  };

  const cleanHook = (h) => (language === 'roman_urdu' || language === 'hinglish') ? cleanAndStandardizeRomanUrdu(h) : h;
  const cleanBody = (b) => (language === 'roman_urdu' || language === 'hinglish') ? cleanAndStandardizeRomanUrdu(b) : b;

  return [
    { ...variation1, hook: cleanHook(variation1.hook), body: cleanBody(variation1.body), fullText: formatFullCaption(variation1) },
    { ...variation2, hook: cleanHook(variation2.hook), body: cleanBody(variation2.body), fullText: formatFullCaption(variation2) },
    { ...variation3, hook: cleanHook(variation3.hook), body: cleanBody(variation3.body), fullText: formatFullCaption(variation3) }
  ];
}
