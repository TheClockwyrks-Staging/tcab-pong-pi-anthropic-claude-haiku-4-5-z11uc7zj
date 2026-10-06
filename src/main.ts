// Entry point

import { createInitialState } from "./game/state";
import { GameLoop } from "./runtime/game-loop";
import { DebugSurface } from "./game/instrumentation";
import type { CaromDebugAPI } from "./game/debug-api";

declare global {
  interface Window {
    __carom?: CaromDebugAPI;
  }
}

let gameLoop: GameLoop;
let debugSurface: DebugSurface;

function initializeGame(): void {
  const state = createInitialState();
  const canvas = document.getElementById("stage") as HTMLCanvasElement;

  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }

  debugSurface = new DebugSurface(state);
  gameLoop = new GameLoop(state, canvas, debugSurface);

  // Install debug surface on window
  const caromApi: CaromDebugAPI = {
    version: 1,
    // Clock
    setAutoStep: (enabled: boolean) => {
      gameLoop.setAutoStep(enabled);
      debugSurface.setAutoStep(enabled);
    },
    advance: (seconds: number, frames?: number) => {
      gameLoop.advanceFrames(frames || 1, seconds);
    },
    // World
    clearWorld: () => debugSurface.clearWorld(),
    spawnBall: () => debugSurface.spawnBall(),
    spawnObstacle: (index: 0 | 1) => debugSurface.spawnObstacle(index),
    reset: () => debugSurface.reset(),
    reconcile: () => debugSurface.reconcile(),
    // Screens
    setScreen: (screen: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      debugSurface.setScreen(screen as any),
    setMode: (mode: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      debugSurface.setMode(mode as any),
    setMenuIndex: (index: number) => debugSurface.setMenuIndex(index),
    setTitleIndex: (index: number) => debugSurface.setTitleIndex(index),
    setResumeScreen: (screen: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      debugSurface.setResumeScreen(screen as any),
    // Match state
    setScore: (p1: number, p2: number) => debugSurface.setScore(p1, p2),
    setWinner: (side: string | null) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      debugSurface.setWinner(side as any),
    setReceiver: (side: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      debugSurface.setReceiver(side as any),
    // Paddles
    setPaddleCy: (side: string, cy: number) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      debugSurface.setPaddleCy(side as any, cy),
    setPaddleVy: (side: string, vy: number) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      debugSurface.setPaddleVy(side as any, vy),
    setPaddleDriven: (side: string, driven: boolean) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      debugSurface.setPaddleDriven(side as any, driven),
    // Ball
    setBallPosition: (x: number, y: number) =>
      debugSurface.setBallPosition(x, y),
    setBallVelocity: (vx: number, vy: number) =>
      debugSurface.setBallVelocity(vx, vy),
    setBallSpin: (spin: number) => debugSurface.setBallSpin(spin),
    setBallHeld: (held: boolean) => debugSurface.setBallHeld(held),
    setBallHoldTimer: (seconds: number) =>
      debugSurface.setBallHoldTimer(seconds),
    setBallServeSign: (sign: 1 | -1) => debugSurface.setBallServeSign(sign),
    drawBallServeSign: () => debugSurface.drawBallServeSign(),
    // AI
    setAiTracking: (enabled: boolean) => debugSurface.setAiTracking(enabled),
    setAiMovement: (enabled: boolean) => debugSurface.setAiMovement(enabled),
    // Audio
    setMuted: (muted: boolean) => debugSurface.setMuted(muted),
    // Readings
    snapshot: () => debugSurface.snapshot(),
    menuItemRect: (index: number) => debugSurface.menuItemRect(index),
  };

  window.__carom = caromApi;

  gameLoop.start();
}

// Initialize on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeGame);
} else {
  initializeGame();
}
