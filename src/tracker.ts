export class InflightTracker {
  inflightCount = 0;
  lastCompleteTime: number | null = null;

  trackRequest(): void {
    this.inflightCount++;
  }

  untrackRequest(): void {
    this.inflightCount = Math.max(0, this.inflightCount - 1);
    if (this.inflightCount === 0) {
      this.lastCompleteTime = Date.now();
    }
  }

  reset(): void {
    this.inflightCount = 0;
    this.lastCompleteTime = null;
  }
}
