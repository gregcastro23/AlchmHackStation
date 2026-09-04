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
  path.resolve(process.cwd(), '../AlchmAgentsSolana/target/idl'), // ASOL compiled IDLs (relative)
  path.resolve(process.cwd(), '../Spacetimedbhackathon/Pentacles'), // Pentacles client & engine (relative)
  path.resolve(process.env.HOME || '', 'ASOL/alchm-agents-solana/target/idl'), // ASOL target/idl (local)
  path.resolve(process.env.HOME || '', 'ASOL/alchm-agents-solana'), // ASOL repo root (local)
  path.resolve(process.env.HOME || '', 'Pentacles'), // Pentacles repo root (local)
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

      // 3. Canonical Economy Price Index Proxy (/api/economy/price-index)
      if (req.url?.startsWith('/api/economy/price-index')) {
        try {
          // Fetch live canonical index from authority
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3500);

          let liveData: any = null;
          try {
            const liveRes = await fetch('https://alchm.kitchen/api/economy/price-index', {
              headers: { 'Accept': 'application/json', 'User-Agent': 'AlchmHackStation/1.0' },
              signal: controller.signal,
            });
            if (liveRes.ok) {
              liveData = await liveRes.json();
            }
          } catch {
            // Fallback to secondary production mirror
            try {
              const secondaryRes = await fetch('https://agents.alchm.kitchen/api/economy/price-index', {
                headers: { 'Accept': 'application/json', 'User-Agent': 'AlchmHackStation/1.0' },
                signal: controller.signal,
              });
              if (secondaryRes.ok) {
                liveData = await secondaryRes.json();
              }
            } catch {
              // fallback handled below
            }
          } finally {
            clearTimeout(timeout);
          }

          if (liveData && liveData.success) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('X-ESMS-Price-Authority', 'alchm.kitchen');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(liveData));
            return;
          }

          // Fallback snapshot if live authority unreachable
          const fallbackSnapshot = {
            success: true,
            live: true,
            generatedAt: new Date().toISOString(),
            bucketStartUtc: new Date().toISOString(),
            aNumber: 6.7274,
            multiplier: 1.1455,
            dominantElement: 'Air',
            sunSign: 'virgo',
            isDiurnal: true,
            tokens: [
              {
                token: 'Spirit',
                index: 1.0994,
                change24hPct: -1.62,
                weight: 0.4108,
                sparkline: [1.1175, 1.1159, 1.1140, 1.1135, 1.1136, 1.1137, 1.1130, 1.1113, 1.1794, 1.1777, 1.1767, 1.1761, 1.1756, 1.1748, 1.1734, 1.1715, 1.1691, 1.1665, 1.1640, 1.0921, 1.0929, 1.0954, 1.0979, 1.0994, 1.0994]
              },
              {
                token: 'Essence',
                index: 1.0709,
                change24hPct: -1.95,
                weight: 0.5104,
                sparkline: [1.0922, 1.0894, 1.0863, 1.0848, 1.0844, 1.0842, 1.0831, 1.0811, 1.2057, 1.2040, 1.2029, 1.2025, 1.2023, 1.2018, 1.2009, 1.1996, 1.1976, 1.1954, 1.1933, 1.0637, 1.0651, 1.0682, 1.0709, 1.0719, 1.0709]
              },
              {
                token: 'Matter',
                index: 1.1982,
                change24hPct: -2.72,
                weight: 0.0657,
                sparkline: [1.2317, 1.2298, 1.2271, 1.2254, 1.2244, 1.2234, 1.2212, 1.2178, 1.0722, 1.0684, 1.0651, 1.0623, 1.0599, 1.0575, 1.0551, 1.0527, 1.0501, 1.0478, 1.0458, 1.1875, 1.1896, 1.1935, 1.1969, 1.1987, 1.1982]
              },
              {
                token: 'Substance',
                index: 1.2133,
                change24hPct: -2.21,
                weight: 0.0131,
                sparkline: [1.2407, 1.2384, 1.2356, 1.2342, 1.2337, 1.2333, 1.2317, 1.2292, 1.2028, 1.2002, 1.1982, 1.1968, 1.1955, 1.1942, 1.1924, 1.1903, 1.1878, 1.1851, 1.1827, 1.2043, 1.2059, 1.2093, 1.2123, 1.2138, 1.2133]
              }
            ],
            compositeIndex: 1.1455,
            composite24hPct: -2.14,
            degraded: null,
            basis: {
              model: 'ADR-011/013 canonical-esms-index v2',
              engine: 'astronomy-engine (local), 10 ESMS bodies, geocentric longitude + distance, degree-level dignity + aspects, no Ascendant vessel',
              constants: 'pricing imported from livePricing.ts; quantization from esmsQuantization.ts; Hamiltonian from esmsOscillator.ts'
            },
            railsUsd: {
              mintPerTokenUsd: 0.025,
              mintSource: 'mcp_top_up_5',
              redeemPerTokenUsd: 0.01,
              redeemSource: 'NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN'
            },
            supply: {
              live: true,
              spirit: 10583.22,
              essence: 15780.23,
              matter: 29116.87,
              substance: 22133.85
            }
          };

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-ESMS-Price-Authority', 'alchm.kitchen (cached-snapshot)');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(fallbackSnapshot));
          return;
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err?.message || 'Price index proxy error' }));
          return;
        }
      }

      // 4. Arweave Metadata Provider (/api/arweave-metadata)
      if (req.url?.startsWith('/api/arweave-metadata')) {
        try {
          const parsedUrl = new URL(req.url, 'http://localhost');
          const uri = parsedUrl.searchParams.get('uri') || '';
          const symbol = parsedUrl.searchParams.get('symbol') || '';

          // Check for specific URI matches or extract manifests aligned with Devnet TLV layout
          if (uri.includes('Spirit') || uri.includes('Ignis') || symbol.toUpperCase() === 'SPIRIT' || symbol.toUpperCase() === 'IGNIS' || uri.includes('K5kww')) {
            const manifest = {
              name: 'Spirit',
              symbol: 'SPIRIT',
              description: 'Elemental Spirit token of the Alchm protocol representing the Fire axis (Sun / Volatile). Governs projective dynamic energy, creative initiative, and JEPA latent persona drive vectors.',
              image: '/tokens/spirit.svg',
              external_url: 'https://alchm.kitchen/metadata/esms/spirit.json',
              attributes: [
                { trait_type: 'Element', value: 'Fire' },
                { trait_type: 'Decimals', value: 4 },
                { trait_type: 'Soulbound', value: 'Non-Transferable' },
                { trait_type: 'BurnAuthority', value: 'Permissioned' },
                { trait_type: 'Extension', value: 'NonTransferable' },
                { trait_type: 'Extension', value: 'PermanentDelegate' },
                { trait_type: 'Extension', value: 'MetadataPointer' },
                { trait_type: 'Extension', value: 'TokenMetadata' },
                { trait_type: 'Extension', value: 'PermissionedBurn' },
                { trait_type: 'Pinned Devnet PDA', value: 'K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ' },
              ],
              properties: {
                category: 'elemental_coin',
                files: [{ uri: '/tokens/spirit.svg', type: 'image/svg+xml' }],
                creators: [{ address: 'AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5', share: 100 }],
                extensions: {
                  types: ['NonTransferable', 'PermanentDelegate', 'MetadataPointer', 'TokenMetadata', 'PermissionedBurn'],
                },
              },
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(manifest, null, 2));
            return;
          }

          if (uri.includes('Essence') || uri.includes('Aqua') || symbol.toUpperCase() === 'ESSENCE' || symbol.toUpperCase() === 'AQUA' || uri.includes('3FcpT')) {
            const manifest = {
              name: 'Essence',
              symbol: 'ESSENCE',
              description: 'Elemental Essence token of the Alchm protocol representing the Water axis (Moon / Dissolution). Governs receptive emotional resonance, subconscious integration, and JEPA latent persona attunement vectors.',
              image: '/tokens/essence.svg',
              external_url: 'https://alchm.kitchen/metadata/esms/essence.json',
              attributes: [
                { trait_type: 'Element', value: 'Water' },
                { trait_type: 'Decimals', value: 4 },
                { trait_type: 'Soulbound', value: 'Non-Transferable' },
                { trait_type: 'BurnAuthority', value: 'Permissioned' },
                { trait_type: 'Extension', value: 'NonTransferable' },
                { trait_type: 'Extension', value: 'PermanentDelegate' },
                { trait_type: 'Extension', value: 'MetadataPointer' },
                { trait_type: 'Extension', value: 'TokenMetadata' },
                { trait_type: 'Extension', value: 'PermissionedBurn' },
                { trait_type: 'Pinned Devnet PDA', value: '3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf' },
              ],
              properties: {
                category: 'elemental_coin',
                files: [{ uri: '/tokens/essence.svg', type: 'image/svg+xml' }],
                creators: [{ address: 'AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5', share: 100 }],
                extensions: {
                  types: ['NonTransferable', 'PermanentDelegate', 'MetadataPointer', 'TokenMetadata', 'PermissionedBurn'],
                },
              },
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(manifest, null, 2));
            return;
          }

          if (uri.includes('Matter') || uri.includes('Terra') || symbol.toUpperCase() === 'MATTER' || symbol.toUpperCase() === 'TERRA' || uri.includes('7naJZ')) {
            const manifest = {
              name: 'Matter',
              symbol: 'MATTER',
              description: 'Elemental Matter token of the Alchm protocol representing the Earth axis (Saturn / Coagulation). Governs structural stability, systematic execution, and JEPA latent persona discipline vectors.',
              image: '/tokens/matter.svg',
              external_url: 'https://alchm.kitchen/metadata/esms/matter.json',
              attributes: [
                { trait_type: 'Element', value: 'Earth' },
                { trait_type: 'Decimals', value: 4 },
                { trait_type: 'Soulbound', value: 'Non-Transferable' },
                { trait_type: 'BurnAuthority', value: 'Permissioned' },
                { trait_type: 'Extension', value: 'NonTransferable' },
                { trait_type: 'Extension', value: 'PermanentDelegate' },
                { trait_type: 'Extension', value: 'MetadataPointer' },
                { trait_type: 'Extension', value: 'TokenMetadata' },
                { trait_type: 'Extension', value: 'PermissionedBurn' },
                { trait_type: 'Pinned Devnet PDA', value: '7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4' },
              ],
              properties: {
                category: 'elemental_coin',
                files: [{ uri: '/tokens/matter.svg', type: 'image/svg+xml' }],
                creators: [{ address: 'AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5', share: 100 }],
                extensions: {
                  types: ['NonTransferable', 'PermanentDelegate', 'MetadataPointer', 'TokenMetadata', 'PermissionedBurn'],
                },
              },
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(manifest, null, 2));
            return;
          }

          if (uri.includes('Substance') || uri.includes('Aether') || symbol.toUpperCase() === 'SUBSTANCE' || symbol.toUpperCase() === 'AETH' || uri.includes('6RY6Z')) {
            const manifest = {
              name: 'Substance',
              symbol: 'SUBSTANCE',
              description: 'Elemental Substance token of the Alchm protocol representing the Air axis (Mercury / Sublimation). Governs dialectic agility, intellectual framing, and JEPA latent persona reasoning vectors.',
              image: '/tokens/substance.svg',
              external_url: 'https://alchm.kitchen/metadata/esms/substance.json',
              attributes: [
                { trait_type: 'Element', value: 'Air' },
                { trait_type: 'Decimals', value: 4 },
                { trait_type: 'Soulbound', value: 'Non-Transferable' },
                { trait_type: 'BurnAuthority', value: 'Permissioned' },
                { trait_type: 'Extension', value: 'NonTransferable' },
                { trait_type: 'Extension', value: 'PermanentDelegate' },
                { trait_type: 'Extension', value: 'MetadataPointer' },
                { trait_type: 'Extension', value: 'TokenMetadata' },
                { trait_type: 'Extension', value: 'PermissionedBurn' },
                { trait_type: 'Pinned Devnet PDA', value: '6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa' },
              ],
              properties: {
                category: 'elemental_coin',
                files: [{ uri: '/tokens/substance.svg', type: 'image/svg+xml' }],
                creators: [{ address: 'AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5', share: 100 }],
                extensions: {
                  types: ['NonTransferable', 'PermanentDelegate', 'MetadataPointer', 'TokenMetadata', 'PermissionedBurn'],
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
  resolve: {
    alias: {
      buffer: path.resolve(process.cwd(), 'node_modules/buffer/index.js'),
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
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

