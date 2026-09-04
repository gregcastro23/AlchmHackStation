import { spawn } from 'child_process';
import { join } from 'path';
import { c, tokens, printBox, printTable } from '../ui';
import {
  computeDiscriminantDailyYield,
  type TransitSkyData,
  type GlobalSupplyState,
  type NatalChartData,
} from '../../lib/discriminantFaucet';

const rootDir = join(import.meta.dirname, '../../..');

// Default Live Global Supply State (matches alchm.kitchen)
const LIVE_SUPPLY: GlobalSupplyState = {
  spirit: 10583.22,
  essence: 15780.23,
  matter: 29116.87,
  substance: 22133.85,
};

export async function runFaucetCommand(args: string[]): Promise<void> {
  const sub = args[0] || 'help';

  if (sub === 'test') {
    console.log(c.azure('Executing ADR-014 Chart-Ratio Discriminant Faucet Specification Harness...\n'));
    const proc = spawn('bun', [join(rootDir, 'scripts/test_discriminant_faucet.ts')], {
      stdio: 'inherit',
      cwd: rootDir,
    });
    return new Promise((resolve) => {
      proc.on('close', (code) => {
        if (code !== 0) process.exit(code || 1);
        resolve();
      });
    });
  }

  if (sub === 'supply' || sub === 'status') {
    const total = LIVE_SUPPLY.spirit + LIVE_SUPPLY.essence + LIVE_SUPPLY.matter + LIVE_SUPPLY.substance;
    const headers = ['Canonical Token', 'Symbol', 'Live Circulating', 'Global Share', 'Anti-Glut Status'];
    const rows = [
      [
        c.bold('SPIRIT'),
        '🝇',
        LIVE_SUPPLY.spirit.toLocaleString(),
        `${((LIVE_SUPPLY.spirit / total) * 100).toFixed(2)}%`,
        c.green('Normal (1.0x)'),
      ],
      [
        c.bold('ESSENCE'),
        '🝑',
        LIVE_SUPPLY.essence.toLocaleString(),
        `${((LIVE_SUPPLY.essence / total) * 100).toFixed(2)}%`,
        c.green('Normal (1.0x)'),
      ],
      [
        c.bold('MATTER'),
        '🝙',
        LIVE_SUPPLY.matter.toLocaleString(),
        `${((LIVE_SUPPLY.matter / total) * 100).toFixed(2)}%`,
        c.amber('Damped (0.75x — >30% supply)'),
      ],
      [
        c.bold('SUBSTANCE'),
        '🝉',
        LIVE_SUPPLY.substance.toLocaleString(),
        `${((LIVE_SUPPLY.substance / total) * 100).toFixed(2)}%`,
        c.green('Normal (1.0x)'),
      ],
    ];

    console.log(c.bold('\n🌌 Canonical Token Global Circulating Supply:'));
    printTable(headers, rows);
    console.log('');
    printBox(
      'ADR-014 Protocol Invariants',
      [
        'Universal Daily Grant:   12.0000 Tokens (Strictly Conserved)',
        'Anti-Glut Damping:       0.75x multiplier if supply share > 30%',
        'Canonical Tokens:        SPIRIT (Fire) · ESSENCE (Water) · MATTER (Earth) · SUBSTANCE (Air)',
      ],
      '\x1b[38;5;42m'
    );
    return;
  }

  if (sub === 'calc' || sub === 'simulate') {
    // Parse element inputs if provided, e.g. --fire 5 --water 2 --earth 1 --air 2
    let fire = 2.5;
    let water = 2.5;
    let earth = 2.5;
    let air = 2.5;

    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--fire' && args[i + 1]) fire = parseFloat(args[i + 1]);
      if (args[i] === '--water' && args[i + 1]) water = parseFloat(args[i + 1]);
      if (args[i] === '--earth' && args[i + 1]) earth = parseFloat(args[i + 1]);
      if (args[i] === '--air' && args[i + 1]) air = parseFloat(args[i + 1]);
    }

    const transitSky: TransitSkyData = {
      elementWeights: { Fire: fire, Water: water, Earth: earth, Air: air },
    };

    // Check for natal chart flags
    let natalChart: NatalChartData | null = null;
    const natalIdx = args.indexOf('--natal');
    if (natalIdx !== -1) {
      natalChart = {
        spiritScore: 38,
        essenceScore: 16,
        matterScore: 12,
        substanceScore: 20,
      };
    }

    const result = computeDiscriminantDailyYield(natalChart, transitSky, LIVE_SUPPLY);

    console.log(c.bold('\n⚖️ Daily Faucet Yield Simulation Result:'));
    console.log(
      c.dim(`Transit Sky Weights: Fire ${fire} · Water ${water} · Earth ${earth} · Air ${air}`) +
        (natalChart ? c.dim(' (Natal chart affinity enabled)') : c.dim(' (Neutral claimer)'))
    );
    console.log('');

    const headers = ['Token', 'Element', 'Daily Mint Amount', 'Natal Affinity', 'Transit Weight', 'Damping Factor'];
    const rows = [
      [
        tokens.spirit,
        'Fire (🜂)',
        c.bold(c.crimson(`${result.spirit.toFixed(4)}`)),
        `${((result.breakdown.spirit.natalAffinity ?? 0.25) * 100).toFixed(1)}%`,
        `${((result.breakdown.spirit.skyDominance ?? 0.25) * 100).toFixed(1)}%`,
        `${result.breakdown.spirit.antiGlutFactor.toFixed(2)}x`,
      ],
      [
        tokens.essence,
        'Water (🜄)',
        c.bold(c.azure(`${result.essence.toFixed(4)}`)),
        `${((result.breakdown.essence.natalAffinity ?? 0.25) * 100).toFixed(1)}%`,
        `${((result.breakdown.essence.skyDominance ?? 0.25) * 100).toFixed(1)}%`,
        `${result.breakdown.essence.antiGlutFactor.toFixed(2)}x`,
      ],
      [
        tokens.matter,
        'Earth (🜃)',
        c.bold(c.emerald(`${result.matter.toFixed(4)}`)),
        `${((result.breakdown.matter.natalAffinity ?? 0.25) * 100).toFixed(1)}%`,
        `${((result.breakdown.matter.skyDominance ?? 0.25) * 100).toFixed(1)}%`,
        `${result.breakdown.matter.antiGlutFactor.toFixed(2)}x`,
      ],
      [
        tokens.substance,
        'Air (🜁)',
        c.bold(c.gold(`${result.substance.toFixed(4)}`)),
        `${((result.breakdown.substance.natalAffinity ?? 0.25) * 100).toFixed(1)}%`,
        `${((result.breakdown.substance.skyDominance ?? 0.25) * 100).toFixed(1)}%`,
        `${result.breakdown.substance.antiGlutFactor.toFixed(2)}x`,
      ],
    ];

    printTable(headers, rows);
    console.log('');

    const isConserved = Math.abs(result.total - 12.0) < 0.0001;
    printBox(
      'Conservation Proof',
      [
        `Total Daily Yield:       ${c.bold(result.total.toFixed(4))} ESMS Tokens`,
        `Conservation Invariant:  ${isConserved ? c.green('VERIFIED (strictly 12.0000)') : c.red('VIOLATED')}`,
        `Anti-Glut Conservation:  Matter damping redistributes excess to un-glutted elements`,
      ],
      isConserved ? '\x1b[38;5;42m' : '\x1b[38;5;197m'
    );
    return;
  }

  // Help
  console.log(`
${c.bold('Usage:')} alchm faucet <subcommand> [options]

${c.bold('Subcommands:')}
  ${c.cyan('test')}               Run the 10-point ADR-014 faucet specification test harness
  ${c.cyan('status, supply')}     Display current circulating supply & anti-glut dampening state
  ${c.cyan('calc, simulate')}     Simulate daily yield under specific transit sky & chart weights
                     Options: --fire <n> --water <n> --earth <n> --air <n> [--natal]

${c.bold('Examples:')}
  alchm faucet test
  alchm faucet supply
  alchm faucet calc --fire 6 --water 1 --earth 1 --air 2
  alchm faucet calc --natal
`);
}
