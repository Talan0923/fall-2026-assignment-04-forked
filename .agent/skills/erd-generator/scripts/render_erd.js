import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const inputPath = path.resolve(
  process.cwd(),
  process.argv[2] ?? 'docs/architecture/schema.mmd'
);
const outputPath = path.resolve(process.cwd(), 'docs/architecture/erd.svg');
const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx';

try {
  mkdirSync(path.dirname(outputPath), { recursive: true });
  const result = spawnSync(
    executable,
    ['mmdc', '-i', inputPath, '-o', outputPath],
    {
      encoding: 'utf8',
      shell: process.platform === 'win32',
    }
  );

  if (result.status !== 0) {
    const trace =
      result.stderr || result.error?.message || result.stdout || 'Mermaid CLI failed.';
    process.stderr.write(`SYNTAX_ERROR:\n${trace.trimEnd()}\n`);
    process.exit(1);
  }

  process.stdout.write('SUCCESS\n');
} catch (error) {
  const trace = error instanceof Error ? error.message : String(error);
  process.stderr.write(`SYNTAX_ERROR:\n${trace}\n`);
  process.exit(1);
}