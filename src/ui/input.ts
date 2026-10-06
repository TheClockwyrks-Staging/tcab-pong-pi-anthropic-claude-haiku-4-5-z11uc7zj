// UI and game input handling

import { GameState } from "../types";
import { InputEdges } from "../runtime/input";
import { TITLE_ITEMS, PAUSE_ITEMS, MATCHOVER_ITEMS } from "../constants";
import { startMatch } from "../game/state";

export function handleScreenInput(state: GameState, edges: InputEdges): void {
  // Handle mute on all screens
  if (edges.mute) {
    state.muted = !state.muted;
  }

  switch (state.screen) {
    case "title":
      handleTitleInput(state, edges);
      break;
    case "howto":
      handleHowtoInput(state, edges);
      break;
    case "countdown":
    case "playing":
      handleGameInput(state, edges);
      break;
    case "paused":
      handlePausedInput(state, edges);
      break;
    case "matchover":
      handleMatchoverInput(state, edges);
      break;
  }
}

function handleTitleInput(state: GameState, edges: InputEdges): void {
  if (edges["p1-up"] || edges["p2-up"]) {
    state.menuIndex = (state.menuIndex - 1 + TITLE_ITEMS.length) % TITLE_ITEMS.length;
  } else if (edges["p1-down"] || edges["p2-down"]) {
    state.menuIndex = (state.menuIndex + 1) % TITLE_ITEMS.length;
  }

  if (edges.confirm) {
    state.titleIndex = state.menuIndex;
    if (state.menuIndex === 0) {
      // SOLO
      startMatch(state, "solo");
    } else if (state.menuIndex === 1) {
      // VERSUS
      startMatch(state, "versus");
    } else if (state.menuIndex === 2) {
      // HOW TO PLAY
      state.screen = "howto";
      state.menuIndex = 0;
    }
  }
}

function handleHowtoInput(state: GameState, edges: InputEdges): void {
  if (edges.confirm || edges.back) {
    state.screen = "title";
    state.menuIndex = state.titleIndex;
  }
}

function handleGameInput(state: GameState, edges: InputEdges): void {
  if (edges.pause || edges.back) {
    state.resumeScreen = state.screen;
    state.screen = "paused";
    state.menuIndex = 0;
  }
}

function handlePausedInput(state: GameState, edges: InputEdges): void {
  // Check for resume first
  if (edges.pause || edges.back) {
    state.screen = state.resumeScreen;
    return;
  }

  // Menu navigation
  if (edges["p1-up"] || edges["p2-up"]) {
    state.menuIndex = (state.menuIndex - 1 + PAUSE_ITEMS.length) % PAUSE_ITEMS.length;
  } else if (edges["p1-down"] || edges["p2-down"]) {
    state.menuIndex = (state.menuIndex + 1) % PAUSE_ITEMS.length;
  }

  if (edges.confirm) {
    if (state.menuIndex === 0) {
      // RESUME
      state.screen = state.resumeScreen;
    } else if (state.menuIndex === 1) {
      // RESTART
      startMatch(state, state.mode);
    } else if (state.menuIndex === 2) {
      // QUIT TO MENU
      returnToTitle(state);
    }
  }
}

function handleMatchoverInput(state: GameState, edges: InputEdges): void {
  if (edges["p1-up"] || edges["p2-up"]) {
    state.menuIndex = (state.menuIndex - 1 + MATCHOVER_ITEMS.length) % MATCHOVER_ITEMS.length;
  } else if (edges["p1-down"] || edges["p2-down"]) {
    state.menuIndex = (state.menuIndex + 1) % MATCHOVER_ITEMS.length;
  }

  if (edges.confirm || edges.back) {
    if (state.menuIndex === 0 || edges.back) {
      if (edges.confirm && state.menuIndex === 0) {
        // PLAY AGAIN
        startMatch(state, state.mode);
      } else if (edges.back) {
        // BACK goes to menu
        returnToTitle(state);
      }
    } else if (state.menuIndex === 1) {
      // MENU
      returnToTitle(state);
    }
  }
}

function returnToTitle(state: GameState): void {
  state.screen = "title";
  state.menuIndex = state.titleIndex;
  // Keep titleIndex and simTime as per specs
  state.resumeScreen = "playing";
  state.score = { p1: 0, p2: 0 };
  state.winner = null;
  state.receiver = "left";

  state.paddles.left.cy = 360;
  state.paddles.left.vy = 0;
  state.paddles.left.driven = false;
  state.paddles.left.drivenVy = 0;

  state.paddles.right.cy = 360;
  state.paddles.right.vy = 0;
  state.paddles.right.driven = false;
  state.paddles.right.drivenVy = 0;

  state.ai.tracking = true;
  state.ai.movement = true;

  if (state.ball) {
    state.ball.x = 640;
    state.ball.y = 360;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.ball.spin = 0;
    state.ball.held = true;
    state.ball.holdTimer = 1.0;
    state.ball.serveSign = Math.random() < 0.5 ? 1 : -1;
    state.ball.trail = [];
  }

  state.obstacles = [
    { index: 0, cx: 490, cy: 220 },
    { index: 1, cx: 790, cy: 500 },
  ];
}
