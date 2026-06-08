const BAR_WIDTH = 16;

export function progressBar(elapsed: number, timeout: number): string {
  const ratio = Math.min(elapsed / timeout, 1);
  const filled = Math.round(ratio * BAR_WIDTH);
  return '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled);
}

export function formatWaitMessage(
  inflightCount: number,
  elapsed: number,
  timeout: number,
): string {
  const remaining = Math.max(0, timeout - elapsed) / 1000;
  const count = inflightCount === 1 ? '1 in-flight' : `${inflightCount} in-flight`;
  return `${count}  ${progressBar(elapsed, timeout)}  ${remaining.toFixed(1)}s remaining`;
}
