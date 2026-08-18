export const PRODUCTS = [
  {
    id: 'neuro-ads',
    name: 'Neuro Ad Copy',
    bn: 'নিউরো অ্যাড কপি',
    kind: 'tool',
    channel: 'Meta · Google · TikTok',
    credits: 3,
    price: 0,
    blurb: 'ডোপামিন, ফোকাস ও লস-অ্যাভারশন ট্রিগার দিয়ে কনভার্টিং অ্যাড ভ্যারিয়েন্ট।',
    deliverable: 'প্রাইমারি টেক্সট, হুক, CTA — ডিজিটাল ডেলিভারি',
  },
  {
    id: 'headline-lab',
    name: 'Headline Lab',
    bn: 'হেডলাইন ল্যাব',
    kind: 'tool',
    channel: 'Landing · YouTube · Email',
    credits: 2,
    price: 0,
    blurb: 'স্নায়বিক মনোযোগ মডেল দিয়ে ১২টি হেডলাইন + স্কোর।',
    deliverable: 'হেডলাইন সেট + নিউরো স্কোর',
  },
  {
    id: 'trigger-map',
    name: 'Emotional Trigger Map',
    bn: 'ইমোশনাল ট্রিগার ম্যাপ',
    kind: 'tool',
    channel: 'Brand · Offer',
    credits: 3,
    price: 0,
    blurb: 'অডিয়েন্সের ভয়, আকাঙ্ক্ষা, স্ট্যাটাস ও আইডেন্টিটি ম্যাপ।',
    deliverable: 'ট্রিগার ম্যাট্রিক্স (PDF-ready টেক্সট)',
  },
  {
    id: 'funnel-os',
    name: 'Funnel Script OS',
    bn: 'ফানেল স্ক্রিপ্ট',
    kind: 'tool',
    channel: 'VSL · Email · WhatsApp',
    credits: 5,
    price: 0,
    blurb: 'ল্যান্ডিং, ভিএসএল আউটলাইন ও ৫-মেইল নার্চার সিকোয়েন্স।',
    deliverable: 'সম্পূর্ণ ফানেল কপি প্যাক',
  },
  {
    id: 'ab-predict',
    name: 'A/B Predictor',
    bn: 'এ/বি প্রেডিক্টর',
    kind: 'tool',
    channel: 'CRO',
    credits: 4,
    price: 0,
    blurb: 'দুই ভ্যারিয়েন্টের নিউরো-স্কোর ও জয়ী প্রেডিকশন।',
    deliverable: 'স্কোরকার্ড + সুপারিশ',
  },
  {
    id: 'brand-voice',
    name: 'Brand Voice Engine',
    bn: 'ব্র্যান্ড ভয়েস',
    kind: 'tool',
    channel: 'All channels',
    credits: 4,
    price: 0,
    blurb: 'টোন, নিষিদ্ধ শব্দ, রিচুয়াল ফ্রেজ — এজেন্সি-গ্রেড ভয়েস গাইড।',
    deliverable: 'ভয়েস গাইড (ডিজিটাল)',
  },
  {
    id: 'offer-kit',
    name: 'Offer Architecture',
    bn: 'অফার আর্কিটেকচার',
    kind: 'tool',
    channel: 'Pricing · Checkout',
    credits: 4,
    price: 0,
    blurb: 'ভ্যালু স্ট্যাক, গ্যারান্টি, বোনাস ও প্রাইস অ্যাঙ্কর।',
    deliverable: 'অফার ব্লুপ্রিন্ট',
  },
  {
    id: 'image-prompt',
    name: 'Creative Prompt Forge',
    bn: 'ক্রিয়েটিভ প্রম্পট',
    kind: 'tool',
    channel: 'Midjourney · Flux · Ads',
    credits: 2,
    price: 0,
    blurb: 'ক্যাম্পেইন-রেডি ইমেজ প্রম্পট — লাইটিং, লেন্স, ইমোশন।',
    deliverable: '৬টি প্রোডাকশন প্রম্পট',
  },
  {
    id: 'pack-vault',
    name: 'Neuro Ad Vault',
    bn: 'নিউরো অ্যাড ভল্ট',
    kind: 'pack',
    channel: 'Lifetime digital',
    credits: 0,
    price: 1490,
    bonusCredits: 400,
    blurb: '৩০টি হাই-টিক অ্যাড ফ্রেমওয়ার্ক + ৪০০ বোনাস ক্রেডিট।',
    deliverable: 'ইনস্ট্যান্ট ডিজিটাল আনলক',
  },
  {
    id: 'pack-funnel',
    name: 'Funnel Codex',
    bn: 'ফানেল কোডেক্স',
    kind: 'pack',
    channel: 'Lifetime digital',
    credits: 0,
    price: 2490,
    bonusCredits: 800,
    blurb: 'ভিএসএল + ওয়েবিনার + চেকআউট স্ক্রিপ্ট টেমপ্লেট লাইব্রেরি।',
    deliverable: 'ইনস্ট্যান্ট ডিজিটাল আনলক',
  },
  {
    id: 'pack-agency',
    name: 'Agency Synapse Kit',
    bn: 'এজেন্সি সাইন্যান্স কিট',
    kind: 'pack',
    channel: 'Lifetime digital',
    credits: 0,
    price: 7990,
    bonusCredits: 2500,
    blurb: 'ক্লায়েন্ট অনবোর্ড, অফার স্ট্যাক, রিটেইনার প্রপোজাল — সব ডিজিটাল।',
    deliverable: 'ইনস্ট্যান্ট ডিজিটাল আনলক',
  },
]

export function productById(id) {
  return PRODUCTS.find((p) => p.id === id) || null
}

export const TOOL_SYSTEM = {
  'neuro-ads': `You are ImageForge Neuro Copy chief. Write bilingual (Bangla + English) ad variants for paid social/search.
Return:
1) 3 hooks (max 12 words)
2) 3 primary texts (80-120 words)
3) 3 CTAs
4) Emotional triggers used
5) Compliance notes
Never invent fake case studies or fake reviews.`,
  'headline-lab': `You are a neuro-headline scientist. Produce 12 headlines scored 1-100 on curiosity, clarity, specificity, emotion.
Mark a winner. Bangla + English mix allowed. No clickbait that lies.`,
  'trigger-map': `Map audience psychology: fear, desire, status, identity, loss aversion, social proof.
Give a 2x4 matrix and 5 message angles. Be concrete to the brief. No generic fluff.`,
  'funnel-os': `Write a digital funnel pack: hero section, objection stack, VSL outline (8 beats), 5-email nurture, WhatsApp bump.
Mark every asset as DIGITAL delivery. No physical shipping language.`,
  'ab-predict': `Compare variant A vs B. Score attention, emotion, clarity, uniqueness, CTA. Predict winner + why + how to test.
If inputs are weak, say so — never fake statistical confidence.`,
  'brand-voice': `Build a usable brand voice guide: tone sliders, do/don't lexicon, sample posts, banned phrases, ritual openers.`,
  'offer-kit': `Architect a digital offer: core promise, value stack, price anchors, guarantee, bonuses, urgency that is honest.`,
  'image-prompt': `Forge 6 production-ready image prompts (cinematic, commercial, UGC, abstract neuro, product-in-use, thumbnail).
Include lighting, lens, mood, negative prompt. These are digital creative prompts, not physical prints.`,
  brief: `You are ImageForge campaign strategist. Give a tight brief: audience, job-to-be-done, promise, proof, offer, channels, 7-day sprint.`,
}
