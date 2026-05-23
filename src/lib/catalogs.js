export const FREE_GIFTS_BY_SKILL = {
  cooking: [
    "A 3-course meal night with their favorite cuisine",
    "A custom recipe book with family recipes, handwritten",
    "Teach them one dish you make better than anyone",
    "A week of homemade lunches delivered to their door",
    "A baking afternoon together — they pick the recipe",
    "A personalized spice blend in a labeled jar",
  ],
  writing: [
    "A heartfelt letter for every month they've been your friend",
    "A poem written specifically about a memory you share",
    "Write the introduction to their life story",
    "A list of 52 things you admire about them (one per week)",
    "A handwritten letter to their future self, from you",
  ],
  photography: [
    "A printed photo album of your year together",
    "A photo shoot of something they love",
    "Edit and print their favorite family photo beautifully",
    "Create a photo book of their pet, child, or home",
    "A framed collage of your best memories together",
  ],
  music: [
    "A custom playlist with handwritten notes on why each song",
    "Play or sing a song live for them on their day",
    "Teach them one chord on your instrument",
    "Create a 'soundtrack to your friendship' playlist",
    "Record a voice message singing happy birthday — sincerely",
  ],
  art: [
    "A hand-drawn portrait or favorite memory in watercolor",
    "Paint their home, pet, or favorite place",
    "Design a custom illustration for their phone wallpaper",
    "A hand-lettered quote they love, framed",
    "Create a mini comic strip about a shared memory",
  ],
  gardening: [
    "A potted herb starter with a handwritten care guide",
    "Help them set up a small window herb garden",
    "Propagate a cutting from a plant you love",
    "A hand-drawn seasonal planting calendar for their zone",
    "A homemade dried flower arrangement",
  ],
  knitting: [
    "A hand-knit dishcloth or cozy with their favorite color",
    "Teach them the basics — a private knitting lesson",
    "A small hand-knit bookmark or keychain ornament",
  ],
  coding: [
    "Build them a tiny personal tool — a habit tracker or budget sheet",
    "Set up and teach them one app that would genuinely help their life",
    "Create a simple website for their hobby or small business",
  ],
  fitness: [
    "Design a personalized 4-week workout plan for their goals",
    "A full morning wellness routine session together",
    "Teach them one form-correcting technique for a lift they love",
  ],
  yoga: [
    "A private 1-hour yoga session tailored to their needs",
    "A handmade flow card with sequences for mornings and evenings",
  ],
  sewing: [
    "Mend or alter a garment they love but can't wear",
    "A hand-sewn tote bag in a fabric they'd choose",
    "Embroider their name or a small motif on a pillowcase",
  ],
  language: [
    "Teach them 20 phrases in a language they've always wanted to learn",
    "An afternoon of immersive language practice — films, food, music",
  ],
  carpentry: [
    "Build a small shelf, bookend set, or picture frame",
    "Fix something in their home that's been bothering them",
    "A hand-carved wooden spoon or utensil",
  ],
};

export const UNIVERSAL_FREE = [
  "A handwritten letter listing 10 specific things you love about them",
  "Plan and execute their perfect day, no decisions on their part",
  "A 'coupon book' of 5 real favors they can actually redeem",
  "Clean or organize one room or space that stresses them out",
  "Take over a chore they dread for one full month",
  "Create a memory jar — fill it with 30 handwritten notes",
  "A sunset or sunrise walk with no phones",
  "A fully offline afternoon together — board games, cooking, talking",
  "Write down their life story as you know it, and read it to them",
  "Send one voice note every day for a week telling them something specific",
  "Plan a nostalgic rewatch of their all-time favorite film with homemade snacks",
  "Compile a playlist of every song that reminds you of them, with liner notes",
  "Make a scrapbook of screenshots, texts, and photos from your year together",
  "Write a letter to their parents thanking them for raising them",
  "Take 5 things off their to-do list without being asked",
];

export const THOUGHTFULNESS_BOOSTERS = {
  words_of_affirmation: [
    "Tuck a note inside the wrapping naming 3 specific moments that made you think of them",
    "Record a 60-second voice message to play when they open it",
    "Write the 'why this gift' story on the card — be specific",
  ],
  quality_time: [
    "Schedule a no-phones afternoon to enjoy it together",
    "Include a 'date card' — a specific time you'll spend together using the gift",
    "Add a hand-drawn invite for an experience that pairs with the gift",
  ],
  gifts: [
    "Wrap it with something reusable — a cloth, a basket, a box they'll keep",
    "Add a small complement item that shows you really listened",
    "Include a warranty/care card in your own handwriting",
  ],
  acts_of_service: [
    "Add a 'one free service' coupon — something genuinely useful",
    "Offer to set it up, install it, or teach them how to use it",
    "Pair the gift with a chore you'll take off their plate",
  ],
  physical_touch: [
    "Include a handwritten note with a plan for time together",
    "Pair any gift with a promised hug ritual — morning tea together, etc.",
    "Make the unwrapping an experience — sit with them, not over text",
  ],
};

export const UNIVERSAL_BOOSTERS = [
  "Wrap it with kraft paper and a sprig of greenery from outside",
  "Write the date and a one-line memory on the inside of the card",
  "Include the receipt — it says 'I trust you to make it yours'",
  "Take a photo of yourself wrapping it. Send it to them weeks later.",
  "Deliver it in person if at all possible",
];

export const SKILL_ALIASES = {
  baker: "cooking",
  chef: "cooking",
  writer: "writing",
  poet: "writing",
  photographer: "photography",
  musician: "music",
  singer: "music",
  guitarist: "music",
  pianist: "music",
  artist: "art",
  painter: "art",
  illustrator: "art",
  gardener: "gardening",
  knitter: "knitting",
  developer: "coding",
  programmer: "coding",
  engineer: "coding",
  trainer: "fitness",
  yogi: "yoga",
  seamstress: "sewing",
  tailor: "sewing",
  carpenter: "carpentry",
  woodworker: "carpentry",
};

export const LOVE_LANGUAGES = [
  { value: "words_of_affirmation", label: "Words of Affirmation" },
  { value: "quality_time", label: "Quality Time" },
  { value: "gifts", label: "Gifts" },
  { value: "acts_of_service", label: "Acts of Service" },
  { value: "physical_touch", label: "Physical Touch" },
];

export function getCuratedIdeas(skills = [], loveLanguage = null) {
  const ideas = [];
  const seen = new Set();

  // Add skill-based ideas
  for (const skill of skills) {
    const normalized = SKILL_ALIASES[skill.toLowerCase()] || skill.toLowerCase();
    const skillIdeas = FREE_GIFTS_BY_SKILL[normalized] || [];
    for (const idea of skillIdeas) {
      if (!seen.has(idea)) {
        seen.add(idea);
        ideas.push({ name: idea, estimated_price: '$0', why_it_works: 'Uses your unique skill', is_free: true });
      }
    }
  }

  // Fill with universal free
  for (const idea of UNIVERSAL_FREE) {
    if (ideas.length >= 12) break;
    if (!seen.has(idea)) {
      seen.add(idea);
      ideas.push({ name: idea, estimated_price: '$0', why_it_works: 'A gift of time and intention', is_free: true });
    }
  }

  // Add love language boosters
  const boosters = loveLanguage ? THOUGHTFULNESS_BOOSTERS[loveLanguage] || [] : UNIVERSAL_BOOSTERS;
  return { ideas: ideas.slice(0, 8), boosters };
}