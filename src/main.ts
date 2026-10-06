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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setScreen: (screen: string) => debugSurface.setScreen(screen as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setMode: (mode: string) => debugSurface.setMode(mode as any),
    setMenuIndex: (index: number) => debugSurface.setMenuIndex(index),
    setTitleIndex: (index: number) => debugSurface.setTitleIndex(index),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setResumeScreen: (screen: string) =>
      debugSurface.setResumeScreen(screen as any),
    // Match state
    setScore: (p1: number, p2: number) => debugSurface.setScore(p1, p2),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setWinner: (side: string | null) => debugSurface.setWinner(side as any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setReceiver: (side: string) => debugSurface.setReceiver(side as any),
    // Paddles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPaddleCy: (side: string, cy: number) =>
      debugSurface.setPaddleCy(side as any, cy),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPaddleVy: (side: string, vy: number) =>
      debugSurface.setPaddleVy(side as any, vy),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setPaddleDriven: (side: string, driven: boolean) =>
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
