// Game state management

import { GameState, Side } from "../types";
import {
  FIELD_CY,
  FIELD_CX,
  HOLD_TIME,
  OBSTACLE_CENTERS,
  WIN_SCORE,
  WIN_LEAD,
} from "../constants";

export function createInitialState(): GameState {
  const state: GameState = {
    screen: "title",
    mode: "solo",
    menuIndex: 0,
    titleIndex: 0,
    resumeScreen: "playing",

    score: { p1: 0, p2: 0 },
    winner: null,
    receiver: "left",

    paddles: {
      left: {
        cy: FIELD_CY,
        vy: 0,
        drivenVy: 0,
        driven: false,
      },
      right: {
        cy: FIELD_CY,
        vy: 0,
        drivenVy: 0,
        driven: false,
      },
    },

    ai: {
      tracking: true,
      movement: true,
    },

    ball: createBall(),
    obstacles: [
      { index: 0, cx: OBSTACLE_CENTERS[0][0], cy: OBSTACLE_CENTERS[0][1] },
      { index: 1, cx: OBSTACLE_CENTERS[1][0], cy: OBSTACLE_CENTERS[1][1] },
    ],

    simTime: 0,
    muted: false,
  };

  return state;
}

export function createBall() {
  const serveSign: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  return {
    x: FIELD_CX,
    y: FIELD_CY,
    vx: 0,
    vy: 0,
    spin: 0,
    held: true,
    holdTimer: HOLD_TIME,
    serveSign,
    trail: [],
  };
}

export function resetState(state: GameState): void {
  const currentTitleIndex = state.titleIndex;
  const currentSimTime = state.simTime;
  const currentMuted = state.muted;

  state.screen = "title";
  state.mode = "solo";
  state.menuIndex = 0;
  state.resumeScreen = "playing";
  state.titleIndex = currentTitleIndex; // kept
  state.simTime = currentSimTime; // kept
  state.muted = currentMuted; // kept

  state.score = { p1: 0, p2: 0 };
  state.winner = null;
  state.receiver = "left";

  state.paddles.left.cy = FIELD_CY;
  state.paddles.left.vy = 0;
  state.paddles.left.drivenVy = 0;
  state.paddles.left.driven = false;

  state.paddles.right.cy = FIELD_CY;
  state.paddles.right.vy = 0;
  state.paddles.right.drivenVy = 0;
  state.paddles.right.driven = false;

  state.ai.tracking = true;
  state.ai.movement = true;

  state.ball = createBall();

  state.obstacles = [
    { index: 0, cx: OBSTACLE_CENTERS[0][0], cy: OBSTACLE_CENTERS[0][1] },
    { index: 1, cx: OBSTACLE_CENTERS[1][0], cy: OBSTACLE_CENTERS[1][1] },
  ];
}

export function startMatch(state: GameState, mode: "solo" | "versus"): void {
  state.mode = mode;
  state.screen = "countdown";
  state.resumeScreen = "playing";
  state.menuIndex = 0;

  state.score = { p1: 0, p2: 0 };
  state.winner = null;
  state.receiver = "left";

  state.paddles.left.cy = FIELD_CY;
  state.paddles.left.vy = 0;

  state.paddles.right.cy = FIELD_CY;
  state.paddles.right.vy = 0;

  state.ball = createBall();
}

export function checkWinCondition(state: GameState): Side | null {
  const { p1, p2 } = state.score;
  if (p1 >= WIN_SCORE && p1 - p2 >= WIN_LEAD) {
    return "left";
  }
  if (p2 >= WIN_SCORE && p2 - p1 >= WIN_LEAD) {
    return "right";
  }
  return null;
}

export function parkBall(state: GameState): void {
  if (!state.ball) return;
  state.ball.x = FIELD_CX;
  state.ball.y = FIELD_CY;
  state.ball.vx = 0;
  state.ball.vy = 0;
  state.ball.spin = 0;
  state.ball.held = true;
  state.ball.holdTimer = HOLD_TIME;
  const serveSign: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  state.ball.serveSign = serveSign;
  state.ball.trail = [];
}

export function getPaddle(state: GameState, side: Side) {
  return side === "left" ? state.paddles.left : state.paddles.right;
}

export function getBallSpeed(ball: NonNullable<GameState["ball"]>): number {
  return Math.hypot(ball.vx, ball.vy);
}
