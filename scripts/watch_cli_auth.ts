const intervalFlag = process.argv.find((value) => value.startsWith('--interval='));
const intervalSeconds = Math.max(30, Number(intervalFlag?.split('=')[1] ?? 300));
const once = process.argv.includes('--once');

async function runCheck() {
  const proc = Bun.spawn(['bun', 'scripts/check_cli_auth.ts'], {
    cwd: process.cwd(),
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);

  const stamp = new Date().toISOString();
  if (stdout.trim()) console.log(stdout.trim());
  if (stderr.trim()) console.error(`[${stamp}] ${stderr.trim()}`);
  console.log(`[${stamp}] auth watch cycle complete; next probe in ${intervalSeconds}s`);
  return exitCode;
}

let continueWatching = true;
while (continueWatching) {
  await runCheck();
  if (once) {
    continueWatching = false;
    continue;
  }
  await Bun.sleep(intervalSeconds * 1000);
}
