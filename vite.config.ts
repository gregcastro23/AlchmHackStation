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

