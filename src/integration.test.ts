// Integration test - verifies the game can be loaded and basic operations work

import { describe, it, expect } from "vitest";
import { createInitialState } from "./game/state";
import { DebugSurface } from "./game/instrumentation";
import { updateBall } from "./game/physics";

describe("Game Integration", () => {
  it("should initialize game state", () => {
    const state = createInitialState();
    expect(state).toBeDefined();
    expect(state.screen).toBe("title");
    expect(state.ball).toBeDefined();
    expect(state.paddles).toBeDefined();
  });

  it("should allow debug surface operations", () => {
    const state = createInitialState();
    const debug = new DebugSurface(state);

    // Take a snapshot
    const snapshot = debug.snapshot();
    expect(snapshot.version).toBe(1);
    expect(snapshot.screen).toBe("title");
    expect(snapshot.score.p1).toBe(0);

    // Modify game through debug surface
    debug.setScore(5, 3);
    const updated = debug.snapshot();
    expect(updated.score.p1).toBe(5);
    expect(updated.score.p2).toBe(3);
  });

  it("should handle ball physics updates", () => {
    const state = createInitialState();
    const ball = state.ball;
    if (!ball) throw new Error("No ball");

    ball.held = false;
    ball.x = 640;
    ball.y = 360;
    ball.vx = 100;
    ball.vy = 0;

    const initialX = ball.x;
    updateBall(state, 0.1);

    // Ball should have moved
    expect(ball.x).toBeGreaterThan(initialX);
  });

  it("should track ball trail", () => {
    const state = createInitialState();
    const ball = state.ball;
    if (!ball) throw new Error("No ball");

    ball.held = false;
    ball.x = 640;
    ball.y = 360;
    ball.vx = 100;
    ball.vy = 0;

    updateBall(state, 0.01);
    expect(ball.trail.length).toBeGreaterThan(0);

    const firstSample = ball.trail[0];
    expect(firstSample).toHaveProperty("x");
    expect(firstSample).toHaveProperty("y");
    expect(firstSample).toHaveProperty("t");
  });

  it("should handle serve", () => {
    const state = createInitialState();
    if (!state.ball) throw new Error("No ball");

    // Start countdown
    state.screen = "countdown";
    state.ball.held = true;
    state.ball.holdTimer = 0.5;

    // Simulate countdown
    updateBall(state, 0.6);

    // Ball should be served
    expect(state.ball.held).toBe(false);
    expect(state.screen).toBe("playing");
    expect(state.ball.vx).not.toBe(0);
  });

  it("should score points", () => {
    const state = createInitialState();
    if (!state.ball) throw new Error("No ball");

    state.screen = "playing";
    state.ball.held = false;
    state.ball.x = 1290;
    state.ball.y = 360;
    state.ball.vx = 100;
    state.ball.vy = 0;

    const scoreBefore = state.score.p1;
    updateBall(state, 0.1);

    // Player 1 should have scored
    expect(state.score.p1).toBeGreaterThan(scoreBefore);
  });
});
