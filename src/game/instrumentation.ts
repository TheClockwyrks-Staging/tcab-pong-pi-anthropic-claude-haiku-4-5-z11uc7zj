// Debug and automation surface - window.__carom

import { GameState, Screen, Mode, Side } from "../types";
import {
  CAROM_DEBUG_VERSION,
  FIELD_CY,
  OBSTACLE_CENTERS,
  PADDLE_MAX_CY,
  PADDLE_MIN_CY,
} from "../constants";
import { createBall } from "./state";
import { getBallSpeed } from "./state";

export interface Snapshot {
  version: number;
  screen: Screen;
  mode: Mode;
  menuIndex: number;
  titleIndex: number;
  resumeScreen: Screen;
  score: { p1: number; p2: number };
  winner: Side | null;
  muted: boolean;
  paddles: {
    left: { cy: number; vy: number; drivenVy: number; driven: boolean };
    right: { cy: number; vy: number; drivenVy: number; driven: boolean };
  };
  ai: { tracking: boolean; movement: boolean };
  receiver: Side;
  ball: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    spin: number;
    held: boolean;
    holdTimer: number;
    serveSign: 1 | -1;
    trail: Array<{ x: number; y: number; t: number }>;
  } | null;
  obstacles: Array<{ index: 0 | 1; cx: number; cy: number }>;
  autoStep: boolean;
  simTime: number;
}

export interface MenuItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class DebugSurface {
  private state: GameState;
  private autoStep = true;
  private menuItemRects: Map<number, MenuItem> = new Map();

  constructor(state: GameState) {
    this.state = state;
  }

  // Clock
  setAutoStep(enabled: boolean): void {
    this.autoStep = enabled;
  }

  getAutoStep(): boolean {
    return this.autoStep;
  }

  // World
  clearWorld(): void {
    this.state.ball = null;
    this.state.obstacles = [];
  }

  spawnBall(): void {
    const ball = createBall();
    this.state.ball = ball;
  }

  spawnObstacle(index: 0 | 1): void {
    const existing = this.state.obstacles.find((o) => o.index === index);
    if (existing) return;

    this.state.obstacles.push({
      index,
      cx: OBSTACLE_CENTERS[index][0],
      cy: OBSTACLE_CENTERS[index][1],
    });
  }

  reset(): void {
    const currentMuted = this.state.muted;
    const currentSimTime = this.state.simTime;

    this.state.screen = "title";
    this.state.mode = "solo";
    this.state.menuIndex = 0;
    this.state.titleIndex = this.state.titleIndex;
    this.state.resumeScreen = "playing";

    this.state.score = { p1: 0, p2: 0 };
    this.state.winner = null;
    this.state.receiver = "left";

    this.state.paddles.left.cy = FIELD_CY;
    this.state.paddles.left.vy = 0;
    this.state.paddles.left.drivenVy = 0;
    this.state.paddles.left.driven = false;

    this.state.paddles.right.cy = FIELD_CY;
    this.state.paddles.right.vy = 0;
    this.state.paddles.right.drivenVy = 0;
    this.state.paddles.right.driven = false;

    this.state.ai.tracking = true;
    this.state.ai.movement = true;

    this.state.ball = createBall();
    this.state.obstacles = [
      { index: 0, cx: OBSTACLE_CENTERS[0][0], cy: OBSTACLE_CENTERS[0][1] },
      { index: 1, cx: OBSTACLE_CENTERS[1][0], cy: OBSTACLE_CENTERS[1][1] },
    ];

    this.state.muted = currentMuted;
    this.state.simTime = currentSimTime;
  }

  reconcile(): void {
    // No-op: reconcile with current state
  }

  // Screens
  setScreen(screen: Screen): void {
    this.state.screen = screen;
  }

  setMode(mode: Mode): void {
    this.state.mode = mode;
  }

  setMenuIndex(index: number): void {
    this.state.menuIndex = index;
  }

  setTitleIndex(index: number): void {
    this.state.titleIndex = index;
  }

  setResumeScreen(screen: Screen): void {
    this.state.resumeScreen = screen;
  }

  // Match state
  setScore(p1: number, p2: number): void {
    this.state.score = { p1, p2 };
  }

  setWinner(side: Side | null): void {
    this.state.winner = side;
  }

  setReceiver(side: Side): void {
    this.state.receiver = side;
  }

  // Paddles
  setPaddleCy(side: Side, cy: number): void {
    const paddle = side === "left" ? this.state.paddles.left : this.state.paddles.right;
    paddle.cy = Math.max(PADDLE_MIN_CY, Math.min(PADDLE_MAX_CY, cy));
  }

  setPaddleVy(side: Side, vy: number): void {
    const paddle = side === "left" ? this.state.paddles.left : this.state.paddles.right;
    paddle.drivenVy = vy;
  }

  setPaddleDriven(side: Side, driven: boolean): void {
    const paddle = side === "left" ? this.state.paddles.left : this.state.paddles.right;
    paddle.driven = driven;
  }

  // Ball
  setBallPosition(x: number, y: number): void {
    if (!this.state.ball) throw new Error("No ball present");
    this.state.ball.x = x;
    this.state.ball.y = y;
  }

  setBallVelocity(vx: number, vy: number): void {
    if (!this.state.ball) throw new Error("No ball present");
    this.state.ball.vx = vx;
    this.state.ball.vy = vy;
  }

  setBallSpin(spin: number): void {
    if (!this.state.ball) throw new Error("No ball present");
    this.state.ball.spin = spin;
  }

  setBallHeld(held: boolean): void {
    if (!this.state.ball) throw new Error("No ball present");
    this.state.ball.held = held;
  }

  setBallHoldTimer(seconds: number): void {
    if (!this.state.ball) throw new Error("No ball present");
    this.state.ball.holdTimer = seconds;
  }

  setBallServeSign(sign: 1 | -1): void {
    if (!this.state.ball) throw new Error("No ball present");
    this.state.ball.serveSign = sign;
  }

  drawBallServeSign(): void {
    if (!this.state.ball) throw new Error("No ball present");
    this.state.ball.serveSign = Math.random() < 0.5 ? 1 : -1;
  }

  // AI
  setAiTracking(enabled: boolean): void {
    this.state.ai.tracking = enabled;
  }

  setAiMovement(enabled: boolean): void {
    this.state.ai.movement = enabled;
  }

  // Audio
  setMuted(muted: boolean): void {
    this.state.muted = muted;
  }

  // Readings
  snapshot(): Snapshot {
    return {
      version: CAROM_DEBUG_VERSION,
      screen: this.state.screen,
      mode: this.state.mode,
      menuIndex: this.state.menuIndex,
      titleIndex: this.state.titleIndex,
      resumeScreen: this.state.resumeScreen,
      score: { ...this.state.score },
      winner: this.state.winner,
      muted: this.state.muted,
      paddles: {
        left: {
          cy: this.state.paddles.left.cy,
          vy: this.state.paddles.left.vy,
          drivenVy: this.state.paddles.left.drivenVy,
          driven: this.state.paddles.left.driven,
        },
        right: {
          cy: this.state.paddles.right.cy,
          vy: this.state.paddles.right.vy,
          drivenVy: this.state.paddles.right.drivenVy,
          driven: this.state.paddles.right.driven,
        },
      },
      ai: {
        tracking: this.state.ai.tracking,
        movement: this.state.ai.movement,
      },
      receiver: this.state.receiver,
      ball: this.state.ball
        ? {
            x: this.state.ball.x,
            y: this.state.ball.y,
            vx: this.state.ball.vx,
            vy: this.state.ball.vy,
            speed: getBallSpeed(this.state.ball),
            spin: this.state.ball.spin,
            held: this.state.ball.held,
            holdTimer: this.state.ball.holdTimer,
            serveSign: this.state.ball.serveSign,
            trail: this.state.ball.trail.map((t) => ({ ...t })),
          }
        : null,
      obstacles: this.state.obstacles.map((o) => ({ ...o })),
      autoStep: this.autoStep,
      simTime: this.state.simTime,
    };
  }

  menuItemRect(index: number): MenuItem | null {
    return this.menuItemRects.get(index) || null;
  }

  setMenuItemRect(index: number, rect: MenuItem): void {
    this.menuItemRects.set(index, rect);
  }

  clearMenuItemRects(): void {
    this.menuItemRects.clear();
  }
}
