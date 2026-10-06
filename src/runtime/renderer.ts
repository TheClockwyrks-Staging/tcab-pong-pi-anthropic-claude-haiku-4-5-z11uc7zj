// Canvas rendering and fitting

import { GameState } from "../types";
import {
  FIELD_W,
  FIELD_H,
  BALL_R,
  PADDLE_W,
  PADDLE_H,
  PADDLE_HALF,
  P1_X0,
  P2_X0,
  OBSTACLE_W,
  OBSTACLE_H,
  NET_X,
  OBSTACLE_HW,
  OBSTACLE_HH,
} from "../constants";

export class Renderer {
  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  private scale = 1;
  private offsetX = 0;
  private offsetY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    window.addEventListener("resize", () => this.fit());
    this.fit();
  }

  private fit(): void {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Calculate scale to fit field while preserving aspect ratio
    const scaleX = w / FIELD_W;
    const scaleY = h / FIELD_H;
    this.scale = Math.min(scaleX, scaleY) * dpr;

    const scaledW = FIELD_W * this.scale;
    const scaledH = FIELD_H * this.scale;

    this.offsetX = (w * dpr - scaledW) / 2;
    this.offsetY = (h * dpr - scaledH) / 2;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;

    this.ctx.scale(this.scale, this.scale);
    this.ctx.translate(this.offsetX / this.scale, this.offsetY / this.scale);
  }

  logicalToCanvas(x: number, y: number): [number, number] {
    return [x * this.scale + this.offsetX, y * this.scale + this.offsetY];
  }

  canvasToLogical(x: number, y: number): [number, number] {
    return [(x - this.offsetX) / this.scale, (y - this.offsetY) / this.scale];
  }

  render(state: GameState, diagnostics?: Record<string, string>): void {
    // Clear canvas
    this.ctx.fillStyle = "#1a1a2e";
    this.ctx.fillRect(0, 0, FIELD_W, FIELD_H);

    // Draw field elements
    this.drawNet();
    this.drawObstacles(state);
    this.drawPaddles(state);
    if (state.ball) {
      this.drawBall(state.ball);
    }

    // Draw UI based on screen
    this.drawScores(state);
    this.drawModeLabel(state);
    this.drawScreen();

    // Draw diagnostics if provided
    if (diagnostics) {
      this.drawDiagnostics(diagnostics);
    }
  }

  private drawNet(): void {
    this.ctx.strokeStyle = "rgba(200, 200, 200, 0.3)";
    this.ctx.setLineDash([5, 5]);
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(NET_X, 0);
    this.ctx.lineTo(NET_X, FIELD_H);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  private drawObstacles(state: GameState): void {
    state.obstacles.forEach((obstacle) => {
      this.ctx.fillStyle = "#ff6b9d";
      this.ctx.beginPath();
      this.ctx.roundRect(
        obstacle.cx - OBSTACLE_HW,
        obstacle.cy - OBSTACLE_HH,
        OBSTACLE_W,
        OBSTACLE_H,
        3,
      );
      this.ctx.fill();
    });
  }

  private drawPaddles(state: GameState): void {
    // Left paddle
    this.ctx.fillStyle = "#00d9ff";
    this.ctx.beginPath();
    this.ctx.roundRect(
      P1_X0,
      state.paddles.left.cy - PADDLE_HALF,
      PADDLE_W,
      PADDLE_H,
      3,
    );
    this.ctx.fill();

    // Right paddle
    this.ctx.fillStyle = "#ffd700";
    this.ctx.beginPath();
    this.ctx.roundRect(
      P2_X0,
      state.paddles.right.cy - PADDLE_HALF,
      PADDLE_W,
      PADDLE_H,
      3,
    );
    this.ctx.fill();
  }

  private drawBall(ball: NonNullable<GameState["ball"]>): void {
    // Draw trail
    if (ball.trail.length > 1) {
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(ball.trail[0].x, ball.trail[0].y);
      for (let i = 1; i < ball.trail.length; i++) {
        this.ctx.lineTo(ball.trail[i].x, ball.trail[i].y);
      }
      this.ctx.stroke();
    }

    // Draw ball
    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawScores(state: GameState): void {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 32px Arial";
    this.ctx.textAlign = "right";
    this.ctx.fillText(state.score.p1.toString(), FIELD_W / 2 - 40, 50);
    this.ctx.textAlign = "left";
    this.ctx.fillText(state.score.p2.toString(), FIELD_W / 2 + 40, 50);
  }

  private drawModeLabel(state: GameState): void {
    if (state.screen === "playing" || state.screen === "countdown") {
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      this.ctx.font = "14px Arial";
      this.ctx.textAlign = "center";
      const label = state.mode === "solo" ? "SOLO" : "VERSUS";
      this.ctx.fillText(label, FIELD_W / 2, FIELD_H - 20);
    }
  }

  private drawScreen(): void {
    // Screens are drawn by the UI system
  }

  private drawDiagnostics(diagnostics: Record<string, string>): void {
    this.ctx.fillStyle = "#00ff00";
    this.ctx.font = "12px monospace";
    this.ctx.textAlign = "left";

    let y = 20;
    for (const [key, value] of Object.entries(diagnostics)) {
      this.ctx.fillText(`${key}: ${value}`, 10, y);
      y += 15;
    }
  }

  renderMenu(menuItems: string[], title: string, highlightedIndex: number): void {
    // Draw semi-transparent overlay
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, FIELD_W, FIELD_H);

    // Draw title
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 48px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(title, FIELD_W / 2, 150);

    // Draw menu items
    this.ctx.font = "32px Arial";
    const itemHeight = 80;
    const startY = 250;

    menuItems.forEach((item, index) => {
      const y = startY + index * itemHeight;

      if (index === highlightedIndex) {
        this.ctx.fillStyle = "#ffd700";
        this.ctx.fillRect(FIELD_W / 2 - 150, y - 30, 300, 50);
        this.ctx.fillStyle = "#000000";
      } else {
        this.ctx.fillStyle = "#ffffff";
      }

      this.ctx.textAlign = "center";
      this.ctx.fillText(item, FIELD_W / 2, y);
    });
  }
}
