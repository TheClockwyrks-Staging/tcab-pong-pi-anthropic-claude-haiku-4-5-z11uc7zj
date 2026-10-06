// Menu input and interaction

import { GameState } from "../types";
import { InputEdges } from "../runtime/input";
import { PointerInput, TouchInput } from "../runtime/pointer";
import { startMatch } from "../game/state";
import {
  TITLE_ITEMS,
  PAUSE_ITEMS,
  MATCHOVER_ITEMS,
  FIELD_CY,
  FIELD_CX,
  HOLD_TIME,
  OBSTACLE_CENTERS,
} from "../constants";
import { DebugSurface } from "../game/instrumentation";

export function handleMenuInput(
  state: GameState,
  edges: InputEdges,
  pointer: PointerInput,
  touches: TouchInput[],
  debugSurface: DebugSurface,
): void {
  // Get menu items for current screen
  let menuItems: readonly string[];
  switch (state.screen) {
    case "title":
      menuItems = TITLE_ITEMS;
      break;
    case "howto":
      menuItems = ["BACK"];
      break;
    case "paused":
      menuItems = PAUSE_ITEMS;
      break;
    case "matchover":
      menuItems = MATCHOVER_ITEMS;
      break;
    default:
      return;
  }

  // Handle pointer and touch input for menu items
  let pointerSelection = -1;
  let pointerConfirm = false;

  // Check pointer over menu items
  for (let i = 0; i < menuItems.length; i++) {
    const rect = debugSurface.menuItemRect(i);
    if (!rect) continue;

    if (
      pointer.x >= rect.x &&
      pointer.x < rect.x + rect.w &&
      pointer.y >= rect.y &&
      pointer.y < rect.y + rect.h
    ) {
      pointerSelection = i;
      if (pointer.isReleased) {
        pointerConfirm = true;
      }
      break;
    }
  }

  // Check touch input for menu items
  let touchSelection = -1;
  let touchConfirm = false;

  for (const touch of touches) {
    for (let i = 0; i < menuItems.length; i++) {
      const rect = debugSurface.menuItemRect(i);
      if (!rect) continue;

      if (
        touch.x >= rect.x &&
        touch.x < rect.x + rect.w &&
        touch.y >= rect.y &&
        touch.y < rect.y + rect.h
      ) {
        touchSelection = i;
        if (touch.isReleased) {
          touchConfirm = true;
        }
        break;
      }
    }
  }

  // Apply keyboard input
  if (edges["p1-up"] || edges["p2-up"]) {
    state.menuIndex =
      (state.menuIndex - 1 + menuItems.length) % menuItems.length;
  } else if (edges["p1-down"] || edges["p2-down"]) {
    state.menuIndex = (state.menuIndex + 1) % menuItems.length;
  }

  // Apply pointer/touch selection
  if (pointerSelection >= 0) {
    state.menuIndex = pointerSelection;
  } else if (touchSelection >= 0) {
    state.menuIndex = touchSelection;
  }

  // Handle confirm
  let shouldConfirm = false;
  if (edges.confirm) {
    shouldConfirm = true;
  } else if (pointerConfirm) {
    shouldConfirm = true;
  } else if (touchConfirm) {
    shouldConfirm = true;
  }

  if (shouldConfirm) {
    handleMenuConfirm(state, menuItems);
  }

  // Handle back/pause
  if (state.screen === "paused" && (edges.pause || edges.back)) {
    state.screen = state.resumeScreen;
  } else if (state.screen === "title" && edges.back) {
    // No-op
  } else if (state.screen === "howto" && edges.back) {
    state.screen = "title";
    state.menuIndex = state.titleIndex;
  } else if (state.screen === "matchover" && edges.back) {
    returnToTitle(state);
  }
}

function handleMenuConfirm(
  state: GameState,
  menuItems: readonly string[],
): void {
  const item = menuItems[state.menuIndex];

  switch (state.screen) {
    case "title":
      if (item === "SOLO") {
        state.titleIndex = state.menuIndex;
        startMatch(state, "solo");
      } else if (item === "VERSUS") {
        state.titleIndex = state.menuIndex;
        startMatch(state, "versus");
      } else if (item === "HOW TO PLAY") {
        state.titleIndex = state.menuIndex;
        state.screen = "howto";
        state.menuIndex = 0;
      }
      break;

    case "howto":
      state.screen = "title";
      state.menuIndex = state.titleIndex;
      break;

    case "paused":
      if (item === "RESUME") {
        state.screen = state.resumeScreen;
      } else if (item === "RESTART") {
        startMatch(state, state.mode);
      } else if (item === "QUIT TO MENU") {
        returnToTitle(state);
      }
      break;

    case "matchover":
      if (item === "PLAY AGAIN") {
        startMatch(state, state.mode);
      } else if (item === "MENU") {
        returnToTitle(state);
      }
      break;
  }
}

function returnToTitle(state: GameState): void {
  state.screen = "title";
  state.menuIndex = state.titleIndex;
  state.resumeScreen = "playing";
  state.score = { p1: 0, p2: 0 };
  state.winner = null;
  state.receiver = "left";

  state.paddles.left.cy = FIELD_CY;
  state.paddles.left.vy = 0;
  state.paddles.left.driven = false;
  state.paddles.left.drivenVy = 0;

  state.paddles.right.cy = FIELD_CY;
  state.paddles.right.vy = 0;
  state.paddles.right.driven = false;
  state.paddles.right.drivenVy = 0;

  state.ai.tracking = true;
  state.ai.movement = true;

  if (state.ball) {
    state.ball.x = FIELD_CX;
    state.ball.y = FIELD_CY;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.ball.spin = 0;
    state.ball.held = true;
    state.ball.holdTimer = HOLD_TIME;
    state.ball.serveSign = Math.random() < 0.5 ? 1 : -1;
    state.ball.trail = [];
  }

  state.obstacles = [
    { index: 0, cx: OBSTACLE_CENTERS[0][0], cy: OBSTACLE_CENTERS[0][1] },
    { index: 1, cx: OBSTACLE_CENTERS[1][0], cy: OBSTACLE_CENTERS[1][1] },
  ];
}
