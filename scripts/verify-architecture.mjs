import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const appRoot = path.join(root, 'app');
const failures = [];
const maxLines = 400;

const bannedCoreUsagePatterns = [
  [/\bfetch\s*\(/, 'network calls'],
  [/\bwindow\s*(?:\.|\[)/, 'window'],
  [/\bdocument\s*(?:\.|\[)/, 'document'],
  [/\blocalStorage\s*(?:\.|\[)/, 'localStorage'],
  [/\bsessionStorage\s*(?:\.|\[)/, 'sessionStorage'],
  [/\bprocess\.env\b/, 'environment variables'],
  [/\bDeno\.env\b/, 'environment variables'],
];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.js') ? [full] : [];
  });
}

function relative(file) {
  return path.relative(root, file).replaceAll(path.sep, '/');
}

function layerOf(file) {
  const rel = relative(file);
  const match = /^app\/(core|api|adapters|web)\//.exec(rel);
  return match?.[1] || null;
}

function importsOf(source) {
  const imports = [];
  const pattern = /(?:import\s+(?:[^'";]+?\s+from\s+)?|export\s+[^'";]+?\s+from\s+|import\s*\()(['"])([^'"]+)\1/g;
  for (const match of source.matchAll(pattern)) imports.push(match[2]);
  return imports;
}

function resolveImport(file, specifier) {
  if (!specifier.startsWith('.')) return null;
  const candidate = path.resolve(path.dirname(file), specifier);
  for (const possible of [candidate, `${candidate}.js`, path.join(candidate, 'index.js')]) {
    if (fs.existsSync(possible) && fs.statSync(possible).isFile()) return possible;
  }
  return null;
}

function allowedDependency(fromLayer, toLayer) {
  if (!fromLayer || !toLayer) return false;
  const allowed = {
    core: new Set(['core']),
    api: new Set(['core', 'api']),
    adapters: new Set(['core', 'api', 'adapters']),
    web: new Set(['core', 'web']),
  };
  return allowed[fromLayer]?.has(toLayer) ?? false;
}

const files = walk(appRoot);
const graph = new Map();

for (const file of files) {
  const rel = relative(file);
  const layer = layerOf(file);
  const source = fs.readFileSync(file, 'utf8');
  const lines = source.split('\n').length;

  if (!layer) failures.push(`${rel}: JavaScript under app/ must belong to core, api, adapters or web.`);
  if (lines > maxLines) failures.push(`${rel}: ${lines} lines exceeds ${maxLines}-line review threshold.`);

  if (layer === 'core') {
    for (const [pattern, label] of bannedCoreUsagePatterns) {
      if (pattern.test(source)) failures.push(`${rel}: core may not depend on ${label}.`);
    }
  }

  const resolved = [];
  for (const specifier of importsOf(source)) {
    if (!specifier.startsWith('.')) {
      if (layer === 'core' || layer === 'api') {
        failures.push(`${rel}: ${layer} may not import external package "${specifier}".`);
      }
      continue;
    }

    const target = resolveImport(file, specifier);
    if (!target) {
      failures.push(`${rel}: unresolved local import "${specifier}".`);
      continue;
    }

    const targetLayer = layerOf(target);
    if (layer && !allowedDependency(layer, targetLayer)) {
      const destination = targetLayer || 'outside app/';
      failures.push(`${rel}: ${layer} may not depend on ${destination} (${relative(target)}).`);
    }
    resolved.push(target);
  }
  graph.set(file, resolved);
}

const visiting = new Set();
const visited = new Set();
function visit(file, stack = []) {
  if (visiting.has(file)) {
    const cycle = [...stack, file].map(relative).join(' -> ');
    failures.push(`Circular app dependency: ${cycle}`);
    return;
  }
  if (visited.has(file)) return;
  visiting.add(file);
  for (const next of graph.get(file) || []) visit(next, [...stack, file]);
  visiting.delete(file);
  visited.add(file);
}
for (const file of files) visit(file);

if (failures.length) {
  console.error('Architecture verification failed:\n');
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Architecture verification passed for ${files.length} app modules.`);
}
