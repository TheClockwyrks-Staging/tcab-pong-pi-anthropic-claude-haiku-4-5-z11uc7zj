// UI game state input handling

import { GameState } from "../types";
import { InputEdges } from "../runtime/input";

export function handleGameStateInput(
  state: GameState,
  edges: InputEdges,
): void {
  // Handle mute on all screens
  if (edges.mute) {
    state.muted = !state.muted;
  }

  // Handle pause/back on game screens
  if (
    (state.screen === "countdown" || state.screen === "playing") &&
    (edges.pause || edges.back)
  ) {
    state.resumeScreen = state.screen;
    state.screen = "paused";
    state.menuIndex = 0;
  }
}
