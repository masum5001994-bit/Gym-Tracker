import { describe, it, expect } from 'vitest';
import { playRestTimerCompleteBeep } from './audioBeep';

describe('audioBeep', () => {
  it('does not throw when triggering rest timer completion beep', () => {
    expect(() => playRestTimerCompleteBeep()).not.toThrow();
  });
});
