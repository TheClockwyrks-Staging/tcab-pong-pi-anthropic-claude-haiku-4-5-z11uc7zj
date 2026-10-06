// Unit tests for ball physics

import { describe, it, expect, beforeEach } from "vitest";
import { FIELD_W, FIELD_H, BALL_R, P1_X1, P2_X0 } from "../constants";
import { createInitialState } from "./state";
import { updateBall } from "./physics";

describe("Ball Physics", () => {
  let state: ReturnType<typeof createInitialState>;

  beforeEach(() => {
    state = createInitialState();
  });

  it("should advance ball position", () => {
    state.ball!.held = false;
    state.ball!.x = 640;
    state.ball!.y = 360;
    state.ball!.vx = 100;
    state.ball!.vy = 0;

    updateBall(state, 0.1);

    expect(state.ball!.x).toBeCloseTo(640 + 10, 0);
  });

  it("should bounce off top wall", () => {
    state.ball!.held = false;
    state.ball!.x = 640;
    state.ball!.y = BALL_R + 5;
    state.ball!.vx = 0;
    state.ball!.vy = -100;

    updateBall(state, 0.1);

    expect(state.ball!.vy).toBeGreaterThan(0);
  });

  it("should bounce off bottom wall", () => {
    state.ball!.held = false;
    state.ball!.x = 640;
    state.ball!.y = FIELD_H - BALL_R - 5;
    state.ball!.vx = 0;
    state.ball!.vy = 100;

    updateBall(state, 0.1);

    expect(state.ball!.vy).toBeLessThan(0);
  });

  it("should start serving when hold timer expires", () => {
    expect(state.ball!.held).toBe(true);

    updateBall(state, 0.5);
    expect(state.ball!.held).toBe(true);

    updateBall(state, 0.6); // Total 1.1 seconds
    expect(state.ball!.held).toBe(false);
    expect(state.screen).toBe("playing");
  });

  it("should add trail samples", () => {
    state.ball!.held = false;
    state.ball!.x = 640;
    state.ball!.y = 360;
    state.ball!.vx = 100;
    state.ball!.vy = 0;

    expect(state.ball!.trail.length).toBe(0);

    updateBall(state, 0.01);
    expect(state.ball!.trail.length).toBeGreaterThan(0);
  });
});
