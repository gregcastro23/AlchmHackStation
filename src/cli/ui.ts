/**
 * Terminal UI & Styling Engine for Alchm CLI
 * Provides zero-dependency ANSI color styling, custom boxes, badges, and progress feedback.
 */

export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Foreground
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Bright / 256
  brightCyan: '\x1b[96m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightRed: '\x1b[91m',
  brightMagenta: '\x1b[95m',
  brightWhite: '\x1b[97m',
  gray: '\x1b[90m',

  // Hex-like alchemical accents
  amber: '\x1b[38;5;214m',
  violet: '\x1b[38;5;141m',
  emerald: '\x1b[38;5;42m',
  gold: '\x1b[38;5;220m',
  azure: '\x1b[38;5;75m',
  crimson: '\x1b[38;5;197m',
};

export const c = {
  bold: (s: string | number) => `${colors.bold}${s}${colors.reset}`,
  dim: (s: string | number) => `${colors.dim}${s}${colors.reset}`,
  cyan: (s: string | number) => `${colors.cyan}${s}${colors.reset}`,
  brightCyan: (s: string | number) => `${colors.brightCyan}${s}${colors.reset}`,
  emerald: (s: string | number) => `${colors.emerald}${s}${colors.reset}`,
  green: (s: string | number) => `${colors.green}${s}${colors.reset}`,
  amber: (s: string | number) => `${colors.amber}${s}${colors.reset}`,
  yellow: (s: string | number) => `${colors.yellow}${s}${colors.reset}`,
  red: (s: string | number) => `${colors.red}${s}${colors.reset}`,
  crimson: (s: string | number) => `${colors.crimson}${s}${colors.reset}`,
  violet: (s: string | number) => `${colors.violet}${s}${colors.reset}`,
  gold: (s: string | number) => `${colors.gold}${s}${colors.reset}`,
  azure: (s: string | number) => `${colors.azure}${s}${colors.reset}`,
  gray: (s: string | number) => `${colors.gray}${s}${colors.reset}`,
};

export const tokens = {
  spirit: `${c.crimson('🝇 SPIRIT')} ${c.dim('(Fire)')}`,
  essence: `${c.azure('🝑 ESSENCE')} ${c.dim('(Water)')}`,
  matter: `${c.emerald('🝙 MATTER')} ${c.dim('(Earth)')}`,
  substance: `${c.gold('🝉 SUBSTANCE')} ${c.dim('(Air)')}`,
};

export const badges = {
  pass: `${colors.emerald}[PASS]${colors.reset}`,
  fail: `${colors.crimson}[FAIL]${colors.reset}`,
  healthy: `${colors.emerald}[HEALTHY]${colors.reset}`,
  attention: `${colors.amber}[ATTENTION]${colors.reset}`,
  unavailable: `${colors.gray}[UNAVAILABLE]${colors.reset}`,
  info: `${colors.azure}[INFO]${colors.reset}`,
  warn: `${colors.yellow}[WARN]${colors.reset}`,
  active: `${colors.brightCyan}[ACTIVE]${colors.reset}`,
};

export function printBanner(subtitle = 'Solana Mission Control & Pentacles Toolchain') {
  console.log(`
${c.azure('   █████╗ ██╗      ██████╗██╗  ██╗███╗   ███╗')}
${c.cyan('  ██╔══██╗██║     ██╔════╝██║  ██║████╗ ████║')}
${c.brightCyan('  ███████║██║     ██║     ███████║██╔████╔██║')}
${c.emerald('  ██╔══██║██║     ██║     ██╔══██║██║╚██╔╝██║')}
${c.gold('  ██║  ██║███████╗╚██████╗██║  ██║██║ ╚═╝ ██║')}  ${c.dim('v1.0.0')}
${c.dim('  ╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝')}
  ${c.amber(subtitle)}
  ${c.dim('Canonical Elements:')} ${tokens.spirit} · ${tokens.essence} · ${tokens.matter} · ${tokens.substance}
`);
}

export function printBox(title: string, lines: string[], accent = colors.brightCyan) {
  const stripAnsi = (str: string) => str.replace(/\x1b\[[0-9;]*m/g, '');
  const unstyledTitle = stripAnsi(title);
  const unstyledLines = lines.map(stripAnsi);
  const maxLen = Math.max(unstyledTitle.length + 4, ...unstyledLines.map((l) => l.length), 50);

  const top = `${accent}╔═ ${c.bold(title)} ${'═'.repeat(Math.max(0, maxLen - unstyledTitle.length - 3))}╗${colors.reset}`;
  const bottom = `${accent}╚${'═'.repeat(maxLen + 2)}╝${colors.reset}`;

  console.log(top);
  for (let i = 0; i < lines.length; i++) {
    const rawLen = unstyledLines[i].length;
    const padding = ' '.repeat(Math.max(0, maxLen - rawLen));
    console.log(`${accent}║${colors.reset} ${lines[i]}${padding} ${accent}║${colors.reset}`);
  }
  console.log(bottom);
}

export function printTable(headers: string[], rows: string[][]) {
  const stripAnsi = (str: string) => str.replace(/\x1b\[[0-9;]*m/g, '');
  const colWidths = headers.map((h, i) => {
    const maxRow = Math.max(...rows.map((r) => stripAnsi(r[i] || '').length), 0);
    return Math.max(stripAnsi(h).length, maxRow);
  });

  const formatRow = (cols: string[], isHeader = false) => {
    return cols
      .map((col, i) => {
        const unstyled = stripAnsi(col);
        const pad = ' '.repeat(Math.max(0, colWidths[i] - unstyled.length));
        return isHeader ? c.bold(col) + pad : col + pad;
      })
      .join(c.gray(' │ '));
  };

  const separator = colWidths.map((w) => '─'.repeat(w)).join(c.gray('─┼─'));

  console.log(formatRow(headers, true));
  console.log(c.gray(separator));
  for (const row of rows) {
    console.log(formatRow(row));
  }
}
