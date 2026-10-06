// Entry point

import { createInitialState } from "./game/state";
import { GameLoop } from "./runtime/game-loop";
import { DebugSurface } from "./game/instrumentation";

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
  (window as any).__carom = {
    version: debugSurface["state"] ? 1 : 0,
    // Clock
    setAutoStep: (enabled: boolean) => {
      gameLoop.setAutoStep(enabled);
      debugSurface.setAutoStep(enabled);
    },
    advance: (seconds: number, frames?: number) => {
      frames = frames || 1;
      gameLoop.advanceFrames(frames, seconds);
    },
    // World
    clearWorld: () => debugSurface.clearWorld(),
    spawnBall: () => debugSurface.spawnBall(),
    spawnObstacle: (index: 0 | 1) => debugSurface.spawnObstacle(index),
    reset: () => debugSurface.reset(),
    reconcile: () => debugSurface.reconcile(),
    // Screens
    setScreen: (screen: string) => debugSurface.setScreen(screen as any),
    setMode: (mode: string) => debugSurface.setMode(mode as any),
    setMenuIndex: (index: number) => debugSurface.setMenuIndex(index),
    setTitleIndex: (index: number) => debugSurface.setTitleIndex(index),
    setResumeScreen: (screen: string) => debugSurface.setResumeScreen(screen as any),
    // Match state
    setScore: (p1: number, p2: number) => debugSurface.setScore(p1, p2),
    setWinner: (side: string | null) => debugSurface.setWinner(side as any),
    setReceiver: (side: string) => debugSurface.setReceiver(side as any),
    // Paddles
    setPaddleCy: (side: string, cy: number) => debugSurface.setPaddleCy(side as any, cy),
    setPaddleVy: (side: string, vy: number) => debugSurface.setPaddleVy(side as any, vy),
    setPaddleDriven: (side: string, driven: boolean) => debugSurface.setPaddleDriven(side as any, driven),
    // Ball
    setBallPosition: (x: number, y: number) => debugSurface.setBallPosition(x, y),
    setBallVelocity: (vx: number, vy: number) => debugSurface.setBallVelocity(vx, vy),
    setBallSpin: (spin: number) => debugSurface.setBallSpin(spin),
    setBallHeld: (held: boolean) => debugSurface.setBallHeld(held),
    setBallHoldTimer: (seconds: number) => debugSurface.setBallHoldTimer(seconds),
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

  gameLoop.start();
}

// Initialize on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeGame);
} else {
  initializeGame();
}
