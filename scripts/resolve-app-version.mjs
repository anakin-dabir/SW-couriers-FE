import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import process from 'node:process';

function runGit(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

/** True when value is a bare commit hash (not a release label). */
function isGitCommitHash(value) {
  return /^[0-9a-f]{7,40}$/i.test(value);
}

/** Annotated semver tag, e.g. v1.0.1 or 1.0.1 */
function isReleaseTag(value) {
  if (!value || isGitCommitHash(value)) return false;
  return /^v\d+\.\d+(\.\d+)?$/i.test(value) || /^\d+\.\d+\.\d+/.test(value);
}

/** Nearest annotated tag only, e.g. v1.0.1 (never a raw commit hash). */
function getNearestGitTag() {
  const tag = runGit('git describe --tags --abbrev=0');
  return tag && isReleaseTag(tag) ? tag : null;
}

function readPackageVersion() {
  try {
    const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
    if (typeof pkg.version === 'string' && pkg.version.length > 0 && pkg.version !== '0.0.0') {
      return pkg.version;
    }
  } catch {
    /* fall through */
  }
  return '1.0.0';
}

/** Normalize to a v-prefixed base, e.g. v1.0.1 */
function normalizeBaseVersion(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'v1.0.0';
  return trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
}

/**
 * Unique build label baked into every production build, e.g. v1.0.1-20260520.8727946
 * Refreshes on each `npm run build` (timestamp + short stamp).
 */
function formatBuildVersion(base) {
  const normalized = normalizeBaseVersion(base);
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const buildStamp = String(Date.now()).slice(-7);
  return `${normalized}-${y}${m}${d}.${buildStamp}`;
}

function getDefaultBaseVersion() {
  return normalizeBaseVersion(getNearestGitTag() ?? readPackageVersion());
}

/**
 * @param {string} mode Vite mode (development | production)
 * @returns {string}
 */
export function resolveAppVersion(mode) {
  const fromEnv = process.env.VITE_APP_VERSION?.trim();
  if (fromEnv) return fromEnv;

  const base = getDefaultBaseVersion();

  if (mode === 'development') {
    return formatBuildVersion(base);
  }

  // production: always stamp so each deploy shows a visible, unique version in the UI
  return formatBuildVersion(base);
}
