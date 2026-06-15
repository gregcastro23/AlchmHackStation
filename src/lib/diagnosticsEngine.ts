export interface DiagnosticIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'security' | 'performance' | 'coverage' | 'git';
  message: string;
  recommendation: string;
}

export interface DiagnosticReport {
  score: number;
  categories: {
    security: number;
    performance: number;
    coverage: number;
    git: number;
  };
  weakPoints: DiagnosticIssue[];
}

export function runDiagnostics(
  track: string,
  completedTasks: string[],
  repos: string[],
  biometricEnrolled: boolean
): DiagnosticReport {
  let security = 100;
  let performance = 100;
  let git = 100;
  
  const weakPoints: DiagnosticIssue[] = [];

  // 1. Evaluate Git Health
  if (repos.length === 0) {
    git = 20;
    weakPoints.push({
      id: 'git_missing',
      severity: 'warning',
      category: 'git',
      message: 'No GitHub repositories bound to this workstation project.',
      recommendation: 'Link at least one GitHub remote repository in the Active Workstation panel.'
    });
  } else if (repos.length === 1) {
    git = 85;
    weakPoints.push({
      id: 'git_single',
      severity: 'info',
      category: 'git',
      message: 'Single remote repository layout detected.',
      recommendation: 'Consider configuring backup mirrors or multi-remote sync in Tauri settings.'
    });
  }

  // 2. Evaluate Security
  if (!biometricEnrolled) {
    security -= 10;
    weakPoints.push({
      id: 'sec_biometric',
      severity: 'info',
      category: 'security',
      message: 'Biometric space locking guardrails not enrolled.',
      recommendation: 'Navigate to Security Protocols and bind this laptop\'s platform Touch ID.'
    });
  }

  // Template-based security rules
  if (track === 'from-scratch') {
    // Check old Pentacles/SpaceTimeDB checklist details
    if (!completedTasks.includes('rebill_fix')) {
      security -= 25;
      weakPoints.push({
        id: 'sec_rebill',
        severity: 'critical',
        category: 'security',
        message: 'Potential Oracle re-billing infinite loop on failed API errors.',
        recommendation: 'Hardcode max retries or verify EIP-712 billing rates inside server/oracle_fees.rs.'
      });
    }
    if (!completedTasks.includes('prompt_cache')) {
      security -= 10;
      weakPoints.push({
        id: 'sec_prompt_cache',
        severity: 'warning',
        category: 'security',
        message: 'Oracle system prompt cache size not verified (>4096 tokens).',
        recommendation: 'Align prompt structure to Haiku 4.5 boundaries to prevent cached-state bypass.'
      });
    }
  } else if (track === 'extend-open-source') {
    if (!completedTasks.includes('ext_auth')) {
      security -= 30;
      weakPoints.push({
        id: 'sec_ext_auth',
        severity: 'critical',
        category: 'security',
        message: 'Authentication and signature validation gates not fully integrated.',
        recommendation: 'Ensure EIP-3009 transfer authorizations are fully verified by the security middleware.'
      });
    }
    if (!completedTasks.includes('ext_verify')) {
      security -= 15;
      weakPoints.push({
        id: 'sec_ext_verify',
        severity: 'warning',
        category: 'security',
        message: 'Local secret environment variables (.env) unchecked.',
        recommendation: 'Run environment sync audits or verify .env integrity via CLI check.'
      });
    }
  } else if (track === 'ship-a-feature') {
    if (!completedTasks.includes('feat_logic')) {
      security -= 25;
      weakPoints.push({
        id: 'sec_feat_logic',
        severity: 'critical',
        category: 'security',
        message: 'Core business validation logic and permission scopes missing.',
        recommendation: 'Write owner-gated checks for all state updates in the feature handler.'
      });
    }
  }

  // 3. Evaluate Performance
  if (track === 'from-scratch') {
    if (!completedTasks.includes('btree_index')) {
      performance -= 35;
      weakPoints.push({
        id: 'perf_btree',
        severity: 'critical',
        category: 'performance',
        message: 'O(N) full-table scans on card.owner table causing severe query latency.',
        recommendation: 'Implement targeted Btree indexes on card.owner and trade.partner columns.'
      });
    }
    if (!completedTasks.includes('prune_tables')) {
      performance -= 15;
      weakPoints.push({
        id: 'perf_prune',
        severity: 'warning',
        category: 'performance',
        message: 'Unpruned historical logs inside battle and request tables.',
        recommendation: 'Deploy a scheduled cron tick to prune records older than 7 days.'
      });
    }
  } else if (track === 'extend-open-source') {
    if (!completedTasks.includes('ext_bridge')) {
      performance -= 25;
      weakPoints.push({
        id: 'perf_bridge',
        severity: 'warning',
        category: 'performance',
        message: 'Integration bridge adapter lacks latency-cache layers.',
        recommendation: 'Enable local storage caching or memory-indexing to avoid duplicate RPC calls.'
      });
    }
  } else if (track === 'ship-a-feature') {
    if (!completedTasks.includes('feat_state')) {
      performance -= 20;
      weakPoints.push({
        id: 'perf_state',
        severity: 'warning',
        category: 'performance',
        message: 'Feature data stores unlinked from main application garbage collector.',
        recommendation: 'Verify cleanup callbacks on component unmount to prevent React memory leaks.'
      });
    }
  }

  // 4. Evaluate Checklist Coverage
  // If track is from-scratch and has 8 default tasks, count how many tasks are completed.
  // We compute it dynamically.
  let totalTasks = 6; // base tasks count
  if (track === 'from-scratch') totalTasks = 8; // Pentacles default checklist size
  const completedCount = completedTasks.length;
  let coverage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 100;
  coverage = Math.min(100, Math.max(0, coverage));

  if (coverage < 40) {
    weakPoints.push({
      id: 'cov_low',
      severity: 'warning',
      category: 'coverage',
      message: 'Extremely low workflow task completion rate.',
      recommendation: 'Execute and resolve pending tasks in the workstation checklist panel.'
    });
  } else if (coverage < 80) {
    weakPoints.push({
      id: 'cov_mid',
      severity: 'info',
      category: 'coverage',
      message: 'Workspace tasks are partially completed.',
      recommendation: 'Complete outstanding verification and build preparation checklist items.'
    });
  }

  // Normalise individual scores to be positive
  security = Math.max(0, security);
  performance = Math.max(0, performance);
  git = Math.max(0, git);

  // 5. Calculate Overall Score (Weighted Average)
  const score = Math.round(security * 0.35 + performance * 0.30 + coverage * 0.20 + git * 0.15);

  return {
    score,
    categories: {
      security,
      performance,
      coverage,
      git
    },
    weakPoints
  };
}
