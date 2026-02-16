import fs from 'fs';
import path from 'path';

const root = process.cwd();
const includeExt = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.json', '.html', '.css', '.md', '.txt', '.yml', '.yaml'
]);
const excludeDirs = new Set(['node_modules', 'dist', '.git']);

const suspiciousPatterns = [
  '\u00C3\u00A4', '\u00C3\u00B6', '\u00C3\u00BC', '\u00C3\u201E', '\u00C3\u0096', '\u00C3\u0153', '\u00C3\u0178',
  '\u00C2\u00A9', '\u00E2\u201A\u00AC', '\u00E2\u20AC\u00A2', '\u00E2\u20AC\u201C', '\u00E2\u20AC\u201D',
  '\u00E2\u20AC', '\u00E2\u201A', '\u00C3', '\u00C2'
];

const findings = [];

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (excludeDirs.has(entry.name)) continue;
      walk(full);
      continue;
    }

    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!includeExt.has(ext)) continue;

    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const token of suspiciousPatterns) {
        if (line.includes(token)) {
          findings.push(`${rel}:${i + 1} enthält verdächtige Sequenz "${token}"`);
          break;
        }
      }
    }
  }
};

walk(root);

if (findings.length > 0) {
  console.error('Encoding-Check fehlgeschlagen. Mögliche Mojibake-Zeichen gefunden:\n');
  for (const item of findings) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Encoding-Check erfolgreich. Keine verdächtigen Zeichenfolgen gefunden.');
