// AI opponent logic

import { GameState } from "../types";
import {
  AI_SPEED,
  AI_REACT,
  AI_DEADZONE,
  AI_HOME_Y,
  AI_HOME_DEADZONE,
} from "../constants";

export function updateAI(state: GameState, dt: number): void {
  if (state.mode !== "solo") return;
  if (!state.ai.tracking || !state.ai.movement) {
    // Apply disabled faculties
    if (!state.ai.movement) {
      state.paddles.right.vy = 0;
    }
    return;
  }

  const paddle = state.paddles.right;
  let target = AI_HOME_Y;
  let deadzone = AI_HOME_DEADZONE;

  // Determine target based on ball
  if (state.screen === "playing" && state.ball && state.ai.tracking) {
    if (state.ball.vx > 0) {
      // Ball coming toward AI
      target = state.ball.y - state.ball.vy * AI_REACT;
      deadzone = AI_DEADZONE;
    }
  }

  // Calculate velocity
  const diff = target - paddle.cy;
  if (Math.abs(diff) <= deadzone) {
    paddle.vy = 0;
  } else {
    const sign = diff > 0 ? 1 : -1;
    paddle.vy = sign * Math.min(AI_SPEED, Math.abs(diff) / dt);
  }
}
