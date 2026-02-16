import { execSync } from 'child_process';

const intervalSeconds = Number(process.env.AUTO_SYNC_INTERVAL || 30);
const remote = process.env.AUTO_SYNC_REMOTE || 'origin';
const includeUntracked = process.env.AUTO_SYNC_UNTRACKED === '1';

const run = (cmd, options = {}) => {
  return execSync(cmd, {
    stdio: 'pipe',
    encoding: 'utf8',
    ...options
  }).trim();
};

const runSafe = (cmd) => {
  try {
    return { ok: true, out: run(cmd) };
  } catch (err) {
    return {
      ok: false,
      out: String(err?.stdout || '').trim(),
      err: String(err?.stderr || err?.message || '').trim()
    };
  }
};

const ensureGitRepo = () => {
  const check = runSafe('git rev-parse --is-inside-work-tree');
  if (!check.ok || check.out !== 'true') {
    throw new Error('Kein Git-Repository gefunden.');
  }
};

const hasInitialCommit = () => runSafe('git rev-parse --verify HEAD').ok;

const currentBranch = () => {
  const symbolic = runSafe('git symbolic-ref --short HEAD');
  if (symbolic.ok && symbolic.out) return symbolic.out;

  const revParse = runSafe('git rev-parse --abbrev-ref HEAD');
  if (revParse.ok && revParse.out && revParse.out !== 'HEAD') return revParse.out;

  return 'main';
};

const hasChanges = () => {
  // Before first commit, we need to include untracked files to create HEAD.
  if (!hasInitialCommit()) {
    return run('git status --porcelain').length > 0;
  }

  const cmd = includeUntracked
    ? 'git status --porcelain'
    : 'git status --porcelain --untracked-files=no';
  return run(cmd).length > 0;
};

const stageChanges = () => {
  // First commit must include new files.
  if (!hasInitialCommit()) {
    run('git add -A');
    return;
  }

  if (includeUntracked) {
    run('git add -A');
  } else {
    run('git add -u');
  }
};

const hasStagedChanges = () => {
  const check = runSafe('git diff --cached --quiet');
  return !check.ok;
};

const commitAndPush = () => {
  const branch = currentBranch();
  const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', ' UTC');
  const message = `chore: auto-sync ${timestamp}`;

  stageChanges();
  if (!hasStagedChanges()) return false;

  run(`git commit -m "${message}"`);
  const pushResult = runSafe(`git push ${remote} ${branch}`);
  if (!pushResult.ok) {
    // First push often needs upstream setup.
    const upstreamResult = runSafe(`git push -u ${remote} ${branch}`);
    if (!upstreamResult.ok) {
      throw new Error(upstreamResult.err || upstreamResult.out || 'Push fehlgeschlagen.');
    }
  }
  return true;
};

let isRunning = false;

const tick = () => {
  if (isRunning) return;
  isRunning = true;
  try {
    if (!hasChanges()) return;
    const pushed = commitAndPush();
    if (pushed) {
      console.log(`[auto-sync] Änderungen nach GitHub gepusht (${new Date().toISOString()})`);
    }
  } catch (err) {
    console.error('[auto-sync] Fehler:', err.message);
  } finally {
    isRunning = false;
  }
};

try {
  ensureGitRepo();
  console.log(`[auto-sync] gestartet | interval=${intervalSeconds}s | remote=${remote} | includeUntracked=${includeUntracked}`);
  tick();
  setInterval(tick, Math.max(5, intervalSeconds) * 1000);
} catch (err) {
  console.error('[auto-sync] Start fehlgeschlagen:', err.message);
  process.exit(1);
}
