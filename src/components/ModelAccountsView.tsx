import React, { useState } from 'react';
import {
  AlertTriangle,
  Database,
  Eye,
  KeyRound,
  Plus,
  RefreshCw,
  Server,
  ShieldCheck,
} from 'lucide-react';

type LogType = 'success' | 'info' | 'warning' | 'error' | 'default';
type ProviderName = 'OpenAI' | 'Anthropic' | 'Google' | 'OpenRouter' | 'Local';
type AccountStatus = 'healthy' | 'degraded' | 'local';

interface ModelAccountsViewProps {
  onCommitLog: (text: string, type?: LogType) => void;
}

interface ProviderAccount {
  id: string;
  provider: ProviderName;
  label: string;
  secretRef: string;
  workspace: string;
  status: AccountStatus;
  enabled: boolean;
  monthlySpend: number;
  monthlyLimit: number;
  models: number;
  rotationDays: number;
  lastCheck: string;
}

const initialAccounts: ProviderAccount[] = [
  {
    id: 'openai-primary',
    provider: 'OpenAI',
    label: 'Production project',
    secretRef: 'vault://providers/openai/production',
    workspace: 'alchm-production',
    status: 'healthy',
    enabled: true,
    monthlySpend: 48.2,
    monthlyLimit: 110,
    models: 4,
    rotationDays: 21,
    lastCheck: '12 sec ago',
  },
  {
    id: 'anthropic-build',
    provider: 'Anthropic',
    label: 'Builder workspace',
    secretRef: 'vault://providers/anthropic/builder',
    workspace: 'hackstation-builder',
    status: 'healthy',
    enabled: true,
    monthlySpend: 37.9,
    monthlyLimit: 90,
    models: 3,
    rotationDays: 34,
    lastCheck: '18 sec ago',
  },
  {
    id: 'google-vision',
    provider: 'Google',
    label: 'Vision project',
    secretRef: 'vault://providers/google/vision',
    workspace: 'alchm-vision-lab',
    status: 'degraded',
    enabled: true,
    monthlySpend: 18.7,
    monthlyLimit: 55,
    models: 2,
    rotationDays: 8,
    lastCheck: '2 min ago',
  },
  {
    id: 'local-runtime',
    provider: 'Local',
    label: 'Bun sidecar runtime',
    secretRef: 'local://ollama/localhost',
    workspace: '127.0.0.1:11434',
    status: 'local',
    enabled: true,
    monthlySpend: 0,
    monthlyLimit: 0,
    models: 3,
    rotationDays: 0,
    lastCheck: 'live',
  },
];

const modelAliases = [
  { alias: 'architect-primary', provider: 'OpenAI', account: 'Production project', target: 'primary reasoning', context: 'Large', lane: 'Architecture', status: 'ready' },
  { alias: 'builder-fast', provider: 'Anthropic', account: 'Builder workspace', target: 'coding fast', context: 'Large', lane: 'Implementation', status: 'ready' },
  { alias: 'vision-review', provider: 'Google', account: 'Vision project', target: 'multimodal review', context: 'Medium', lane: 'Design QA', status: 'watch' },
  { alias: 'economy-fallback', provider: 'OpenRouter', account: 'Gateway fallback', target: 'cost optimized', context: 'Medium', lane: 'Overflow', status: 'standby' },
  { alias: 'offline-fallback', provider: 'Local', account: 'Bun sidecar runtime', target: 'local coding model', context: 'Local', lane: 'Private work', status: 'ready' },
];

const providerTone: Record<ProviderName, string> = {
  OpenAI: '#9ddf2e',
  Anthropic: '#7dd3fc',
  Google: '#ffb020',
  OpenRouter: '#e3e3d8',
  Local: '#c084fc',
};

export const ModelAccountsView: React.FC<ModelAccountsViewProps> = ({ onCommitLog }) => {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [defaultAccountId, setDefaultAccountId] = useState('openai-primary');
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [provider, setProvider] = useState<ProviderName>('OpenRouter');
  const [label, setLabel] = useState('Gateway fallback');
  const [secretRef, setSecretRef] = useState('vault://providers/openrouter/fallback');
  const [workspace, setWorkspace] = useState('hackstation-gateway');
  const [testingId, setTestingId] = useState<string | null>(null);

  const toggleAccount = (id: string) => {
    setAccounts((current) => current.map((account) => (
      account.id === id ? { ...account, enabled: !account.enabled } : account
    )));
    const account = accounts.find((item) => item.id === id);
    if (account) onCommitLog(`${account.provider} account ${account.enabled ? 'disabled' : 'enabled'}: ${account.label}.`, 'info');
  };

  const testConnection = (account: ProviderAccount) => {
    setTestingId(account.id);
    onCommitLog(`Testing ${account.provider} connection using ${account.secretRef}.`, 'info');
    setTimeout(() => {
      setTestingId(null);
      setAccounts((current) => current.map((item) => (
        item.id === account.id ? { ...item, status: item.provider === 'Local' ? 'local' : 'healthy', lastCheck: 'just now' } : item
      )));
      onCommitLog(`${account.provider} account health check passed for ${account.workspace}.`, 'success');
    }, 700);
  };

  const rotateCredential = (account: ProviderAccount) => {
    setAccounts((current) => current.map((item) => (
      item.id === account.id ? { ...item, rotationDays: 90, lastCheck: 'just now' } : item
    )));
    onCommitLog(`Credential rotation requested for ${account.provider}; vault reference retained and audit event recorded.`, 'warning');
  };

  const addAccount = () => {
    const id = `${provider.toLowerCase()}-${Date.now().toString(36)}`;
    const nextAccount: ProviderAccount = {
      id,
      provider,
      label,
      secretRef,
      workspace,
      status: provider === 'Local' ? 'local' : 'healthy',
      enabled: true,
      monthlySpend: 0,
      monthlyLimit: provider === 'Local' ? 0 : 50,
      models: 0,
      rotationDays: provider === 'Local' ? 0 : 90,
      lastCheck: 'just now',
    };
    setAccounts((current) => [...current, nextAccount]);
    setShowAccountForm(false);
    onCommitLog(`${provider} account connected as ${label}; secret stored by reference only.`, 'success');
  };

  const testAll = () => {
    onCommitLog('Running health checks across all enabled model accounts.', 'info');
    accounts.filter((account) => account.enabled).forEach((account, index) => {
      setTimeout(() => onCommitLog(`${account.provider}/${account.workspace}: connection healthy.`, 'success'), (index + 1) * 180);
    });
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 pb-2">
        <section className="xl:col-span-12 border border-[#44483a] bg-[#12140e] p-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7dd3fc]">
                <KeyRound className="h-4 w-4" />
                identity and provider vault
              </div>
              <h2 className="mt-3 text-2xl font-bold text-[#e3e3d8]">Model Accounts</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c5c8b6]">
                Provider workspaces, secret references, model aliases, rotation posture, and connection health.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={testAll} className="inline-flex items-center gap-2 border border-[#7dd3fc]/50 bg-[#7dd3fc]/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#7dd3fc] hover:bg-[#7dd3fc]/10"><RefreshCw className="h-3.5 w-3.5" /> Test all</button>
              <button onClick={() => setShowAccountForm((current) => !current)} className="inline-flex items-center gap-2 border border-[#9ddf2e] bg-[#9ddf2e] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d0f09] hover:bg-[#83c300]"><Plus className="h-3.5 w-3.5" /> Connect account</button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="border border-[#44483a] bg-[#1b1c16] p-3"><div className="font-mono text-[9px] uppercase text-[#8f9282]">Connected</div><div className="mt-2 text-2xl font-bold text-[#e3e3d8]">{accounts.length}</div><div className="mt-1 font-mono text-[9px] uppercase text-[#9ddf2e]">{accounts.filter((account) => account.enabled).length} enabled</div></div>
            <div className="border border-[#44483a] bg-[#1b1c16] p-3"><div className="font-mono text-[9px] uppercase text-[#8f9282]">Model aliases</div><div className="mt-2 text-2xl font-bold text-[#e3e3d8]">{modelAliases.length}</div><div className="mt-1 font-mono text-[9px] uppercase text-[#7dd3fc]">provider independent</div></div>
            <div className="border border-[#44483a] bg-[#1b1c16] p-3"><div className="font-mono text-[9px] uppercase text-[#8f9282]">Vault posture</div><div className="mt-2 text-2xl font-bold text-[#9ddf2e]">Clean</div><div className="mt-1 font-mono text-[9px] uppercase text-[#8f9282]">no raw secrets rendered</div></div>
            <div className="border border-[#44483a] bg-[#1b1c16] p-3"><div className="font-mono text-[9px] uppercase text-[#8f9282]">Provider spend</div><div className="mt-2 text-2xl font-bold text-[#e3e3d8]">${accounts.reduce((total, account) => total + account.monthlySpend, 0).toFixed(2)}</div><div className="mt-1 font-mono text-[9px] uppercase text-[#ffb020]">current month</div></div>
          </div>
        </section>

        {showAccountForm && (
          <section className="xl:col-span-12 border border-[#9ddf2e]/50 bg-[#9ddf2e]/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Plus className="h-4 w-4 text-[#9ddf2e]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Connect provider account</h3></div>
              <span className="font-mono text-[9px] uppercase text-[#8f9282]">secret reference only</span>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <label><span className="font-mono text-[9px] uppercase text-[#8f9282]">Provider</span><select value={provider} onChange={(event) => setProvider(event.target.value as ProviderName)} className="mt-1 w-full border border-[#44483a] bg-[#0d0f09] px-3 py-2 text-sm text-[#e3e3d8] outline-none"><option>OpenAI</option><option>Anthropic</option><option>Google</option><option>OpenRouter</option><option>Local</option></select></label>
              <label><span className="font-mono text-[9px] uppercase text-[#8f9282]">Account label</span><input value={label} onChange={(event) => setLabel(event.target.value)} className="mt-1 w-full border border-[#44483a] bg-[#0d0f09] px-3 py-2 text-sm text-[#e3e3d8] outline-none" /></label>
              <label><span className="font-mono text-[9px] uppercase text-[#8f9282]">Vault reference</span><input value={secretRef} onChange={(event) => setSecretRef(event.target.value)} className="mt-1 w-full border border-[#44483a] bg-[#0d0f09] px-3 py-2 font-mono text-xs text-[#7dd3fc] outline-none" /></label>
              <label><span className="font-mono text-[9px] uppercase text-[#8f9282]">Workspace / project</span><input value={workspace} onChange={(event) => setWorkspace(event.target.value)} className="mt-1 w-full border border-[#44483a] bg-[#0d0f09] px-3 py-2 text-sm text-[#e3e3d8] outline-none" /></label>
            </div>
            <div className="mt-4 flex justify-end gap-2"><button onClick={() => setShowAccountForm(false)} className="border border-[#44483a] px-3 py-2 font-mono text-[10px] uppercase text-[#c5c8b6]">Cancel</button><button onClick={addAccount} disabled={!label.trim() || !secretRef.trim()} className="border border-[#9ddf2e] bg-[#9ddf2e] px-3 py-2 font-mono text-[10px] font-bold uppercase text-[#0d0f09] disabled:opacity-40">Store reference</button></div>
          </section>
        )}

        <section className="xl:col-span-8 border border-[#44483a] bg-[#12140e] p-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Database className="h-4 w-4 text-[#9ddf2e]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Provider accounts</h3></div><span className="font-mono text-[9px] uppercase text-[#8f9282]">workspace scoped</span></div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {accounts.map((account) => {
              const tone = providerTone[account.provider];
              const spendUse = account.monthlyLimit > 0 ? Math.round((account.monthlySpend / account.monthlyLimit) * 100) : 0;
              return (
                <div key={account.id} className="border border-[#44483a] bg-[#1b1c16] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><div className="flex items-center gap-2"><span className="h-2 w-2" style={{ backgroundColor: tone }} /><span className="font-semibold text-[#e3e3d8]">{account.provider}</span>{defaultAccountId === account.id && <span className="border border-[#9ddf2e]/40 bg-[#9ddf2e]/5 px-1.5 py-0.5 font-mono text-[8px] uppercase text-[#9ddf2e]">default</span>}</div><div className="mt-1 text-xs text-[#c5c8b6]">{account.label}</div></div>
                    <button aria-label={`${account.enabled ? 'Disable' : 'Enable'} ${account.label}`} onClick={() => toggleAccount(account.id)} className={`h-5 w-9 border p-0.5 ${account.enabled ? 'border-[#9ddf2e] bg-[#9ddf2e]/20' : 'border-[#44483a]'}`}><span className={`block h-3.5 w-3.5 transition-transform ${account.enabled ? 'translate-x-3.5 bg-[#9ddf2e]' : 'bg-[#8f9282]'}`} /></button>
                  </div>
                  <div className="mt-4 border border-[#44483a] bg-[#0d0f09] p-2 font-mono text-[10px] text-[#7dd3fc]"><div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /><span className="truncate">{account.secretRef}</span></div></div>
                  <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[9px] uppercase"><div><span className="text-[#8f9282]">Workspace</span><div className="mt-1 truncate text-[#e3e3d8]">{account.workspace}</div></div><div><span className="text-[#8f9282]">Health</span><div className={`mt-1 ${account.status === 'degraded' ? 'text-[#ffb020]' : 'text-[#9ddf2e]'}`}>{account.status} / {account.lastCheck}</div></div><div><span className="text-[#8f9282]">Models</span><div className="mt-1 text-[#e3e3d8]">{account.models} mapped</div></div><div><span className="text-[#8f9282]">Rotation</span><div className={`mt-1 ${account.rotationDays > 0 && account.rotationDays < 14 ? 'text-[#ffb020]' : 'text-[#e3e3d8]'}`}>{account.rotationDays === 0 ? 'local auth' : `${account.rotationDays} days`}</div></div></div>
                  {account.monthlyLimit > 0 && <div className="mt-3"><div className="flex justify-between font-mono text-[9px] text-[#8f9282]"><span>${account.monthlySpend.toFixed(2)} spend</span><span>${account.monthlyLimit} cap</span></div><div className="mt-1 h-1 bg-[#0d0f09]"><div className={spendUse >= 75 ? 'h-full bg-[#ffb020]' : 'h-full bg-[#7dd3fc]'} style={{ width: `${Math.min(100, spendUse)}%` }} /></div></div>}
                  <div className="mt-4 grid grid-cols-3 gap-2"><button onClick={() => testConnection(account)} className="border border-[#7dd3fc]/40 px-2 py-1.5 font-mono text-[9px] uppercase text-[#7dd3fc] hover:bg-[#7dd3fc]/10">{testingId === account.id ? 'Testing...' : 'Test'}</button><button onClick={() => setDefaultAccountId(account.id)} className="border border-[#44483a] px-2 py-1.5 font-mono text-[9px] uppercase text-[#c5c8b6] hover:border-[#9ddf2e]">Default</button><button onClick={() => rotateCredential(account)} disabled={account.provider === 'Local'} className="border border-[#ffb020]/40 px-2 py-1.5 font-mono text-[9px] uppercase text-[#ffb020] disabled:opacity-30">Rotate</button></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="xl:col-span-4 border border-[#44483a] bg-[#1b1c16] p-4">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#9ddf2e]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Vault policy</h3></div>
          <div className="mt-4 space-y-3">
            {[{ label: 'Raw keys in UI', value: 'Blocked', tone: '#9ddf2e' }, { label: 'Runtime injection', value: 'Server only', tone: '#7dd3fc' }, { label: 'Rotation warning', value: '< 14 days', tone: '#ffb020' }, { label: 'Audit retention', value: '90 days', tone: '#e3e3d8' }].map((policy) => <div key={policy.label} className="flex items-center justify-between border border-[#44483a] bg-[#0d0f09] p-3 font-mono text-[10px] uppercase"><span className="text-[#8f9282]">{policy.label}</span><span style={{ color: policy.tone }}>{policy.value}</span></div>)}
          </div>
          <div className="mt-4 border border-[#ffb020]/40 bg-[#ffb020]/5 p-3"><div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#ffb020]"><AlertTriangle className="h-4 w-4" /> Rotation watch</div><p className="mt-2 text-xs leading-5 text-[#c5c8b6]">Google Vision reaches its rotation window in 8 days.</p></div>
          <div className="mt-3 border border-[#9ddf2e]/40 bg-[#9ddf2e]/5 p-3"><div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#9ddf2e]"><Eye className="h-4 w-4" /> Secret posture</div><p className="mt-2 text-xs leading-5 text-[#c5c8b6]">Only references and account metadata are visible to operators.</p></div>
        </section>

        <section className="xl:col-span-12 border border-[#44483a] bg-[#12140e] p-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Server className="h-4 w-4 text-[#7dd3fc]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Model alias registry</h3></div><span className="font-mono text-[9px] uppercase text-[#8f9282]">stable names over provider IDs</span></div>
          <div className="mt-4 overflow-x-auto custom-scrollbar"><table className="w-full min-w-[760px] border-collapse text-left"><thead className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8f9282]"><tr className="border-b border-[#44483a]"><th className="pb-2 font-normal">Alias</th><th className="pb-2 font-normal">Provider</th><th className="pb-2 font-normal">Target</th><th className="pb-2 font-normal">Context</th><th className="pb-2 font-normal">Lane</th><th className="pb-2 font-normal">Status</th></tr></thead><tbody>{modelAliases.map((model) => <tr key={model.alias} className="border-b border-[#44483a]/60 text-xs"><td className="py-3 font-mono text-[#9ddf2e]">{model.alias}</td><td className="py-3 text-[#e3e3d8]">{model.provider}<div className="mt-1 font-mono text-[9px] text-[#8f9282]">{model.account}</div></td><td className="py-3 text-[#c5c8b6]">{model.target}</td><td className="py-3 font-mono text-[#7dd3fc]">{model.context}</td><td className="py-3 text-[#c5c8b6]">{model.lane}</td><td className="py-3"><span className={`border px-2 py-1 font-mono text-[9px] uppercase ${model.status === 'ready' ? 'border-[#9ddf2e]/40 text-[#9ddf2e]' : model.status === 'watch' ? 'border-[#ffb020]/40 text-[#ffb020]' : 'border-[#44483a] text-[#c5c8b6]'}`}>{model.status}</span></td></tr>)}</tbody></table></div>
        </section>
      </div>
    </div>
  );
};
