import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Code2,
  ExternalLink,
  FileCode2,
  Gauge,
  GitBranch,
  Hammer,
  HelpCircle,
  Landmark,
  Lightbulb,
  Play,
  Rocket,
  Scale,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
  Video,
  WandSparkles,
} from 'lucide-react';

export type HackathonTrack = 'from-scratch' | 'extend-open-source' | 'ship-a-feature';

interface HackathonSpaceProps {
  missionReadiness: number;
  foundryState: 'IDLE' | 'BUILDING' | 'SUCCESS' | 'ERROR';
  gitHubConnected: boolean;
  onNavigate: (tab: string) => void;
  onCommitLog: (text: string, type?: 'default' | 'info' | 'success' | 'warning' | 'error') => void;
  onStartBuild: (idea: string, track: HackathonTrack) => void;
}

interface ProjectDraft {
  name: string;
  pitch: string;
}

const eventLinks = [
  {
    label: 'Hacker Dashboard',
    description: 'Team, project, schedule, and submission home.',
    href: 'https://ethglobal.com/events/newyork2026/home',
    icon: Gauge,
  },
  {
    label: 'Info Center',
    description: 'Official event onboarding and logistics.',
    href: 'https://ethglobal.com/events/newyork2026/info',
    icon: BookOpen,
  },
  {
    label: 'Rules & Judging',
    description: 'Eligibility, submission, demo, and judging rules.',
    href: 'https://ethglobal.com/events/newyork2026/info/details',
    icon: Scale,
  },
  {
    label: 'Builder Resources',
    description: 'Ethereum, Solidity, L2, education, and prize resources.',
    href: 'https://ethglobal.com/events/newyork2026/info/resources',
    icon: FileCode2,
  },
  {
    label: 'NYC Guide',
    description: 'Venue guidance and local side-event updates.',
    href: 'https://ethglobal.com/events/newyork2026/city',
    icon: Landmark,
  },
  {
    label: 'Event FAQ',
    description: 'Applications, teams, staking, travel, and participation.',
    href: 'https://ethglobal.com/events/newyork2026#faq',
    icon: HelpCircle,
  },
];

const tracks: Array<{
  id: HackathonTrack;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  rule: string;
}> = [
  {
    id: 'from-scratch',
    number: '01',
    title: 'From Scratch',
    shortTitle: 'Classic track',
    description: 'Arrive with an empty project and create the full submission during the event.',
    rule: 'No pre-event project-specific code, designs, or assets. Public libraries and starter kits are allowed with transparency.',
  },
  {
    id: 'extend-open-source',
    number: '02',
    title: 'Extend Open Source',
    shortTitle: 'Continuity track',
    description: 'Bring an open-source repository you maintain and ship a meaningful backlog feature.',
    rule: 'Document the pre-existing baseline and clearly identify the functionality created during the hackathon.',
  },
  {
    id: 'ship-a-feature',
    number: '03',
    title: 'Ship a Feature',
    shortTitle: 'Continuity track',
    description: 'Add one new feature to an existing private product and release the weekend work as open source.',
    rule: 'The submitted feature must be new, built during the event, and published openly with the prior work distinguished.',
  },
];

const checklist = [
  { id: 'track', label: 'Track selected and eligibility understood', group: 'Before build' },
  { id: 'team', label: 'Team created or joined (maximum 5 accepted hackers)', group: 'Before build' },
  { id: 'repo', label: 'Git history shows progress throughout the event', group: 'Build proof' },
  { id: 'reuse', label: 'Repo, Figma, or equivalent proof separates reused and new work', group: 'Build proof' },
  { id: 'ai', label: 'AI-assisted files, assets, prompts, specs, and plans are attributed', group: 'Build proof' },
  { id: 'working', label: 'Core user flow works in a live demo', group: 'Submission' },
  { id: 'submission', label: 'Title, description, and repository link are ready', group: 'Submission' },
  { id: 'mode', label: 'Finalist + Partner or Partner Prizes Only mode is selected', group: 'Submission' },
  { id: 'prizes', label: 'Up to 3 partners include integration notes and feedback', group: 'Submission' },
  { id: 'video', label: 'Optional 2-4 minute demo video is 720p or higher', group: 'Submission' },
  { id: 'deadline', label: 'Submit before Sunday, June 14 at 9:00 AM EDT', group: 'Submission' },
  { id: 'pitch', label: '4-minute demo and 3-minute Q&A are rehearsed', group: 'Judging' },
  { id: 'questions', label: 'Inspiration, tools, and technical challenges are explainable', group: 'Judging' },
];

const judgingCriteria = [
  { label: 'Technicality', prompt: 'Is the problem hard and the implementation sophisticated?', icon: Code2 },
  { label: 'Originality', prompt: 'Does the project introduce a fresh idea or approach?', icon: Lightbulb },
  { label: 'Practicality', prompt: 'Is the product complete enough to be useful today?', icon: CheckCircle2 },
  { label: 'Usability', prompt: 'Is the UI, UX, or developer experience intuitive?', icon: Users },
  { label: 'WOW Factor', prompt: 'Will judges remember the experience after the demo?', icon: Sparkles },
];

const eventFaqs = [
  {
    question: 'Who can participate?',
    answer: 'Developers and builders who want to create or contribute during the hackathon. Beginners, veteran web3 builders, and solo hackers are welcome.',
  },
  {
    question: 'Is the event free?',
    answer: 'Attendance and food are free. Accepted hackers stake a small amount of crypto to confirm their place; it is returned after participating and submitting a project, including a partial project.',
  },
  {
    question: 'Can I participate remotely?',
    answer: 'No. ETHGlobal New York 2026 is strictly in person, and hackers must attend the event to participate.',
  },
  {
    question: 'How do teams work?',
    answer: 'Teams can have up to five members. Every member must apply, be accepted, and stake individually. You may hack solo, but joining two projects can lead to disqualification.',
  },
  {
    question: 'Are travel and lodging covered?',
    answer: 'No. ETHGlobal does not cover travel, visa, or accommodation costs. Food is provided, and limited rest areas may be available without shower facilities.',
  },
  {
    question: 'Where do I get help?',
    answer: 'Use mentors in the Hacker Dashboard, the mentorship and partner Discord channels, or speak with mentors and partner teams at the venue.',
  },
];

const resourceLanes = [
  {
    title: 'Start fast',
    description: 'Bootstrap the app and validate contracts immediately.',
    icon: Rocket,
    tone: 'text-[#9ddf2e]',
    links: [
      { label: 'Ethereum Developer Hub', href: 'https://ethereum.org/developers/' },
      { label: 'Scaffold-ETH 2', href: 'https://scaffoldeth.io/' },
      { label: 'Remix IDE', href: 'https://remix.ethereum.org/' },
    ],
  },
  {
    title: 'Learn & reference',
    description: 'Reach for focused Solidity examples while the clock is running.',
    icon: BookOpen,
    tone: 'text-[#7dd3fc]',
    links: [
      { label: 'Solidity Documentation', href: 'https://docs.soliditylang.org/' },
      { label: 'Solidity by Example', href: 'https://solidity-by-example.org/' },
      { label: 'SpeedRun Ethereum', href: 'https://speedrunethereum.com/' },
    ],
  },
  {
    title: 'Research the chain',
    description: 'Choose standards and networks with current technical context.',
    icon: FileCode2,
    tone: 'text-[#ffb020]',
    links: [
      { label: 'L2BEAT Scaling', href: 'https://l2beat.com/scaling/tvs' },
      { label: 'Ethereum EIPs', href: 'https://eips.ethereum.org/all' },
      { label: 'Etherscan Gas Tracker', href: 'https://etherscan.io/gastracker' },
    ],
  },
  {
    title: 'Keep shipping',
    description: 'Find ecosystem support once the hackathon build has momentum.',
    icon: Sparkles,
    tone: 'text-[#e3e3d8]',
    links: [
      { label: 'EF Ecosystem Support', href: 'https://esp.ethereum.foundation/' },
      { label: 'Base Builder Funding', href: 'https://docs.base.org/get-started/get-funded' },
      { label: 'ETHGlobal Showcase', href: 'https://ethglobal.com/showcase' },
    ],
  },
];

const buildTools = [
  { label: 'Forge the idea', detail: 'Turn the pitch into an agent task graph.', tab: 'swarm-nexus', icon: WandSparkles, tone: 'acid' },
  { label: 'Run the mission', detail: 'Track build proof and demo readiness.', tab: 'mission-control', icon: Gauge, tone: 'cyan' },
  { label: 'Build contracts', detail: 'Compile, test, and operate the local chain.', tab: 'console', icon: Hammer, tone: 'amber' },
  { label: 'Audit security', detail: 'Review smart-contract safety gates.', tab: 'security', icon: ShieldCheck, tone: 'white' },
  { label: 'Ship the project', detail: 'Prepare integrations, auth, and handoffs.', tab: 'integration-ops', icon: Rocket, tone: 'acid' },
];

const toneStyles: Record<string, string> = {
  acid: 'border-[#9ddf2e]/40 text-[#9ddf2e] bg-[#9ddf2e]/5 hover:bg-[#9ddf2e]/10',
  cyan: 'border-[#7dd3fc]/40 text-[#7dd3fc] bg-[#7dd3fc]/5 hover:bg-[#7dd3fc]/10',
  amber: 'border-[#ffb020]/40 text-[#ffb020] bg-[#ffb020]/5 hover:bg-[#ffb020]/10',
  white: 'border-[#e3e3d8]/30 text-[#e3e3d8] bg-[#e3e3d8]/5 hover:bg-[#e3e3d8]/10',
};

const storageKeys = {
  entered: 'alchm-ethglobal-entered',
  track: 'alchm-ethglobal-track',
  draft: 'alchm-ethglobal-draft',
  checklist: 'alchm-ethglobal-checklist',
};

const readStoredValue = <T,>(key: string, fallback: T): T => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const getEventPhase = () => {
  const now = new Date();
  const start = new Date('2026-06-12T00:00:00-04:00');
  const end = new Date('2026-06-15T00:00:00-04:00');

  if (now < start) {
    const hours = Math.max(1, Math.ceil((start.getTime() - now.getTime()) / 3_600_000));
    return { label: 'Starts soon', detail: `${hours}h to opening day`, tone: 'text-[#ffb020]' };
  }

  if (now < end) {
    return { label: 'Hackathon live', detail: 'Build window active', tone: 'text-[#9ddf2e]' };
  }

  return { label: 'Event complete', detail: 'Keep shipping the project', tone: 'text-[#7dd3fc]' };
};

const getSubmissionWindow = () => {
  const deadline = new Date('2026-06-14T09:00:00-04:00');
  const remainingMs = deadline.getTime() - Date.now();

  if (remainingMs <= 0) {
    return { label: 'Submission closed', detail: 'Deadline passed', tone: 'text-[#ffb4ab]' };
  }

  const totalHours = Math.ceil(remainingMs / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const detail = days > 0 ? `${days}d ${hours}h remaining` : `${hours}h remaining`;
  return { label: 'Submission countdown', detail, tone: 'text-[#ffb020]' };
};

export const HackathonSpace: React.FC<HackathonSpaceProps> = ({
  missionReadiness,
  foundryState,
  gitHubConnected,
  onNavigate,
  onCommitLog,
  onStartBuild,
}) => {
  const [entered, setEntered] = useState(() => readStoredValue(storageKeys.entered, false));
  const [track, setTrack] = useState<HackathonTrack>(() => readStoredValue(storageKeys.track, 'from-scratch'));
  const [draft, setDraft] = useState<ProjectDraft>(() =>
    readStoredValue(storageKeys.draft, { name: '', pitch: '' }),
  );
  const [completed, setCompleted] = useState<string[]>(() => readStoredValue(storageKeys.checklist, []));
  const eventPhase = getEventPhase();
  const submissionWindow = getSubmissionWindow();
  const activeTrack = tracks.find((item) => item.id === track) ?? tracks[0];
  const completion = Math.round((completed.length / checklist.length) * 100);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.track, JSON.stringify(track));
  }, [track]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.draft, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.checklist, JSON.stringify(completed));
  }, [completed]);

  const enterHackathon = () => {
    setEntered(true);
    window.localStorage.setItem(storageKeys.entered, JSON.stringify(true));
    onCommitLog(`ETHGlobal New York space entered on ${activeTrack.title} track.`, 'success');
  };

  const returnToTrackSelection = () => {
    setEntered(false);
    window.localStorage.setItem(storageKeys.entered, JSON.stringify(false));
  };

  const toggleChecklist = (id: string) => {
    setCompleted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const startProject = () => {
    const idea = draft.pitch.trim() || draft.name.trim();
    if (!idea) {
      onCommitLog('Add a project name or one-line pitch before forging the build plan.', 'warning');
      return;
    }

    onStartBuild(idea, track);
  };

  const copyStarterCommand = async () => {
    try {
      await navigator.clipboard.writeText('npx create-eth@latest');
      onCommitLog('Scaffold-ETH starter command copied: npx create-eth@latest', 'success');
    } catch {
      onCommitLog('Starter command: npx create-eth@latest', 'info');
    }
  };

  if (!entered) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <section className="relative min-h-full overflow-hidden border border-[#44483a] bg-[#0d0f09]">
          <div className="absolute inset-0 eth-orbit-grid opacity-70" />
          <div className="absolute -right-28 top-10 h-80 w-80 rounded-full border border-[#9ddf2e]/20" />
          <div className="absolute -right-12 top-28 h-48 w-48 rounded-full border border-[#7dd3fc]/20" />
          <div className="relative z-10 mx-auto flex min-h-full max-w-7xl flex-col justify-center px-5 py-10 md:px-10 lg:py-16">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#44483a] pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border border-[#9ddf2e] bg-[#9ddf2e]/10 font-mono text-xl font-bold text-[#9ddf2e]">
                  Ξ
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8f9282]">AlchmHackStation presents</div>
                  <div className="mt-1 text-lg font-bold text-[#e3e3d8]">ETHGlobal New York 2026</div>
                </div>
              </div>
              <div className="flex items-center gap-2 border border-[#44483a] bg-[#12140e] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em]">
                <span className="h-2 w-2 rounded-full bg-[#ffb020] animate-pulse" />
                <span className={eventPhase.tone}>{eventPhase.detail}</span>
              </div>
            </div>

            <div className="grid items-end gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="inline-flex items-center gap-2 border border-[#7dd3fc]/40 bg-[#7dd3fc]/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-[#7dd3fc]">
                  <CalendarDays className="h-3.5 w-3.5" />
                  June 12-14 // New York City
                </div>
                <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-[0.95] tracking-[-0.05em] text-[#e3e3d8] md:text-7xl">
                  Enter with an idea.
                  <span className="block text-[#9ddf2e]">Leave with proof.</span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-[#c5c8b6] md:text-lg">
                  One workspace for the full ETHGlobal weekend: choose your build path, forge the project, track eligibility, test contracts, package the demo, and walk into judging ready.
                </p>
              </div>

              <div className="border border-[#44483a] bg-[#12140e]/90 p-5">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f9282]">
                  <span>Event protocol</span>
                  <span className="text-[#9ddf2e]">3 paths // 1 weekend</span>
                </div>
                <div className="mt-4 space-y-3">
                  {['Show what changed', 'Commit throughout the event', 'Attribute AI-assisted work', 'Finalist mix: up to 7 classic + 3 continuity'].map((item) => (
                    <div key={item} className="flex items-center gap-3 border border-[#44483a] bg-[#0d0f09] px-3 py-2.5 text-sm text-[#e3e3d8]">
                      <Check className="h-4 w-4 text-[#9ddf2e]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {tracks.map((item) => {
                const selected = track === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTrack(item.id)}
                    className={`group p-5 text-left transition ${selected ? 'border border-[#9ddf2e] bg-[#9ddf2e]/8' : 'border border-[#44483a] bg-[#12140e] hover:border-[#8f9282]'}`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`font-mono text-3xl font-bold ${selected ? 'text-[#9ddf2e]' : 'text-[#44483a]'}`}>{item.number}</span>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-[#9ddf2e] bg-[#9ddf2e] text-[#0d0f09]' : 'border-[#8f9282]'}`}>
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </span>
                    </div>
                    <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#8f9282]">{item.shortTitle}</div>
                    <h2 className="mt-1 text-xl font-bold text-[#e3e3d8]">{item.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-[#c5c8b6]">{item.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col items-stretch justify-between gap-4 border-t border-[#44483a] pt-6 lg:flex-row lg:items-center">
              <p className="max-w-2xl text-xs leading-5 text-[#8f9282]">
                Selected: <span className="font-semibold text-[#e3e3d8]">{activeTrack.title}</span>. {activeTrack.rule}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href="https://ethglobal.com/events/newyork2026/home"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 border border-[#7dd3fc]/50 bg-[#7dd3fc]/5 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#7dd3fc] transition hover:bg-[#7dd3fc]/10"
                >
                  Open hacker dashboard
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={enterHackathon}
                  className="inline-flex shrink-0 items-center justify-center gap-3 border border-[#9ddf2e] bg-[#9ddf2e] px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d0f09] transition hover:bg-[#83c300]"
                >
                  Enter hackathon space
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      <div className="mx-auto max-w-[1600px] space-y-4 pb-2">
        <section className="relative overflow-hidden border border-[#44483a] bg-[#12140e] p-5 md:p-7">
          <div className="absolute inset-0 eth-orbit-grid opacity-40" />
          <div className="relative z-10 grid gap-7 xl:grid-cols-[1fr_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 border border-[#9ddf2e]/40 bg-[#9ddf2e]/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9ddf2e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9ddf2e] animate-pulse" />
                  {eventPhase.label}
                </span>
                <span className="border border-[#44483a] bg-[#0d0f09] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#c5c8b6]">
                  Jun 12-14 // NYC
                </span>
                <span className="border border-[#7dd3fc]/30 bg-[#7dd3fc]/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#7dd3fc]">
                  {activeTrack.title}
                </span>
                <span className="inline-flex items-center gap-1.5 border border-[#ffb020]/40 bg-[#ffb020]/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#ffb020]">
                  <Timer className="h-3 w-3" />
                  Due Sun Jun 14 // 09:00 EDT
                </span>
                <a
                  href="https://ethglobal.com/events/newyork2026/home"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 border border-[#e3e3d8]/30 bg-[#e3e3d8]/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#e3e3d8] transition hover:border-[#7dd3fc]/60 hover:text-[#7dd3fc]"
                >
                  Hacker dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <h1 className="mt-5 text-3xl font-bold tracking-[-0.035em] text-[#e3e3d8] md:text-5xl">
                Your ETHGlobal build room
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c5c8b6] md:text-base">
                Keep the idea, implementation, evidence, and judge story moving together. Everything below is organized around what ETHGlobal asks you to prove by submission time.
              </p>

              <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {buildTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.tab}
                      onClick={() => onNavigate(tool.tab)}
                      className={`border p-3 text-left transition ${toneStyles[tool.tone]}`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="h-4 w-4" />
                        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                      </div>
                      <div className="mt-4 text-xs font-bold text-[#e3e3d8]">{tool.label}</div>
                      <div className="mt-1 text-[11px] leading-4 text-[#8f9282]">{tool.detail}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border border-[#44483a] bg-[#0d0f09]/90 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8f9282]">Submission readiness</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-[#9ddf2e]">{Math.round((missionReadiness + completion) / 2)}</span>
                    <span className="font-mono text-xs text-[#8f9282]">/ 100</span>
                  </div>
                </div>
                <Gauge className="h-9 w-9 text-[#9ddf2e]" />
              </div>
              <div className="mt-5 h-2 border border-[#44483a] bg-[#12140e]">
                <div className="h-full bg-[#9ddf2e] transition-all" style={{ width: `${Math.round((missionReadiness + completion) / 2)}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between border border-[#ffb020]/30 bg-[#ffb020]/5 px-3 py-2 font-mono text-[10px] uppercase">
                <span className="text-[#8f9282]">{submissionWindow.label}</span>
                <span className={submissionWindow.tone}>{submissionWindow.detail}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 font-mono text-[10px] uppercase">
                <div className="border border-[#44483a] bg-[#12140e] p-3">
                  <span className="block text-[#8f9282]">Build</span>
                  <span className="mt-1 block text-[#e3e3d8]">{foundryState}</span>
                </div>
                <div className="border border-[#44483a] bg-[#12140e] p-3">
                  <span className="block text-[#8f9282]">GitHub</span>
                  <span className={`mt-1 block ${gitHubConnected ? 'text-[#9ddf2e]' : 'text-[#ffb020]'}`}>
                    {gitHubConnected ? 'Connected' : 'Not linked'}
                  </span>
                </div>
                <div className="border border-[#44483a] bg-[#12140e] p-3">
                  <span className="block text-[#8f9282]">Rules</span>
                  <span className="mt-1 block text-[#7dd3fc]">{completion}%</span>
                </div>
                <div className="border border-[#44483a] bg-[#12140e] p-3">
                  <span className="block text-[#8f9282]">Deadline</span>
                  <span className="mt-1 block text-[#ffb020]">Sun 09:00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-12">
          <section className="xl:col-span-7 border border-[#44483a] bg-[#12140e] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#44483a] pb-4">
              <div className="flex items-center gap-2">
                <WandSparkles className="h-4 w-4 text-[#9ddf2e]" />
                <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Project launchpad</h2>
              </div>
              <button
                onClick={returnToTrackSelection}
                className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8f9282] hover:text-[#9ddf2e]"
              >
                Change track
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8f9282]">Project name</span>
                <input
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  placeholder="e.g. ProofPort"
                  className="mt-2 w-full border border-[#44483a] bg-[#0d0f09] px-3 py-3 text-sm text-[#e3e3d8] outline-none transition placeholder:text-[#44483a] focus:border-[#9ddf2e]"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8f9282]">One-line pitch</span>
                <input
                  value={draft.pitch}
                  onChange={(event) => setDraft((current) => ({ ...current, pitch: event.target.value }))}
                  placeholder="What are you building, for whom, and why now?"
                  className="mt-2 w-full border border-[#44483a] bg-[#0d0f09] px-3 py-3 text-sm text-[#e3e3d8] outline-none transition placeholder:text-[#44483a] focus:border-[#9ddf2e]"
                />
              </label>
            </div>

            <div className="mt-4 border border-[#44483a] bg-[#1b1c16] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7dd3fc]">Active path // {activeTrack.shortTitle}</div>
                  <div className="mt-1 text-base font-bold text-[#e3e3d8]">{activeTrack.title}</div>
                </div>
                <span className="font-mono text-3xl font-bold text-[#44483a]">{activeTrack.number}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#c5c8b6]">{activeTrack.rule}</p>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={startProject}
                className="inline-flex flex-1 items-center justify-center gap-2 border border-[#9ddf2e] bg-[#9ddf2e] px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d0f09] transition hover:bg-[#83c300]"
              >
                <Play className="h-4 w-4 fill-current" />
                Forge project plan
              </button>
              <button
                onClick={() => onNavigate('mission-control')}
                className="inline-flex items-center justify-center gap-2 border border-[#7dd3fc]/50 bg-[#7dd3fc]/5 px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#7dd3fc] transition hover:bg-[#7dd3fc]/10"
              >
                Open mission board
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section className="xl:col-span-5 border border-[#44483a] bg-[#1b1c16] p-5">
            <div className="flex items-center justify-between border-b border-[#44483a] pb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-[#9ddf2e]" />
                <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Submission checklist</h2>
              </div>
              <span className="font-mono text-[10px] text-[#9ddf2e]">{completed.length}/{checklist.length}</span>
            </div>
            <div className="mt-3 max-h-[380px] space-y-1 overflow-y-auto pr-1 custom-scrollbar">
              {checklist.map((item, index) => {
                const checked = completed.includes(item.id);
                const showGroup = index === 0 || checklist[index - 1].group !== item.group;
                return (
                  <div key={item.id}>
                    {showGroup && (
                      <div className="pb-1 pt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#8f9282]">{item.group}</div>
                    )}
                    <button
                      onClick={() => toggleChecklist(item.id)}
                      className={`flex w-full items-start gap-3 border px-3 py-2.5 text-left transition ${checked ? 'border-[#9ddf2e]/30 bg-[#9ddf2e]/5 text-[#e3e3d8]' : 'border-[#44483a] bg-[#12140e] text-[#c5c8b6] hover:border-[#8f9282]'}`}
                    >
                      {checked ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9ddf2e]" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#44483a]" />}
                      <span className={`text-xs leading-5 ${checked ? '' : 'text-[#c5c8b6]'}`}>{item.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="border border-[#ffb020]/40 bg-[#12140e] p-5">
          <div className="flex flex-col gap-4 border-b border-[#44483a] pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-[#ffb020]" />
                <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Submission protocol</h2>
              </div>
              <p className="mt-2 text-sm font-bold text-[#ffb020]">Sunday, June 14, 2026 at 9:00 AM EDT</p>
              <p className="mt-1 text-xs text-[#8f9282]">Late projects are not accepted. Submit through the Hacker Dashboard before the clock reaches zero.</p>
            </div>
            <a
              href="https://ethglobal.com/events/newyork2026/home"
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 border border-[#ffb020] bg-[#ffb020] px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d0f09] transition hover:bg-[#f59e0b]"
            >
              Open submission dashboard
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <div className="border border-[#44483a] bg-[#0d0f09] p-4">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7dd3fc]">Required materials</div>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-[#c5c8b6]">
                <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9ddf2e]" />Project title and clear description</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9ddf2e]" />Repository plus Figma or equivalent proof</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9ddf2e]" />New work distinguished from reused work</li>
                <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9ddf2e]" />AI use, prompts, specs, and plans attributed</li>
              </ul>
            </div>

            <div className="border border-[#44483a] bg-[#0d0f09] p-4">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7dd3fc]">Choose a submission mode</div>
              <div className="mt-3 space-y-2">
                <div className="border border-[#9ddf2e]/30 bg-[#9ddf2e]/5 p-3">
                  <div className="text-xs font-bold text-[#e3e3d8]">Finalist + Partner Prizes</div>
                  <p className="mt-1 text-[11px] leading-4 text-[#8f9282]">Requires presenting at the assigned Finalist judging session.</p>
                </div>
                <div className="border border-[#44483a] bg-[#12140e] p-3">
                  <div className="text-xs font-bold text-[#e3e3d8]">Partner Prizes Only</div>
                  <p className="mt-1 text-[11px] leading-4 text-[#8f9282]">Select up to three partners and explain integration, feedback, and relevant comments.</p>
                </div>
              </div>
            </div>

            <div className="border border-[#44483a] bg-[#0d0f09] p-4">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7dd3fc]">Video upload QA</div>
              <p className="mt-3 text-xs leading-5 text-[#c5c8b6]">Optional, but strongly encouraged for the Showcase. Keep it 2-4 minutes and at least 720p.</p>
              <div className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-[9px] uppercase text-[#ffb4ab]">
                <span className="border border-[#ffb4ab]/20 bg-[#ffb4ab]/5 px-2 py-1.5">No mobile recording</span>
                <span className="border border-[#ffb4ab]/20 bg-[#ffb4ab]/5 px-2 py-1.5">No AI voiceover</span>
                <span className="border border-[#ffb4ab]/20 bg-[#ffb4ab]/5 px-2 py-1.5">Do not speed up</span>
                <span className="border border-[#ffb4ab]/20 bg-[#ffb4ab]/5 px-2 py-1.5">Do not exceed 4 min</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-12">
          <section className="xl:col-span-7 border border-[#44483a] bg-[#12140e] p-5">
            <div className="flex items-center gap-2 border-b border-[#44483a] pb-4">
              <Scale className="h-4 w-4 text-[#ffb020]" />
              <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Build for the judging room</h2>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-5">
              {judgingCriteria.map((criterion) => {
                const Icon = criterion.icon;
                return (
                  <div key={criterion.label} className="border border-[#44483a] bg-[#0d0f09] p-3">
                    <Icon className="h-4 w-4 text-[#ffb020]" />
                    <div className="mt-3 text-xs font-bold text-[#e3e3d8]">{criterion.label}</div>
                    <p className="mt-2 text-[11px] leading-4 text-[#8f9282]">{criterion.prompt}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="border border-[#7dd3fc]/30 bg-[#7dd3fc]/5 p-3">
                <Timer className="h-4 w-4 text-[#7dd3fc]" />
                <div className="mt-2 font-mono text-[10px] uppercase text-[#7dd3fc]">Live judging</div>
                <div className="mt-1 text-sm font-bold text-[#e3e3d8]">4 min demo + 3 min Q&A</div>
                <div className="mt-2 text-[10px] leading-4 text-[#8f9282]">Check in at the judging table before your assigned session.</div>
              </div>
              <div className="border border-[#ffb020]/30 bg-[#ffb020]/5 p-3">
                <Video className="h-4 w-4 text-[#ffb020]" />
                <div className="mt-2 font-mono text-[10px] uppercase text-[#ffb020]">Demo video</div>
                <div className="mt-1 text-sm font-bold text-[#e3e3d8]">2-4 min // 720p minimum</div>
              </div>
              <div className="border border-[#9ddf2e]/30 bg-[#9ddf2e]/5 p-3">
                <GitBranch className="h-4 w-4 text-[#9ddf2e]" />
                <div className="mt-2 font-mono text-[10px] uppercase text-[#9ddf2e]">Source proof</div>
                <div className="mt-1 text-sm font-bold text-[#e3e3d8]">Frequent commits // clear README</div>
              </div>
            </div>
            <div className="mt-3 border border-[#44483a] bg-[#0d0f09] p-3">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8f9282]">Prepare for judge questions</div>
              <div className="mt-2 grid gap-2 text-[11px] text-[#c5c8b6] md:grid-cols-3">
                <span>What inspired the project?</span>
                <span>Which tools did you use, and why?</span>
                <span>What technical challenges did you solve?</span>
              </div>
              <p className="mt-3 border-t border-[#44483a] pt-3 text-[10px] leading-4 text-[#8f9282]">Partner booth presentations are optional. Partners judge from the submitted project materials, so make those materials stand on their own.</p>
            </div>
          </section>

          <section className="xl:col-span-5 border border-[#44483a] bg-[#1b1c16] p-5">
            <div className="flex items-center gap-2 border-b border-[#44483a] pb-4">
              <ExternalLink className="h-4 w-4 text-[#7dd3fc]" />
              <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Official event links</h2>
            </div>
            <div className="mt-4 space-y-2">
              {eventLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 border border-[#44483a] bg-[#12140e] p-3 transition hover:border-[#7dd3fc]/60"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#44483a] bg-[#0d0f09] text-[#7dd3fc]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-[#e3e3d8]">{link.label}</span>
                      <span className="mt-1 block truncate text-[11px] text-[#8f9282]">{link.description}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[#44483a] transition group-hover:text-[#7dd3fc]" />
                  </a>
                );
              })}
            </div>
          </section>
        </div>

        <section className="border border-[#44483a] bg-[#12140e] p-5">
          <div className="flex flex-col gap-4 border-b border-[#44483a] pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#9ddf2e]" />
                <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">36-hour builder kit</h2>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#8f9282]">A focused route through the official ETHGlobal resource library for getting from empty repo to working onchain demo.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={copyStarterCommand}
                className="inline-flex items-center justify-center gap-2 border border-[#9ddf2e]/50 bg-[#9ddf2e]/5 px-4 py-2.5 font-mono text-[10px] font-bold text-[#9ddf2e] transition hover:bg-[#9ddf2e]/10"
              >
                <Code2 className="h-3.5 w-3.5" />
                npx create-eth@latest
              </button>
              <a
                href="https://ethglobal.com/events/newyork2026/info/resources"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-[#7dd3fc]/50 bg-[#7dd3fc]/5 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#7dd3fc] transition hover:bg-[#7dd3fc]/10"
              >
                Full resource library
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {resourceLanes.map((lane) => {
              const Icon = lane.icon;
              return (
                <div key={lane.title} className="border border-[#44483a] bg-[#0d0f09] p-4">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${lane.tone}`} />
                    <h3 className="text-xs font-bold text-[#e3e3d8]">{lane.title}</h3>
                  </div>
                  <p className="mt-2 min-h-10 text-[11px] leading-5 text-[#8f9282]">{lane.description}</p>
                  <div className="mt-4 space-y-1.5">
                    {lane.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between gap-3 border border-[#44483a] bg-[#12140e] px-3 py-2 text-[11px] text-[#c5c8b6] transition hover:border-[#7dd3fc]/50 hover:text-[#e3e3d8]"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#44483a] transition group-hover:text-[#7dd3fc]" />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border border-[#44483a] bg-[#12140e] p-5">
          <div className="flex flex-col gap-3 border-b border-[#44483a] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#7dd3fc]" />
              <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Hacker FAQ</h2>
            </div>
            <a
              href="https://ethglobal.com/events/newyork2026#faq"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#7dd3fc] hover:text-[#e3e3d8]"
            >
              Open official FAQ
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="mt-4 grid gap-2 lg:grid-cols-2">
            {eventFaqs.map((faq) => (
              <details
                key={faq.question}
                className="group border border-[#44483a] bg-[#0d0f09] open:border-[#7dd3fc]/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-[#e3e3d8] marker:content-none">
                  {faq.question}
                  <span className="font-mono text-base font-normal text-[#7dd3fc] group-open:rotate-45">+</span>
                </summary>
                <p className="border-t border-[#44483a] px-4 py-3 text-xs leading-5 text-[#c5c8b6]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 border border-[#ffb020]/30 bg-[#ffb020]/5 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#ffb020]" />
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffb020]">Rules snapshot</div>
              <p className="mt-1 text-xs leading-5 text-[#c5c8b6]">
                AI tools are allowed, but meaningful team contribution and transparent attribution are required. Include prompts and planning artifacts for spec-driven workflows. Event-specific deadlines and partner requirements should always be confirmed in the Hacker Dashboard.
              </p>
            </div>
          </div>
          <a
            href="https://ethglobal.com/events/newyork2026/info/details"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 border border-[#ffb020]/50 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffb020] transition hover:bg-[#ffb020]/10"
          >
            Read full rules
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </section>
      </div>
    </div>
  );
};
