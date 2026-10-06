// Screen rendering and menu UI

import { GameState } from "../types";
import {
  FIELD_W,
  FIELD_H,
  TITLE_TEXT,
  TITLE_ITEMS,
  PAUSE_ITEMS,
  MATCHOVER_ITEMS,
} from "../constants";
import { DebugSurface } from "../game/instrumentation";

export class ScreenRenderer {
  private debugSurface: DebugSurface;

  constructor(debugSurface: DebugSurface) {
    this.debugSurface = debugSurface;
  }

  renderScreen(state: GameState, ctx: CanvasRenderingContext2D): void {
    switch (state.screen) {
      case "title":
        this.renderTitle(state, ctx);
        break;
      case "howto":
        this.renderHowto(state, ctx);
        break;
      case "countdown":
        this.renderCountdown(state, ctx);
        break;
      case "playing":
        // Game field is already drawn
        break;
      case "paused":
        this.renderPaused(state, ctx);
        break;
      case "matchover":
        this.renderMatchover(state, ctx);
        break;
    }
  }

  private renderTitle(state: GameState, ctx: CanvasRenderingContext2D): void {
    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);

    // Draw title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px Arial";
    ctx.textAlign = "center";
    ctx.fillText(TITLE_TEXT, FIELD_W / 2, 120);

    // Draw menu items
    this.drawMenu(state, ctx, TITLE_ITEMS, 220, 100);
  }

  private renderHowto(state: GameState, ctx: CanvasRenderingContext2D): void {
    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);

    // Draw title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("HOW TO PLAY", FIELD_W / 2, 80);

    // Draw instructions
    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";

    const instructions = [
      "Controls:",
      "P1: W/S to move paddle",
      "P2: Arrow Up/Down to move paddle",
      "",
      "Spin: When you hit the ball, your paddle's",
      "motion curves its flight.",
      "",
      "Obstacles: Bank shots around the middle",
      "obstacles create complex rallies.",
      "",
      "First to 11 (with 2-point lead) wins!",
      "",
      "Press ENTER or SPACE to continue",
    ];

    let y = 150;
    instructions.forEach((line) => {
      ctx.fillText(line, 60, y);
      y += 30;
    });

    // Draw back button
    this.drawMenu(state, ctx, ["BACK"], 600, 60);
  }

  private renderCountdown(state: GameState, ctx: CanvasRenderingContext2D): void {
    if (!state.ball) return;

    const seconds = Math.ceil(state.ball.holdTimer);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px Arial";
    ctx.textAlign = "center";
    ctx.fillText(seconds.toString(), FIELD_W / 2, FIELD_H / 2 + 30);
  }

  private renderPaused(state: GameState, ctx: CanvasRenderingContext2D): void {
    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);

    // Draw title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", FIELD_W / 2, 150);

    // Draw menu items
    this.drawMenu(state, ctx, PAUSE_ITEMS, 250, 100);
  }

  private renderMatchover(state: GameState, ctx: CanvasRenderingContext2D): void {
    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, FIELD_W, FIELD_H);

    // Draw winner
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 64px Arial";
    ctx.textAlign = "center";
    const winnerText = state.winner === "left" ? "PLAYER 1 WINS" : "PLAYER 2 WINS";
    ctx.fillText(winnerText, FIELD_W / 2, 120);

    // Draw final score
    ctx.fillStyle = "#ffffff";
    ctx.font = "48px Arial";
    ctx.fillText(
      `${state.score.p1} - ${state.score.p2}`,
      FIELD_W / 2,
      200,
    );

    // Draw menu items
    this.drawMenu(state, ctx, MATCHOVER_ITEMS, 280, 100);
  }

  private drawMenu(
    state: GameState,
    ctx: CanvasRenderingContext2D,
    items: readonly string[],
    startY: number,
    itemHeight: number,
  ): void {
    const itemWidth = 200;
    ctx.font = "32px Arial";
    ctx.textAlign = "center";

    this.debugSurface.clearMenuItemRects();

    items.forEach((item, index) => {
      const y = startY + index * itemHeight;
      const itemRect = {
        x: FIELD_W / 2 - itemWidth / 2,
        y: y - 30,
        w: itemWidth,
        h: 50,
      };
      this.debugSurface.setMenuItemRect(index, itemRect);

      if (index === state.menuIndex) {
        ctx.fillStyle = "#ffd700";
        ctx.fillRect(itemRect.x, itemRect.y, itemRect.w, itemRect.h);
        ctx.fillStyle = "#000000";
      } else {
        ctx.fillStyle = "#ffffff";
      }

      ctx.fillText(item, FIELD_W / 2, y + 10);
    });
  }
}
