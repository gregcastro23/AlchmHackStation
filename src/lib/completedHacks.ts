export interface CompletedHackathon {
  id: string;
  eventName: string;
  projectName: string;
  projectPath: string;
  objective: string;
  track: string;
  dates: string;
  stack: {
    language: string;
    framework: string;
    cssEngine: string;
    database: string;
  };
  accomplishments: string[];
  completedTasks: Array<{ id: string; label: string; group: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  features?: Array<{ label: string; prompt: string }>;
  archivedAt: string;
}

// Pre-seeded ETHGlobal New York 2026 data
export const DEFAULT_COMPLETED_HACKS: CompletedHackathon[] = [
  {
    id: 'ethglobal-ny-2026',
    eventName: 'ETHGlobal New York 2026',
    projectName: 'Pentacles MMO',
    projectPath: '/Users/cookingwithcastro/Desktop/AlchmHackStation',
    objective: 'Location-based AR MMO on SpaceTimeDB. Birth chart faction, Tarot arsenal, and 5,041 capturable stars.',
    track: 'From Scratch',
    dates: 'June 12-14, 2026',
    stack: {
      language: 'Rust & TypeScript',
      framework: 'Vite React & Unity C#',
      cssEngine: 'Tailwind v4',
      database: 'SpaceTimeDB',
    },
    archivedAt: '2026-06-14T23:59:59Z',
    accomplishments: [
      'Implemented Rust authoritative transaction loop & state module in SpaceTimeDB.',
      'Developed 2D HTML5 Canvas web client interface with reactive subscriptions.',
      'Created gyroscope-aligned AR Unity client wrapper for celestial coordinate rendering.',
      'Optimized query performance by writing targeted Btree table indexes on card.owner.',
      'Constructed EIP-3009 local transfer gate to handle A2A pay-per-SSE streams.',
      'Integrated NameStone gasless resolver records to bind World ID verification states.',
      'Deployed Walrus decentralized encrypted agent memory blob backups.'
    ],
    completedTasks: [
      { id: 'btree_index', label: 'Add btree indexes on card.owner, deck_slot.owner, and trade.proposer/partner', group: 'Database Optimization' },
      { id: 'prune_tables', label: 'Implement scheduled prune janitor on battle and oracle_request tables', group: 'Database Optimization' },
      { id: 'prompt_cache', label: 'Verify prompt cache size is >4096 tokens (Haiku 4.5 minimum cache block)', group: 'AI & Oracle Hardening' },
      { id: 'rebill_fix', label: 'Fix Oracle re-billing infinite loop on failed request API errors', group: 'AI & Oracle Hardening' },
      { id: 'groq_integration', label: 'Configure Groq API (Llama-70B) for free-chain planetary agent responses', group: 'AI & Oracle Hardening' },
      { id: 'owner_token', label: 'Mint deployable owner SPACETIME_TOKEN for feeder and oracle cron services', group: 'Services Deployment' },
      { id: 'sdk_wiring', label: 'Wire web client client.js to wss maincloud using TypeScript SDK', group: 'Web Client Integration' },
      { id: 'word_duel_brain', label: 'Wire planetary-agents Word Duel brain to the agent_letters seam', group: 'Web Client Integration' },
    ],
    faqs: [
      {
        question: 'What is the SpacetimeDB Maincloud deployment details?',
        answer: 'The published module is named "cookingwithcastrollc". The owner identity is "c2007058fefb90b9ffcd33379c03d135cbecadda7b901575d9b8ed8ca06ddb52". The live host endpoint is wss://maincloud.spacetimedb.com.',
      },
      {
        question: 'Why is adding btree indexes critical?',
        answer: 'Currently, every player check (fetching active cards, loadout, trade processing) is an O(N) table scan over all cards in the game. This causes quadratic complexity (N players scanning N*C rows on a 1-minute schedule). Adding indexes scales it to O(C).',
      },
      {
        question: 'How does the Oracle chat service communicate safely?',
        answer: 'The client writes a question to the private oracle_request table. The trusted oracle-service reads it, calls Claude (caching system prompt), and writes the answer to oracle_reply. No API keys are stored in the client.',
      },
    ],
    features: [
      { label: 'Eleven-Zone Partition', prompt: 'Canvas coordinates dividing sky into 5 houses, 5 spires, and 1 crown.' },
      { label: 'Environmental Weather', prompt: 'Element weather factors: x1.35 matched suit, x0.75 opposite.' },
      { label: 'Zodiac Seals', prompt: 'Seals grant x1.15 element mastery buff in duels and sieges.' },
    ]
  }
];
