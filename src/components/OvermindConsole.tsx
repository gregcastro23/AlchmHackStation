import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  KeyRound,
  Loader2,
  Send,
  ShieldCheck,
  Trash2,
  Wrench,
  Zap,
} from 'lucide-react';
import type Anthropic from '@anthropic-ai/sdk';
import {
  DEFAULT_MODEL,
  MODEL_CATALOG,
  OVERMIND_TOOLS,
  clearKey,
  describeApiError,
  estimateCostUsd,
  loadKey,
  maskKey,
  probeConnection,
  runOvermind,
  saveKey,
} from '../lib/overmind';
import type { ModelInfo, ToolExecutor } from '../lib/overmind';

interface OvermindConsoleProps {
  onCommitLog: (text: string, type?: 'default' | 'info' | 'success' | 'warning') => void;
  setActiveTab: (tab: string) => void;
  applyStack: (patch: { language?: string; framework?: string; cssEngine?: string; database?: string }) => void;
  getStationState: () => Record<string, unknown>;
  decompose: (idea: string) => Record<string, unknown>;
  forgeSwarm: (idea: string, pattern: string) => string;
}

type FeedItem =
  | { kind: 'user'; text: string }
  | { kind: 'agent'; text: string }
  | { kind: 'tool'; name: string; detail: string; isError: boolean }
  | { kind: 'system'; text: string }
  | { kind: 'error'; text: string };

type LinkState = 'unset' | 'untested' | 'probing' | 'online' | 'failed';

const SEED_DIRECTIVES = [
  'Build me a realtime collaborative pixel-art editor with AI co-drawing',
  'What is the station working on right now? Give me a verdict.',
  'Forge a web3 ticketing marketplace — pick the safest pattern and stack.',
];

export const OvermindConsole: React.FC<OvermindConsoleProps> = ({
  onCommitLog,
  setActiveTab,
  applyStack,
  getStationState,
  decompose,
  forgeSwarm,
}) => {
  const [apiKey, setApiKey] = useState<string>(() => loadKey());
  const [keyDraft, setKeyDraft] = useState('');
  const [linkState, setLinkState] = useState<LinkState>(() => (loadKey() ? 'untested' : 'unset'));
  const [models, setModels] = useState<ModelInfo[]>(MODEL_CATALOG);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [feed, setFeed] = useState<FeedItem[]>([
    { kind: 'system', text: 'OVERMIND standing by. Bind an Anthropic API key to bring the build authority online.' },
  ]);
  const [directive, setDirective] = useState('');
  const [running, setRunning] = useState(false);
  const [tokens, setTokens] = useState({ input: 0, output: 0 });
  const historyRef = useRef<Anthropic.MessageParam[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight });
  }, [feed]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const pushFeed = useCallback((item: FeedItem) => {
    setFeed((prev) => [...prev, item]);
  }, []);

  const appendAgentText = useCallback((delta: string) => {
    setFeed((prev) => {
      const last = prev[prev.length - 1];
      if (last?.kind === 'agent') {
        return [...prev.slice(0, -1), { kind: 'agent', text: last.text + delta }];
      }
      return [...prev, { kind: 'agent', text: delta }];
    });
  }, []);

  const handleBindKey = () => {
    const k = keyDraft.trim();
    if (!k) return;
    saveKey(k);
    setApiKey(k);
    setKeyDraft('');
    setLinkState('untested');
    onCommitLog('[OVERMIND] API key bound to local vault (browser-only storage).', 'success');
  };

  const handleClearKey = () => {
    clearKey();
    setApiKey('');
    setLinkState('unset');
    historyRef.current = [];
    onCommitLog('[OVERMIND] API key cleared from local vault.', 'info');
  };

  const handleProbe = async () => {
    if (!apiKey || linkState === 'probing') return;
    setLinkState('probing');
    try {
      const live = await probeConnection(apiKey);
      if (live.length > 0) {
        setModels(live);
        if (!live.some((m) => m.id === model)) setModel(live[0].id);
      }
      setLinkState('online');
      pushFeed({ kind: 'system', text: `Uplink online — ${live.length} models discovered via live catalog.` });
      onCommitLog(`[OVERMIND] Anthropic uplink verified: ${live.length} models available.`, 'success');
    } catch (err) {
      setLinkState('failed');
      pushFeed({ kind: 'error', text: describeApiError(err) });
    }
  };

  const executors: Record<string, ToolExecutor> = {
    decompose_idea: (input) => {
      const idea = String(input.idea ?? '');
      const plan = decompose(idea);
      onCommitLog(`[OVERMIND] Decomposed idea into build plan: "${idea.slice(0, 60)}…"`, 'info');
      return JSON.stringify(plan);
    },
    forge_swarm: (input) => {
      const idea = String(input.idea ?? '');
      const pattern = String(input.pattern ?? 'swarm');
      const summary = forgeSwarm(idea, pattern);
      onCommitLog(`[OVERMIND] Swarm forged under ${pattern.toUpperCase()} pattern.`, 'success');
      return summary;
    },
    set_stack: (input) => {
      const patch: { language?: string; framework?: string; cssEngine?: string; database?: string } = {};
      if (typeof input.language === 'string') patch.language = input.language;
      if (typeof input.framework === 'string') patch.framework = input.framework;
      if (typeof input.cssEngine === 'string') patch.cssEngine = input.cssEngine;
      if (typeof input.database === 'string') patch.database = input.database;
      applyStack(patch);
      const desc = Object.entries(patch).map(([k, v]) => `${k}=${v}`).join(', ') || 'no changes';
      onCommitLog(`[OVERMIND] Stack reconfigured: ${desc}`, 'success');
      return `Stack updated: ${desc}`;
    },
    read_station_state: () => JSON.stringify(getStationState()),
    open_module: (input) => {
      const tab = String(input.tab ?? 'mission-control');
      setActiveTab(tab);
      onCommitLog(`[OVERMIND] Navigated operator UI to ${tab}.`, 'info');
      return `Module ${tab} opened.`;
    },
  };

  const dispatch = async (text: string) => {
    const dir = text.trim();
    if (!dir || running) return;
    if (!apiKey) {
      pushFeed({ kind: 'error', text: 'No API key bound. Add your Anthropic key in the vault first.' });
      return;
    }
    if (linkState !== 'online') {
      pushFeed({ kind: 'error', text: 'Verify the uplink first. This confirms the key and selects a model your account can use.' });
      return;
    }
    setDirective('');
    setRunning(true);
    pushFeed({ kind: 'user', text: dir });
    abortRef.current = new AbortController();

    try {
      const result = await runOvermind({
        apiKey,
        model,
        history: historyRef.current,
        directive: dir,
        executors,
        signal: abortRef.current.signal,
        events: {
          onTextDelta: appendAgentText,
          onToolCall: (name, input) => {
            pushFeed({
              kind: 'tool',
              name,
              detail: JSON.stringify(input).slice(0, 140),
              isError: false,
            });
          },
          onToolResult: (exec) => {
            if (exec.isError) {
              pushFeed({ kind: 'tool', name: `${exec.name} ✗`, detail: exec.result.slice(0, 140), isError: true });
            }
          },
          onUsage: (i, o) => setTokens((prev) => ({ input: prev.input + i, output: prev.output + o })),
        },
      });
      historyRef.current = result.history;
      setLinkState('online');
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        pushFeed({ kind: 'error', text: describeApiError(err) });
      }
    } finally {
      setRunning(false);
      abortRef.current = null;
    }
  };

  const cost = estimateCostUsd(model, tokens.input, tokens.output);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 select-none lg:flex-row">
      {/* LEFT — vault + model + telemetry */}
      <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[320px]">
        <div className="border border-[#44483a] bg-[#12140e] p-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-[#c4b5fd]" />
            <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#e3e3d8]">Overmind</h2>
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f9282]">
            live agentic build authority
          </p>

          {/* key vault */}
          <div className="mt-4">
            <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-[#8f9282]">
              <span className="flex items-center gap-1.5">
                <KeyRound className="h-3 w-3" /> Anthropic key vault
              </span>
              <span
                className={
                  linkState === 'online'
                    ? 'text-[#9ddf2e]'
                    : linkState === 'failed'
                      ? 'text-[#ffb4ab]'
                      : 'text-[#8f9282]'
                }
              >
                {linkState === 'online' ? '● online' : linkState === 'probing' ? '○ probing' : linkState === 'failed' ? '● failed' : linkState === 'untested' ? '○ bound' : '○ empty'}
              </span>
            </div>
            {apiKey ? (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 truncate border border-[#44483a] bg-[#0d0f09] px-2 py-1.5 font-mono text-[11px] text-[#9ddf2e]">
                  {maskKey(apiKey)}
                </div>
                <button
                  onClick={handleClearKey}
                  title="Clear key"
                  className="border border-[#ffb4ab]/40 bg-[#ffb4ab]/5 p-1.5 text-[#ffb4ab] transition hover:bg-[#ffb4ab]/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <form
                className="mt-2 flex items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleBindKey();
                }}
              >
                <input
                  type="password"
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  placeholder="sk-ant-…"
                  className="min-w-0 flex-1 border border-[#44483a] bg-[#0d0f09] px-2 py-1.5 font-mono text-[11px] text-[#e3e3d8] placeholder:text-[#8f9282]/50 focus:border-[#9ddf2e]/60 focus:outline-none"
                />
                <button
                  type="submit"
                  className="border border-[#9ddf2e]/60 bg-[#9ddf2e]/10 px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase text-[#9ddf2e] transition hover:bg-[#9ddf2e]/20"
                >
                  Bind
                </button>
              </form>
            )}
            <button
              onClick={handleProbe}
              disabled={!apiKey || linkState === 'probing'}
              className="mt-2 flex w-full items-center justify-center gap-2 border border-[#7dd3fc]/50 bg-[#7dd3fc]/5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#7dd3fc] transition hover:bg-[#7dd3fc]/10 disabled:cursor-not-allowed disabled:border-[#44483a] disabled:text-[#8f9282]"
            >
              {linkState === 'probing' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
              Test uplink + discover models
            </button>
            <p className="mt-2 flex items-start gap-1.5 font-mono text-[8.5px] leading-3.5 text-[#8f9282]">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-[#9ddf2e]" />
              Key lives in this browser only and is sent solely to api.anthropic.com. Never logged, never exported.
            </p>
          </div>

          {/* model select */}
          <div className="mt-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8f9282]">Model select</div>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="mt-1.5 w-full border border-[#44483a] bg-[#0d0f09] px-2 py-2 font-mono text-[11px] text-[#e3e3d8] focus:border-[#9ddf2e]/60 focus:outline-none"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* spend telemetry */}
        <div className="grid grid-cols-3 gap-2">
          <div className="border border-[#44483a] bg-[#12140e] p-2.5">
            <div className="font-mono text-[8px] uppercase tracking-wider text-[#8f9282]">Tok in</div>
            <div className="mt-1 font-mono text-[16px] font-bold text-[#7dd3fc]">
              {tokens.input > 999 ? `${(tokens.input / 1000).toFixed(1)}k` : tokens.input}
            </div>
          </div>
          <div className="border border-[#44483a] bg-[#12140e] p-2.5">
            <div className="font-mono text-[8px] uppercase tracking-wider text-[#8f9282]">Tok out</div>
            <div className="mt-1 font-mono text-[16px] font-bold text-[#9ddf2e]">
              {tokens.output > 999 ? `${(tokens.output / 1000).toFixed(1)}k` : tokens.output}
            </div>
          </div>
          <div className="border border-[#44483a] bg-[#12140e] p-2.5">
            <div className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-[#8f9282]">
              <CircleDollarSign className="h-2.5 w-2.5" /> Spend
            </div>
            <div className="mt-1 font-mono text-[16px] font-bold text-[#ffb020]">${cost.toFixed(3)}</div>
          </div>
        </div>

        {/* tool registry */}
        <div className="min-h-0 flex-1 overflow-y-auto border border-[#44483a] bg-[#12140e] p-3 custom-scrollbar">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#8f9282]">
            <Wrench className="h-3 w-3" /> Tool authority ({OVERMIND_TOOLS.length})
          </div>
          <div className="space-y-1.5">
            {OVERMIND_TOOLS.map((t) => (
              <div key={t.name} className="border border-[#44483a]/60 bg-[#1b1c16] px-2 py-1.5">
                <div className="font-mono text-[10px] font-bold text-[#c4b5fd]">{t.name}</div>
                <div className="mt-0.5 line-clamp-2 font-mono text-[8.5px] leading-3 text-[#8f9282]">
                  {String(t.description ?? '').split('.')[0]}.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — directive stream */}
      <div className="flex min-h-[400px] flex-1 flex-col border border-[#44483a] bg-[#0d0f09]">
        <div className="flex items-center justify-between border-b border-[#44483a] bg-[#12140e] px-3 py-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#c4b5fd]">
            <span className="relative flex h-1.5 w-1.5">
              {running && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c4b5fd] opacity-75" />}
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${running ? 'bg-[#c4b5fd]' : linkState === 'online' ? 'bg-[#9ddf2e]' : 'bg-[#44483a]'}`} />
            </span>
            Directive stream // {model}
          </div>
          <span className="font-mono text-[9px] uppercase text-[#8f9282]">
            {running ? 'thinking + acting…' : linkState === 'online' ? 'authority online' : 'standby'}
          </span>
        </div>

        <div ref={feedRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3 custom-scrollbar">
          {feed.map((item, i) => {
            if (item.kind === 'user') {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] border border-[#7dd3fc]/40 bg-[#7dd3fc]/5 px-3 py-2 font-mono text-[12px] leading-5 text-[#e3e3d8]">
                    <span className="mr-2 text-[9px] uppercase tracking-wider text-[#7dd3fc]">operator</span>
                    {item.text}
                  </div>
                </div>
              );
            }
            if (item.kind === 'agent') {
              return (
                <div key={i} className="max-w-[92%] border border-[#c4b5fd]/30 bg-[#c4b5fd]/5 px-3 py-2 font-mono text-[12px] leading-5 whitespace-pre-wrap text-[#e3e3d8]">
                  <span className="mr-2 text-[9px] uppercase tracking-wider text-[#c4b5fd]">overmind</span>
                  {item.text}
                </div>
              );
            }
            if (item.kind === 'tool') {
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 border px-2.5 py-1.5 font-mono text-[10px] ${
                    item.isError
                      ? 'border-[#ffb4ab]/40 bg-[#ffb4ab]/5 text-[#ffb4ab]'
                      : 'border-[#9ddf2e]/30 bg-[#9ddf2e]/5 text-[#9ddf2e]'
                  }`}
                >
                  {item.isError ? <ChevronRight className="h-3 w-3 shrink-0" /> : <CheckCircle2 className="h-3 w-3 shrink-0" />}
                  <span className="font-bold">{item.name}</span>
                  <span className="truncate text-[#8f9282]">{item.detail}</span>
                </div>
              );
            }
            if (item.kind === 'error') {
              return (
                <div key={i} className="border border-[#ffb4ab]/40 bg-[#ffb4ab]/5 px-3 py-2 font-mono text-[11px] text-[#ffb4ab]">
                  ⚠ {item.text}
                </div>
              );
            }
            return (
              <div key={i} className="px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8f9282]">
                ─ {item.text}
              </div>
            );
          })}
          {running && (
            <div className="flex items-center gap-2 px-1 font-mono text-[10px] text-[#c4b5fd]">
              <Loader2 className="h-3 w-3 animate-spin" /> overmind working…
            </div>
          )}
        </div>

        {/* seeds + input */}
        <div className="border-t border-[#44483a] bg-[#12140e] p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SEED_DIRECTIVES.map((s, i) => (
              <button
                key={i}
                onClick={() => dispatch(s)}
                disabled={running}
                className="max-w-full truncate border border-[#44483a] bg-[#1b1c16] px-2 py-1 font-mono text-[9px] text-[#8f9282] transition hover:border-[#c4b5fd]/50 hover:text-[#c4b5fd] disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={directive}
              onChange={(e) => setDirective(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && dispatch(directive)}
              placeholder={apiKey ? 'Issue a build directive…' : 'Bind an API key to issue directives'}
              disabled={running}
              className="min-w-0 flex-1 border border-[#44483a] bg-[#0d0f09] px-3 py-2 font-mono text-[12px] text-[#e3e3d8] placeholder:text-[#8f9282]/50 focus:border-[#c4b5fd]/60 focus:outline-none disabled:opacity-60"
            />
            {running ? (
              <button
                onClick={() => abortRef.current?.abort()}
                className="border border-[#ffb4ab]/50 bg-[#ffb4ab]/5 px-4 font-mono text-[10px] font-bold uppercase text-[#ffb4ab] transition hover:bg-[#ffb4ab]/10"
              >
                Halt
              </button>
            ) : (
              <button
                onClick={() => dispatch(directive)}
                disabled={!directive.trim()}
                className="flex items-center gap-1.5 border border-[#c4b5fd]/60 bg-[#c4b5fd]/10 px-4 font-mono text-[10px] font-bold uppercase text-[#c4b5fd] transition hover:bg-[#c4b5fd]/20 disabled:cursor-not-allowed disabled:border-[#44483a] disabled:text-[#8f9282]"
              >
                <Send className="h-3 w-3" /> Send
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
