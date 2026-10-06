// Main game loop and orchestration

import { GameState } from "../types";
import { Renderer } from "./renderer";
import { InputManager } from "./input";
import { AudioManager } from "./audio";
import { PointerManager } from "./pointer";
import { ScreenRenderer } from "../ui/screen";
import { DebugSurface } from "../game/instrumentation";
import {
  updateBall,
  resetAudioFlags,
  updatePaddleVy,
  updatePaddleVyDriven,
} from "../game/physics";
import { updateAI } from "../game/ai";
import { handleGameStateInput } from "../ui/input";
import { handleMenuInput } from "../ui/menu";
import { PADDLE_SPEED } from "../constants";

export class GameLoop {
  private state: GameState;
  private renderer: Renderer;
  private inputManager: InputManager;
  private audioManager: AudioManager;
  private pointerManager: PointerManager;
  private screenRenderer: ScreenRenderer;
  private debugSurface: DebugSurface;
  private lastFrameTime = 0;
  private autoStep = true;
  private running = false;

  constructor(
    state: GameState,
    canvas: HTMLCanvasElement,
    debugSurface: DebugSurface,
  ) {
    this.state = state;
    this.renderer = new Renderer(canvas);
    this.inputManager = new InputManager();
    this.audioManager = new AudioManager();
    this.pointerManager = new PointerManager();
    this.screenRenderer = new ScreenRenderer(debugSurface);
    this.debugSurface = debugSurface;

    // Set the pointer manager's scale function based on renderer
    this.pointerManager.setScaleFunction((x, y) =>
      this.renderer.canvasToLogical(x, y),
    );
  }

  start(): void {
    this.running = true;
    this.lastFrameTime = performance.now();
    this.loop();
  }

  stop(): void {
    this.running = false;
  }

  private loop = (): void => {
    if (!this.running) return;

    const now = performance.now();
    const deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.016); // Cap at ~60fps
    this.lastFrameTime = now;

    if (this.autoStep) {
      this.update(deltaTime);
    }

    this.render();
    requestAnimationFrame(this.loop);
  };

  update(deltaTime: number): void {
    this.inputManager.update();
    this.pointerManager.update();
    const edges = this.inputManager.getEdges();
    const pointer = this.pointerManager.getPointer();
    const touches = this.pointerManager.getTouches();

    // Update sim time
    this.state.simTime += deltaTime;

    // Handle menu or game input
    if (
      this.state.screen === "title" ||
      this.state.screen === "howto" ||
      this.state.screen === "paused" ||
      this.state.screen === "matchover"
    ) {
      handleMenuInput(this.state, edges, pointer, touches, this.debugSurface);
    } else {
      handleGameStateInput(this.state, edges);
    }

    // Update paddles for current screen
    if (this.state.screen === "countdown" || this.state.screen === "playing") {
      // Update human paddles based on held keys
      if (this.state.mode === "solo") {
        // Solo: P1 uses both p1 and p2 controls
        const upHeld =
          this.inputManager.isHeld("p1-up") ||
          this.inputManager.isHeld("p2-up");
        const downHeld =
          this.inputManager.isHeld("p1-down") ||
          this.inputManager.isHeld("p2-down");
        const axis = (downHeld ? 1 : 0) - (upHeld ? 1 : 0);
        this.state.paddles.left.vy = axis * PADDLE_SPEED;
      } else {
        // Versus: Each player controls their own paddle
        const p1Up = this.inputManager.isHeld("p1-up") ? 1 : 0;
        const p1Down = this.inputManager.isHeld("p1-down") ? 1 : 0;
        this.state.paddles.left.vy = (p1Down - p1Up) * PADDLE_SPEED;

        const p2Up = this.inputManager.isHeld("p2-up") ? 1 : 0;
        const p2Down = this.inputManager.isHeld("p2-down") ? 1 : 0;
        this.state.paddles.right.vy = (p2Down - p2Up) * PADDLE_SPEED;
      }

      // Update AI if in solo mode
      if (this.state.mode === "solo") {
        updateAI(this.state, deltaTime);
      }

      // Integrate paddle positions
      if (!this.state.paddles.left.driven) {
        updatePaddleVy(this.state.paddles.left, deltaTime);
      } else {
        updatePaddleVyDriven(this.state.paddles.left, deltaTime);
      }

      if (!this.state.paddles.right.driven) {
        updatePaddleVy(this.state.paddles.right, deltaTime);
      } else {
        updatePaddleVyDriven(this.state.paddles.right, deltaTime);
      }

      // Reset audio flags
      resetAudioFlags();

      // Update ball physics
      updateBall(
        this.state,
        deltaTime,
        () => this.audioManager.playCue("paddle-hit"),
        () => this.audioManager.playCue("wall-bounce"),
        () => this.audioManager.playCue("obstacle-bounce"),
        () => this.audioManager.playCue("score"),
      );
    }

    // Update mute from input
    if (edges.mute) {
      this.state.muted = !this.state.muted;
      this.audioManager.setMuted(this.state.muted);
    }
  }

  advanceFrames(count: number, deltaTime: number): void {
    for (let i = 0; i < count; i++) {
      this.update(deltaTime / count);
    }
  }

  render(): void {
    const diagnostics: Record<string, string> = {
      screen: this.state.screen,
      mode: this.state.mode,
      "p1 score": this.state.score.p1.toString(),
      "p2 score": this.state.score.p2.toString(),
    };

    if (this.state.ball && !this.state.ball.held) {
      diagnostics["ball x"] = this.state.ball.x.toFixed(0);
      diagnostics["ball y"] = this.state.ball.y.toFixed(0);
      diagnostics["ball vx"] = this.state.ball.vx.toFixed(0);
      diagnostics["ball vy"] = this.state.ball.vy.toFixed(0);
      diagnostics["ball speed"] = Math.hypot(
        this.state.ball.vx,
        this.state.ball.vy,
      ).toFixed(0);
      diagnostics["ball spin"] = this.state.ball.spin.toFixed(0);
    }

    diagnostics["p1 cy"] = this.state.paddles.left.cy.toFixed(0);
    diagnostics["p1 vy"] = this.state.paddles.left.vy.toFixed(0);
    diagnostics["p2 cy"] = this.state.paddles.right.cy.toFixed(0);
    diagnostics["p2 vy"] = this.state.paddles.right.vy.toFixed(0);

    this.renderer.render(this.state, diagnostics);
    this.screenRenderer.renderScreen(this.state, this.renderer.ctx);
  }

  setAutoStep(enabled: boolean): void {
    this.autoStep = enabled;
  }

  getAutoStep(): boolean {
    return this.autoStep;
  }

  destroy(): void {
    this.stop();
    this.inputManager.destroy();
    this.audioManager.destroy();
    this.pointerManager.destroy();
  }
}
