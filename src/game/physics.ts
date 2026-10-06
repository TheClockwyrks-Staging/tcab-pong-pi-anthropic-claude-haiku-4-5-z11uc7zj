// Ball physics and collision resolution

import { GameState } from "../types";
import {
  BALL_R,
  FIELD_H,
  FIELD_W,
  MAX_BOUNCE_ANGLE,
  MAX_SUBSTEP,
  P1_X0,
  P1_X1,
  P2_X0,
  P2_X1,
  PADDLE_HALF,
  SERVE_ANGLE,
  SERVE_SPEED,
  SPEED_CAP,
  SPEED_MULT,
  SPIN_CLAMP,
  SPIN_FROM_PADDLE,
  SPIN_HALFLIFE,
  OBSTACLE_HW,
  OBSTACLE_HH,
  FIELD_CX,
  FIELD_CY,
  TRAIL_TIME,
  HOLD_TIME,
} from "../constants";
import { getBallSpeed } from "./state";

export let lastPaddleHit: "left" | "right" | null = null;
export let lastWallBounce = false;
export let lastObstacleBounce = false;
export let lastScore: "left" | "right" | null = null;

export function resetAudioFlags(): void {
  lastPaddleHit = null;
  lastWallBounce = false;
  lastObstacleBounce = false;
  lastScore = null;
}

export function updateBall(
  state: GameState,
  dt: number,
  onPaddleHit?: () => void,
  onWallBounce?: () => void,
  onObstacleBounce?: () => void,
  onScore?: () => void,
): void {
  if (!state.ball) return;

  const ball = state.ball;

  // Handle hold timer
  if (ball.held) {
    ball.holdTimer -= dt;
    if (ball.holdTimer <= 0) {
      // Serve the ball
      ball.holdTimer = 0;
      ball.held = false;
      ball.trail = [];
      state.screen = "playing";

      const dir = state.receiver === "left" ? -1 : 1;
      ball.vx = dir * SERVE_SPEED * Math.cos(SERVE_ANGLE);
      ball.vy = ball.serveSign * SERVE_SPEED * Math.sin(SERVE_ANGLE);
    }
  }

  // If ball is held, just update trail
  if (ball.held) {
    addTrailSample(ball, state.simTime);
    return;
  }

  // Physics sub-stepping
  const speed = getBallSpeed(ball);
  const n = Math.max(1, Math.ceil((speed * dt) / MAX_SUBSTEP));
  const h = dt / n;

  for (let i = 0; i < n; i++) {
    substepBall(ball, h);

    // Resolve collisions
    resolveBallWalls(ball, onWallBounce);
    resolveBallPaddle(ball, state.paddles.left, "left", onPaddleHit);
    resolveBallPaddle(ball, state.paddles.right, "right", onPaddleHit);

    state.obstacles.forEach((obstacle) => {
      resolveBallObstacle(ball, obstacle, onObstacleBounce);
    });
  }

  // Check scoring
  if (ball.x - BALL_R > FIELD_W) {
    state.score.p1++;
    onScore?.();
    lastScore = "left";
    handleScore(state);
  } else if (ball.x + BALL_R < 0) {
    state.score.p2++;
    onScore?.();
    lastScore = "right";
    handleScore(state);
  }

  // Update trail
  addTrailSample(ball, state.simTime);
}

function substepBall(ball: NonNullable<GameState["ball"]>, h: number): void {
  const speed = Math.hypot(ball.vx, ball.vy);

  // 1. Spin turns velocity
  if (speed > 0 && ball.spin !== 0) {
    const angle = (ball.spin / speed) * h;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const newVx = ball.vx * cos - ball.vy * sin;
    const newVy = ball.vx * sin + ball.vy * cos;
    ball.vx = newVx;
    ball.vy = newVy;
  }

  // 2. Spin decays
  const decayFactor = 0.5 ** (h / SPIN_HALFLIFE);
  ball.spin *= decayFactor;

  // 3. Advance
  ball.x += ball.vx * h;
  ball.y += ball.vy * h;
}

function resolveBallWalls(
  ball: NonNullable<GameState["ball"]>,
  onWallBounce?: () => void,
): void {
  if (ball.y - BALL_R < 0 && ball.vy < 0) {
    ball.y = BALL_R;
    ball.vy = -ball.vy;
    onWallBounce?.();
  } else if (ball.y + BALL_R > FIELD_H && ball.vy > 0) {
    ball.y = FIELD_H - BALL_R;
    ball.vy = -ball.vy;
    onWallBounce?.();
  }
}

interface Paddle {
  cy: number;
  vy: number;
  drivenVy: number;
}

interface Obstacle {
  cx: number;
  cy: number;
}

function resolveBallPaddle(
  ball: NonNullable<GameState["ball"]>,
  paddle: Paddle,
  side: "left" | "right",
  onPaddleHit?: () => void,
): void {
  const [x0, x1] = side === "left" ? [P1_X0, P1_X1] : [P2_X0, P2_X1];
  const y0 = paddle.cy - PADDLE_HALF;
  const y1 = paddle.cy + PADDLE_HALF;

  // Check if ball overlaps
  const left = ball.x - (x0 - BALL_R);
  const right = x1 + BALL_R - ball.x;
  const top = ball.y - (y0 - BALL_R);
  const bottom = y1 + BALL_R - ball.y;

  // Check overlap
  if (left <= 0 || right <= 0 || top <= 0 || bottom <= 0) {
    return; // No overlap
  }

  // Find struck face with smallest depth
  const depths = [
    { depth: left, face: "left" as const },
    { depth: right, face: "right" as const },
    { depth: top, face: "top" as const },
    { depth: bottom, face: "bottom" as const },
  ];
  depths.sort((a, b) => a.depth - b.depth);
  const struckFace = depths[0].face;

  // Place ball
  if (struckFace === "left") {
    ball.x = x0 - BALL_R;
    if (ball.vx > 0) {
      // Paddle hit - only left/right faces
      handlePaddleHit(ball, paddle, side, onPaddleHit);
    }
  } else if (struckFace === "right") {
    ball.x = x1 + BALL_R;
    if (ball.vx < 0) {
      // Paddle hit
      handlePaddleHit(ball, paddle, side, onPaddleHit);
    }
  } else if (struckFace === "top") {
    ball.y = y0 - BALL_R;
    if (ball.vy > 0) {
      ball.vy = -ball.vy;
    }
  } else if (struckFace === "bottom") {
    ball.y = y1 + BALL_R;
    if (ball.vy < 0) {
      ball.vy = -ball.vy;
    }
  }
}

function handlePaddleHit(
  ball: NonNullable<GameState["ball"]>,
  paddle: Paddle,
  side: "left" | "right",
  onPaddleHit?: () => void,
): void {
  onPaddleHit?.();
  lastPaddleHit = side;

  // Reflection angle from contact point
  const offset = Math.max(-1, Math.min(1, (ball.y - paddle.cy) / PADDLE_HALF));
  const theta = offset * MAX_BOUNCE_ANGLE;

  // Speed increase
  const currentSpeed = Math.hypot(ball.vx, ball.vy);
  const newSpeed = Math.min(currentSpeed * SPEED_MULT, SPEED_CAP);

  // New velocity
  const dir = side === "left" ? 1 : -1;
  ball.vx = dir * newSpeed * Math.cos(theta);
  ball.vy = newSpeed * Math.sin(theta);

  // Spin from paddle motion
  ball.spin = Math.max(
    -SPIN_CLAMP,
    Math.min(SPIN_CLAMP, ball.spin + paddle.vy * SPIN_FROM_PADDLE),
  );

  // Placement
  if (side === "left") {
    ball.x = P1_X1 + BALL_R;
  } else {
    ball.x = P2_X0 - BALL_R;
  }
}

function resolveBallObstacle(
  ball: NonNullable<GameState["ball"]>,
  obstacle: Obstacle,
  onObstacleBounce?: () => void,
): void {
  const x0 = obstacle.cx - OBSTACLE_HW;
  const x1 = obstacle.cx + OBSTACLE_HW;
  const y0 = obstacle.cy - OBSTACLE_HH;
  const y1 = obstacle.cy + OBSTACLE_HH;

  // Check overlap using expanded rectangle
  const left = ball.x - (x0 - BALL_R);
  const right = x1 + BALL_R - ball.x;
  const top = ball.y - (y0 - BALL_R);
  const bottom = y1 + BALL_R - ball.y;

  // Check overlap
  if (left <= 0 || right <= 0 || top <= 0 || bottom <= 0) {
    return; // No overlap
  }

  // Find struck face with smallest depth
  const depths = [
    { depth: left, face: "left" as const },
    { depth: right, face: "right" as const },
    { depth: top, face: "top" as const },
    { depth: bottom, face: "bottom" as const },
  ];
  depths.sort((a, b) => a.depth - b.depth);
  const struckFace = depths[0].face;

  // Place ball and reverse velocity component
  if (struckFace === "left") {
    ball.x = x0 - BALL_R;
    if (ball.vx > 0) {
      ball.vx = -ball.vx;
    }
  } else if (struckFace === "right") {
    ball.x = x1 + BALL_R;
    if (ball.vx < 0) {
      ball.vx = -ball.vx;
    }
  } else if (struckFace === "top") {
    ball.y = y0 - BALL_R;
    if (ball.vy > 0) {
      ball.vy = -ball.vy;
    }
  } else if (struckFace === "bottom") {
    ball.y = y1 + BALL_R;
    if (ball.vy < 0) {
      ball.vy = -ball.vy;
    }
  }

  onObstacleBounce?.();
}

function handleScore(state: GameState): void {
  const winner = checkWinCondition(state.score.p1, state.score.p2);
  if (winner) {
    state.winner = winner;
    state.screen = "matchover";
    state.menuIndex = 0;
  } else {
    // Park ball for next serve
    if (state.ball) {
      const { p1, p2 } = state.score;
      state.receiver = p1 > p2 ? "right" : "left";
      state.ball.x = FIELD_CX;
      state.ball.y = FIELD_CY;
      state.ball.vx = 0;
      state.ball.vy = 0;
      state.ball.spin = 0;
      state.ball.held = true;
      state.ball.holdTimer = HOLD_TIME;
      state.ball.serveSign = Math.random() < 0.5 ? 1 : -1;
      state.ball.trail = [];
      state.screen = "countdown";
    }
  }
}

function checkWinCondition(p1: number, p2: number): "left" | "right" | null {
  if (p1 >= 11 && p1 - p2 >= 2) return "left";
  if (p2 >= 11 && p2 - p1 >= 2) return "right";
  return null;
}

function addTrailSample(
  ball: NonNullable<GameState["ball"]>,
  simTime: number,
): void {
  ball.trail.push({ x: ball.x, y: ball.y, t: simTime });

  // Remove old samples
  while (ball.trail.length > 0 && simTime - ball.trail[0].t > TRAIL_TIME) {
    ball.trail.shift();
  }
}

export function updatePaddleVy(paddle: Paddle, dt: number): void {
  const next = Math.max(
    38, // PADDLE_MIN_CY - calculated from FIELD_H and PADDLE_HALF
    Math.min(665, paddle.cy + paddle.vy * dt), // PADDLE_MAX_CY
  );

  if (next !== paddle.cy + paddle.vy * dt && dt > 0) {
    paddle.vy = (next - paddle.cy) / dt;
  }

  paddle.cy = next;
}

export function updatePaddleVyDriven(paddle: Paddle, dt: number): void {
  const next = Math.max(
    55, // PADDLE_MIN_CY
    Math.min(665, paddle.cy + paddle.drivenVy * dt), // PADDLE_MAX_CY
  );

  if (next !== paddle.cy + paddle.drivenVy * dt && dt > 0) {
    paddle.drivenVy = (next - paddle.cy) / dt;
  }

  paddle.cy = next;
}
