// Type definitions for the game

export type Screen =
  "title" | "howto" | "countdown" | "playing" | "paused" | "matchover";
export type Mode = "solo" | "versus";
export type Side = "left" | "right";

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Paddle {
  cy: number; // center y
  vy: number; // integrated velocity for the frame
  drivenVy: number; // velocity set by debug driver
  driven: boolean;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  held: boolean;
  holdTimer: number;
  serveSign: 1 | -1;
  trail: Array<{ x: number; y: number; t: number }>;
}

export interface Obstacle {
  index: 0 | 1;
  cx: number;
  cy: number;
}

export interface Score {
  p1: number;
  p2: number;
}

export interface GameState {
  // Screens and menus
  screen: Screen;
  mode: Mode;
  menuIndex: number;
  titleIndex: number;
  resumeScreen: Screen;

  // Match
  score: Score;
  winner: Side | null;
  receiver: Side;

  // Paddles
  paddles: {
    left: Paddle;
    right: Paddle;
  };

  // AI
  ai: {
    tracking: boolean;
    movement: boolean;
  };

  // Ball
  ball: Ball | null;

  // Obstacles
  obstacles: Obstacle[];

  // Time and audio
  simTime: number;
  muted: boolean;
}

export interface Input {
  "p1-up": boolean;
  "p1-down": boolean;
  "p2-up": boolean;
  "p2-down": boolean;
  confirm: boolean;
  back: boolean;
  pause: boolean;
  mute: boolean;
}

export interface MenuItem {
  rect: { x: number; y: number; w: number; h: number } | null;
}
