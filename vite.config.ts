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
  'lsof -i',
  'lsof -ti:',
  'spacetime',
];

function isCommandWhitelisted(cmd: string): boolean {
  const trimmed = cmd.trim();
  return ALLOWED_COMMAND_PREFIXES.some((prefix) => trimmed === prefix || trimmed.startsWith(prefix + ' ') || trimmed.startsWith(prefix));
}

const alchmBackendPlugin = (): Plugin => ({
  name: 'alchm-backend-plugin',
  configureServer(server: ViteDevServer) {
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
                error: `Command '${command.slice(0, 50)}' prohibited by Solana Mission Control security policy. Allowed commands: cargo build-sbf, solana-test-validator, solana, anchor, bun scripts/*, lsof, spacetime`,
                stdout: '',
                stderr: 'Security Policy Violation: Command not whitelisted.'
              }));
              return;
            }

            const execCwd = cwd ? path.resolve(process.cwd(), cwd) : process.cwd();
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

      // 2. Verified IDL & Artifact File System middleware (/api/fs)
      if (req.url?.startsWith('/api/fs') && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { action = 'write', filePath, content } = JSON.parse(body);
            if (!filePath || typeof filePath !== 'string') {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'filePath is required' }));
              return;
            }

            const fullPath = path.resolve(process.cwd(), filePath);
            // Prevent directory traversal outside the workspace
            if (!fullPath.startsWith(process.cwd())) {
              res.statusCode = 403;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Access denied: path outside workspace root.' }));
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
