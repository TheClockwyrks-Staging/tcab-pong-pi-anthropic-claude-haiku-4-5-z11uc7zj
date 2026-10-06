// Unit tests for game state

import { describe, it, expect } from "vitest";
import { createInitialState, parkBall, checkWinCondition } from "./state";

describe("Game State", () => {
  it("should create initial state", () => {
    const state = createInitialState();
    expect(state.screen).toBe("title");
    expect(state.mode).toBe("solo");
    expect(state.score.p1).toBe(0);
    expect(state.score.p2).toBe(0);
    expect(state.ball).not.toBeNull();
    expect(state.ball?.held).toBe(true);
    expect(state.obstacles.length).toBe(2);
  });

  it("should park ball at home position", () => {
    const state = createInitialState();
    state.ball!.x = 100;
    state.ball!.y = 200;
    state.ball!.vx = 50;
    state.ball!.vy = 60;

    parkBall(state);

    expect(state.ball!.x).toBe(640);
    expect(state.ball!.y).toBe(360);
    expect(state.ball!.vx).toBe(0);
    expect(state.ball!.vy).toBe(0);
    expect(state.ball!.held).toBe(true);
  });

  it("should check win condition correctly", () => {
    const state = createInitialState();

    // Not enough points
    state.score.p1 = 10;
    state.score.p2 = 10;
    expect(checkWinCondition(state)).toBeNull();

    // First player wins
    state.score.p1 = 11;
    state.score.p2 = 9;
    expect(checkWinCondition(state)).toBe("left");

    // Second player wins
    state.score.p1 = 10;
    state.score.p2 = 12;
    expect(checkWinCondition(state)).toBe("right");

    // Tied at 11-11, not won yet
    state.score.p1 = 11;
    state.score.p2 = 11;
    expect(checkWinCondition(state)).toBeNull();
  });
});
