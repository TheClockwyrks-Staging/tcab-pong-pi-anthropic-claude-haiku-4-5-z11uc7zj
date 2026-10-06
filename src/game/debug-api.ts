// Type definitions for the debug API

import { Snapshot, MenuItem } from "./instrumentation";

export interface CaromDebugAPI {
  version: number;

  // Clock
  setAutoStep: (enabled: boolean) => void;
  advance: (seconds: number, frames?: number) => void;

  // World
  clearWorld: () => void;
  spawnBall: () => void;
  spawnObstacle: (index: 0 | 1) => void;
  reset: () => void;
  reconcile: () => void;

  // Screens
  setScreen: (screen: string) => void;
  setMode: (mode: string) => void;
  setMenuIndex: (index: number) => void;
  setTitleIndex: (index: number) => void;
  setResumeScreen: (screen: string) => void;

  // Match state
  setScore: (p1: number, p2: number) => void;
  setWinner: (side: string | null) => void;
  setReceiver: (side: string) => void;

  // Paddles
  setPaddleCy: (side: string, cy: number) => void;
  setPaddleVy: (side: string, vy: number) => void;
  setPaddleDriven: (side: string, driven: boolean) => void;

  // Ball
  setBallPosition: (x: number, y: number) => void;
  setBallVelocity: (vx: number, vy: number) => void;
  setBallSpin: (spin: number) => void;
  setBallHeld: (held: boolean) => void;
  setBallHoldTimer: (seconds: number) => void;
  setBallServeSign: (sign: 1 | -1) => void;
  drawBallServeSign: () => void;

  // AI
  setAiTracking: (enabled: boolean) => void;
  setAiMovement: (enabled: boolean) => void;

  // Audio
  setMuted: (muted: boolean) => void;

  // Readings
  snapshot: () => Snapshot;
  menuItemRect: (index: number) => MenuItem | null;
}
