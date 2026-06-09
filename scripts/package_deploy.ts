import { mkdir, readdir, copyFile, writeFile, stat, rm } from 'node:fs/promises';
import { join } from 'node:path';

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function copyDir(src: string, dest: string) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function main() {
  console.log('🤖 Starting CookingWithCastro LLC MVP Deployment Packaging...');

  const workspaceRoot = join(import.meta.dirname, '..');
  const distDir = join(workspaceRoot, 'dist');
  const outputsDir = join(workspaceRoot, 'outputs');
  const bundleDir = join(outputsDir, 'deploy_bundle');
  const stitchDir = join(workspaceRoot, 'stitchexport', 'stitch_alchmhackstation_operator_console');

  // 1. Assert production build is present
  if (!(await exists(distDir))) {
    console.error('❌ Error: production distribution folder "dist/" not found. Please compile the application first using: bun run build');
    process.exit(1);
  }

  // 2. Clear & create output deploy bundle directory
  await rm(bundleDir, { recursive: true, force: true });
  await mkdir(bundleDir, { recursive: true });

  // 3. Copy production client assets
  console.log('📦 Bundling production client files...');
  await copyDir(distDir, bundleDir);

  // 4. Copy unzipped design guidelines if present
  const designSrc = join(stitchDir, 'obsidian_command', 'DESIGN.md');
  const designDest = join(bundleDir, 'DESIGN.md');

  if (await exists(designSrc)) {
    console.log('🎨 Linking Obsidian Command Design tokens...');
    await copyFile(designSrc, designDest);
  } else {
    console.log('⚠️ Warning: stitchexport DESIGN.md not found in default path, skipping design systems linking.');
  }

  // 5. Generate deploy_manifest.json
  console.log('📝 Compiling deploy_manifest.json...');
  const manifest = {
    entity: 'CookingWithCastro LLC',
    mvp: 'AlchmHackStation',
    niche: 'The App Making App // Multi-AI Design-to-Code Pipeline',
    version: '1.0.0-MVP',
    buildEngine: 'Bun v1.3.13',
    framework: 'React 19 + TypeScript',
    styling: 'Tailwind CSS v4 (Obsidian Theme)',
    targetHosts: ['Vercel', 'Railway', 'Tauri App Bundle'],
    timestamp: new Date().toISOString(),
    status: 'PRODUCTION_READY',
  };

  await writeFile(
    join(bundleDir, 'deploy_manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  console.log(`\n🎉 Success! Packaging compiled. Output deploy bundle saved to:`);
  console.log(`👉 ${bundleDir}\n`);
}

main().catch((err) => {
  console.error('❌ Deployment packaging failed:', err);
  process.exit(1);
});
