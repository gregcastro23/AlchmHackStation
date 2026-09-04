#!/usr/bin/env bun

/**
 * ALCHM CLI — Official Command Line Interface
 * Solana Mission Control & Pentacles Ecosystem Toolchain
 */

import { printBanner, c } from '../src/cli/ui';
import { runAuthCommand } from '../src/cli/commands/auth';
import { runFaucetCommand } from '../src/cli/commands/faucet';
import { runIdlCommand } from '../src/cli/commands/idl';
import { runToken2022Command } from '../src/cli/commands/token2022';
import { runDevnetCommand } from '../src/cli/commands/devnet';
import { runStationCommand } from '../src/cli/commands/station';

const VERSION = '1.0.0';

function printHelp() {
  printBanner();
  console.log(`${c.bold('Usage:')} alchm <command> [subcommand] [options]

${c.bold('Primary Commands:')}
  ${c.brightCyan('auth')}        [check|watch]     Audit & monitor local toolchains (Solana, Anchor, Spacetime, Vercel)
  ${c.emerald('faucet')}      [test|calc|status] Run ADR-014 discriminant faucet harness or calculate yields
  ${c.azure('idl')}         [sync|generate]   Synchronize Anchor IDLs between ASOL, Pentacles & HackStation
  ${c.violet('token2022')}   [info|test|deploy] Inspect and test canonical Token-2022 extensions & mints
  ${c.amber('devnet')}      [test|amm|wave]   Execute master devnet audit suite for canonical coins
  ${c.gold('station')}     [dev|build]       Control HackStation Mission Control server & bundles

${c.bold('General Options:')}
  ${c.dim('-v, --version')}                   Show current CLI version
  ${c.dim('-h, --help')}                      Display this command manual
  ${c.dim('-j, --json')}                      Format probe or simulation output as JSON

${c.bold('Quick Examples:')}
  ${c.dim('$')} alchm auth check              ${c.dim('# Audit all CLI toolchains & keypairs')}
  ${c.dim('$')} alchm faucet test             ${c.dim('# Run 10-point ADR-014 specification harness')}
  ${c.dim('$')} alchm faucet calc --fire 5    ${c.dim('# Simulate daily yield under fire transit sky')}
  ${c.dim('$')} alchm idl sync                ${c.dim('# Pull latest IDL schemas across repositories')}
  ${c.dim('$')} alchm devnet test             ${c.dim('# Run full canonical coin test suite')}
  ${c.dim('$')} alchm station dev             ${c.dim('# Start HackStation local development server')}
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  const subArgs = args.slice(1);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === 'version' || command === '--version' || command === '-v') {
    console.log(`alchm CLI v${VERSION} (protocol: AlchmAgentsSolana / Pentacles)`);
    return;
  }

  switch (command) {
    case 'auth':
      await runAuthCommand(subArgs);
      break;

    case 'faucet':
      await runFaucetCommand(subArgs);
      break;

    case 'idl':
      await runIdlCommand(subArgs);
      break;

    case 'token2022':
    case 'token':
    case 'tokens':
      await runToken2022Command(subArgs);
      break;

    case 'devnet':
    case 'dev':
      if (subArgs[0] === 'station' || command === 'dev' && subArgs.length === 0) {
        await runStationCommand(['dev', ...subArgs]);
      } else {
        await runDevnetCommand(subArgs);
      }
      break;

    case 'station':
      await runStationCommand(subArgs);
      break;

    default:
      console.error(c.red(`Unknown command: "${command}"`));
      console.log(c.dim('Run `alchm --help` to see all available commands.'));
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(c.red('\n[ALCHM CLI FATAL ERROR]'), err);
  process.exit(1);
});
