import { defineConfig } from 'vite';
import type { Plugin, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

// Whitelisted command prefixes for Solana Mission Control
const ALLOWED_COMMAND_PREFIXES = [
  'cargo build-sbf',
  'cargo test',
  'solana-test-validator',
  'solana',
  'anchor',
  'bun scripts/',
  'bun run generate',
  'bun run sync:idl',
  'lsof -i',
  'lsof -ti:',
  'spacetime',
];

// Strict Cross-Repository Whitelisted Roots
const ALLOWED_PROJECT_ROOTS = [
  path.resolve(process.cwd()), // AlchmHackStation
  path.resolve(process.cwd(), '../AlchmAgentsSolana/target/idl'), // ASOL compiled IDLs
  path.resolve(process.cwd(), '../Spacetimedbhackathon/Pentacles'), // Pentacles client & engine
];

function isPathWhitelisted(targetPath: string): boolean {
  const resolved = path.resolve(targetPath);
  return ALLOWED_PROJECT_ROOTS.some(
    (allowedRoot) => resolved === allowedRoot || resolved.startsWith(allowedRoot + path.sep)
  );
}

function isCommandWhitelisted(cmd: string): boolean {
  const trimmed = cmd.trim();
  return ALLOWED_COMMAND_PREFIXES.some((prefix) => trimmed === prefix || trimmed.startsWith(prefix + ' ') || trimmed.startsWith(prefix));
}

export interface SyncIdlResult {
  syncedFiles: string[];
  destinations: string[];
  timestamp: string;
}

export async function syncIdlFiles(): Promise<SyncIdlResult> {
  const asolIdlDir = path.resolve(process.cwd(), '../AlchmAgentsSolana/target/idl');
  const hackStationIdlDir = path.resolve(process.cwd(), 'src/idl');
  const pentaclesIdlDir = path.resolve(process.cwd(), '../Spacetimedbhackathon/Pentacles/src/idl');
  const pentaclesTargetIdlDir = path.resolve(process.cwd(), '../Spacetimedbhackathon/Pentacles/target/idl');

  await fs.mkdir(hackStationIdlDir, { recursive: true });
  await fs.mkdir(pentaclesIdlDir, { recursive: true });
  await fs.mkdir(pentaclesTargetIdlDir, { recursive: true });

  const syncedFiles: string[] = [];

  // 1. Sync from ASOL build output if present
  try {
    const entries = await fs.readdir(asolIdlDir);
    const jsonFiles = entries.filter((f) => f.endsWith('.json'));

    for (const file of jsonFiles) {
      const srcPath = path.join(asolIdlDir, file);
      const content = await fs.readFile(srcPath, 'utf-8');

      // Distribute to HackStation and Pentacles
      await fs.writeFile(path.join(hackStationIdlDir, file), content, 'utf-8');
      await fs.writeFile(path.join(pentaclesIdlDir, file), content, 'utf-8');
      await fs.writeFile(path.join(pentaclesTargetIdlDir, file), content, 'utf-8');

      syncedFiles.push(file);
    }
  } catch {
    // ASOL directory may not be compiled yet; fallback to local IDLs
  }

  // 2. Distribute HackStation canonical IDLs to Pentacles
  const canonicalIdls = ['alchm_staking_vaults.json', 'token2022_transfer_hook.json'];
  for (const idl of canonicalIdls) {
    const localPath = path.join(hackStationIdlDir, idl);
    try {
      const content = await fs.readFile(localPath, 'utf-8');
      await fs.writeFile(path.join(pentaclesIdlDir, idl), content, 'utf-8');
      await fs.writeFile(path.join(pentaclesTargetIdlDir, idl), content, 'utf-8');
      if (!syncedFiles.includes(idl)) {
        syncedFiles.push(idl);
      }
    } catch {
      // Ignore if local IDL is absent
    }
  }

  return {
    syncedFiles,
    destinations: [hackStationIdlDir, pentaclesIdlDir, pentaclesTargetIdlDir],
    timestamp: new Date().toISOString(),
  };
}

const alchmBackendPlugin = (): Plugin => ({
  name: 'alchm-backend-plugin',
  configureServer(server: ViteDevServer) {
    // Watch ASOL IDL directory for cargo build-sbf updates
    const asolIdlDir = path.resolve(process.cwd(), '../AlchmAgentsSolana/target/idl');
    server.watcher.add(asolIdlDir);

    server.watcher.on('all', async (event, changedPath) => {
      if (changedPath.endsWith('.json') && changedPath.startsWith(asolIdlDir)) {
        server.config.logger.info(`[ALCHM IDL WATCHER] Event '${event}' on ${path.basename(changedPath)}. Synchronizing IDLs...`, { timestamp: true });
        try {
          const syncResult = await syncIdlFiles();
          exec('bun scripts/generate_types.ts', { cwd: process.cwd() }, (error, stdout) => {
            if (error) {
              server.config.logger.error(`[ALCHM IDL WATCHER] Type generation error: ${error.message}`);
            } else {
              server.config.logger.info(`[ALCHM IDL WATCHER] Types successfully generated in src/types/hackstation.ts`);
            }
            server.ws.send({
              type: 'custom',
              event: 'alchm:idl-updated',
              data: { ...syncResult, stdout: stdout.trim() },
            });
          });
        } catch (err) {
          server.config.logger.error(`[ALCHM IDL WATCHER] IDL sync error: ${err}`);
        }
      }
    });

    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      // 1. Hardened /api/exec middleware
      if (req.url === '/api/exec' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { command, cwd } = JSON.parse(body);
            if (!command || typeof command !== 'string') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Command string is required' }));
              return;
            }

            if (!isCommandWhitelisted(command)) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                error: `Command '${command.slice(0, 50)}' prohibited by Solana Mission Control security policy. Allowed commands: cargo build-sbf, solana-test-validator, solana, anchor, bun scripts/*, bun run generate, lsof, spacetime`,
                stdout: '',
                stderr: 'Security Policy Violation: Command not whitelisted.'
              }));
              return;
            }

            const execCwd = cwd ? path.resolve(process.cwd(), cwd) : process.cwd();
            if (!isPathWhitelisted(execCwd)) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Access denied: execution cwd outside whitelisted project roots.' }));
              return;
            }

            exec(command, { cwd: execCwd, maxBuffer: 1024 * 1024 * 4 }, (error, stdout, stderr) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error?.message || null, stdout, stderr }));
            });
          } catch {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid payload' }));
          }
        });
        return;
      }

      // 2. Cross-Repository IDL Sync Endpoint (/api/sync-idl or /api/fs action: 'sync-idl')
      if ((req.url === '/api/sync-idl' && req.method === 'POST') || (req.url?.startsWith('/api/fs') && req.method === 'POST')) {
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const payload = body ? JSON.parse(body) : {};
            const action = payload.action || (req.url === '/api/sync-idl' ? 'sync-idl' : 'write');

            // Handle IDL Synchronization
            if (action === 'sync-idl') {
              const syncResult = await syncIdlFiles();
              exec('bun scripts/generate_types.ts', { cwd: process.cwd() }, (error, stdout, stderr) => {
                server.ws.send({
                  type: 'custom',
                  event: 'alchm:idl-updated',
                  data: { ...syncResult, stdout: stdout.trim() },
                });
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: !error,
                  ...syncResult,
                  typeGen: { stdout: stdout.trim(), stderr: stderr.trim(), error: error?.message || null }
                }));
              });
              return;
            }

            const { filePath, content } = payload;
            if (!filePath || typeof filePath !== 'string') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'filePath is required' }));
              return;
            }

            const fullPath = path.resolve(process.cwd(), filePath);
            // Verify path against strict cross-repository whitelist
            if (!isPathWhitelisted(fullPath)) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Access denied: path outside whitelisted project roots.' }));
              return;
            }

            if (action === 'read') {
              const fileContent = await fs.readFile(fullPath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, content: fileContent }));
              return;
            }

            // Default: write
            await fs.mkdir(path.dirname(fullPath), { recursive: true });
            await fs.writeFile(fullPath, content || '', 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, filePath, bytesWritten: (content || '').length }));
          } catch (error) {
            res.statusCode = 500;
            const message = error instanceof Error ? error.message : 'Unknown file system error';
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: message }));
          }
        });
        return;
      }

      // 3. Arweave Metadata Provider (/api/arweave-metadata)
      if (req.url?.startsWith('/api/arweave-metadata')) {
        try {
          const parsedUrl = new URL(req.url, 'http://localhost');
          const uri = parsedUrl.searchParams.get('uri') || '';
          const symbol = parsedUrl.searchParams.get('symbol') || '';

          // Check for specific URI matches or extract manifests
          if (uri.includes('Spirit') || uri.includes('Ignis') || symbol.toUpperCase() === 'SPIRIT' || symbol.toUpperCase() === 'IGNIS' || uri.includes('qR8v7')) {
            const manifest = {
              name: 'Spirit',
              symbol: 'SPIRIT',
              description: 'Elemental Spirit token of the Alchm protocol representing the Fire axis (Sun / Volatile). Governs projective dynamic energy, creative initiative, and JEPA latent persona drive vectors.',
              image: '/tokens/spirit.svg',
              external_url: 'https://alchmagents.com/metadata/spirit.json',
              attributes: [
                { trait_type: 'Element', value: 'Fire' },
                { trait_type: 'Decimals', value: 4 },
                { trait_type: 'Soulbound', value: 'Non-Transferable' },
                { trait_type: 'BurnAuthority', value: 'Permissioned' },
                { trait_type: 'Extension', value: 'TransferHook' },
                { trait_type: 'Extension', value: 'MetadataPointer' },
                { trait_type: 'Kinetic Fee Basis Points', value: 150 },
                { trait_type: 'Kinetic Fee Percent', value: '1.5%' },
                { trait_type: 'Hook Authority', value: 'Hook1gNisFeeResoLver111111111111111111111111' },
                { trait_type: 'PDA Derivation Seed', value: 'extra-account-metas' },
                { trait_type: 'Pinned Devnet PDA', value: 'K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ' },
              ],
              properties: {
                category: 'elemental_reagent',
                files: [{ uri: '/tokens/spirit.svg', type: 'image/svg+xml' }],
                creators: [{ address: 'AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5', share: 100 }],
                extensions: {
                  types: ['TransferHook', 'MetadataPointer', 'TransferFeeConfig'],
                  transferFeeBasisPoints: 150,
                  maxFee: 5000000,
                  hookProgramId: 'Hook1gNisFeeResoLver111111111111111111111111',
                },
              },
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(manifest, null, 2));
            return;
          }

          if (uri.includes('Essence') || uri.includes('Aqua') || symbol.toUpperCase() === 'ESSENCE' || symbol.toUpperCase() === 'AQUA' || uri.includes('wT2x9')) {
            const manifest = {
              name: 'Essence',
              symbol: 'ESSENCE',
              description: 'Elemental Essence token of the Alchm protocol representing the Water axis (Moon / Dissolution). Governs receptive emotional resonance, subconscious integration, and JEPA latent persona attunement vectors.',
              image: '/tokens/essence.svg',
              external_url: 'https://alchmagents.com/metadata/essence.json',
              attributes: [
                { trait_type: 'Element', value: 'Water' },
                { trait_type: 'Decimals', value: 4 },
                { trait_type: 'Soulbound', value: 'Non-Transferable' },
                { trait_type: 'BurnAuthority', value: 'Permissioned' },
                { trait_type: 'Extension', value: 'ConfidentialTransfers' },
                { trait_type: 'Extension', value: 'MetadataPointer' },
                { trait_type: 'Encryption Mode', value: 'Twisted ElGamal 64-bit' },
                { trait_type: 'Proof System', value: 'Bulletproofs ZK Sigma' },
                { trait_type: 'Pinned Devnet PDA', value: '3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf' },
              ],
              properties: {
                category: 'elemental_reagent',
                files: [{ uri: '/tokens/essence.svg', type: 'image/svg+xml' }],
                creators: [{ address: 'AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5', share: 100 }],
                extensions: {
                  types: ['ConfidentialTransfers', 'MetadataPointer'],
                  autoApproveNewAccounts: false,
                },
              },
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(manifest, null, 2));
            return;
          }

          if (uri.includes('Matter') || uri.includes('Terra') || symbol.toUpperCase() === 'MATTER' || symbol.toUpperCase() === 'TERRA' || uri.includes('eM4k1')) {
            const manifest = {
              name: 'Matter',
              symbol: 'MATTER',
              description: 'Elemental Matter token of the Alchm protocol representing the Earth axis (Saturn / Coagulation). Governs structural stability, systematic execution, and JEPA latent persona discipline vectors.',
              image: '/tokens/matter.svg',
              external_url: 'https://alchmagents.com/metadata/matter.json',
              attributes: [
                { trait_type: 'Element', value: 'Earth' },
                { trait_type: 'Decimals', value: 4 },
                { trait_type: 'Soulbound', value: 'Non-Transferable' },
                { trait_type: 'BurnAuthority', value: 'Permissioned' },
                { trait_type: 'Extension', value: 'NonTransferable' },
                { trait_type: 'Extension', value: 'MetadataPointer' },
                { trait_type: 'Transferability', value: 'Soulbound (Non-Transferable)' },
                { trait_type: 'Star Vault Anchor', value: 'star-vault' },
                { trait_type: 'Pinned Devnet PDA', value: '7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4' },
              ],
              properties: {
                category: 'credential',
                files: [{ uri: '/tokens/matter.svg', type: 'image/svg+xml' }],
                creators: [{ address: 'AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5', share: 100 }],
                extensions: {
                  types: ['NonTransferable', 'MetadataPointer'],
                  soulbound: true,
                },
              },
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(manifest, null, 2));
            return;
          }

          if (uri.includes('Substance') || uri.includes('Aether') || symbol.toUpperCase() === 'SUBSTANCE' || symbol.toUpperCase() === 'AETH' || uri.includes('aL9p4')) {
            const manifest = {
              name: 'Substance',
              symbol: 'SUBSTANCE',
              description: 'Elemental Substance token of the Alchm protocol representing the Air axis (Mercury / Sublimation). Governs dialectic agility, intellectual framing, and JEPA latent persona reasoning vectors.',
              image: '/tokens/substance.svg',
              external_url: 'https://alchmagents.com/metadata/substance.json',
              attributes: [
                { trait_type: 'Element', value: 'Air' },
                { trait_type: 'Decimals', value: 4 },
                { trait_type: 'Soulbound', value: 'Non-Transferable' },
                { trait_type: 'BurnAuthority', value: 'Permissioned' },
                { trait_type: 'Extension', value: 'PermanentDelegate' },
                { trait_type: 'Extension', value: 'InterestBearingConfig' },
                { trait_type: 'Extension', value: 'MetadataPointer' },
                { trait_type: 'Base APY', value: '18.2%' },
                { trait_type: 'Rate Basis Points', value: 1820 },
                { trait_type: 'State Reconciliation Engine', value: 'SpacetimeDB Cloud (cookingwithcastrollc)' },
                { trait_type: 'Pinned Devnet PDA', value: '6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa' },
              ],
              properties: {
                category: 'matrix',
                files: [{ uri: '/tokens/substance.svg', type: 'image/svg+xml' }],
                creators: [{ address: 'AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5', share: 100 }],
                extensions: {
                  types: ['PermanentDelegate', 'InterestBearingConfig', 'MetadataPointer'],
                  rateBasisPoints: 1820,
                },
              },
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(manifest, null, 2));
            return;
          }

          // Fallback: return general registry status
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'ok',
            availableElements: ['SPIRIT', 'ESSENCE', 'MATTER', 'SUBSTANCE'],
            uriQuery: uri,
            symbolQuery: symbol,
          }));
          return;
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Arweave metadata resolution error' }));
          return;
        }
      }

      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    alchmBackendPlugin(),
  ],
  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: ALLOWED_PROJECT_ROOTS,
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('@solana')) return 'solana-core';
          if (id.includes('lucide-react')) return 'icons';
        },
      },
    },
  },
});

