// Input handling

import { Input } from "../types";

export interface InputEdges extends Input {}

const KEY_BINDINGS: Record<string, keyof Input> = {
  KeyW: "p1-up",
  KeyS: "p1-down",
  ArrowUp: "p2-up",
  ArrowDown: "p2-down",
  Enter: "confirm",
  Space: "confirm",
  Escape: "pause", // Note: Escape also triggers "back"
  KeyP: "pause",
  KeyM: "mute",
};

export class InputManager {
  private current: Input = {
    "p1-up": false,
    "p1-down": false,
    "p2-up": false,
    "p2-down": false,
    confirm: false,
    back: false,
    pause: false,
    mute: false,
  };

  private previous: Input = { ...this.current };
  private edges: InputEdges = { ...this.current };

  constructor() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const action = KEY_BINDINGS[e.code];
    if (action) {
      this.current[action] = true;
      if (e.code === "Escape") {
        this.current.back = true;
      }
      e.preventDefault();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const action = KEY_BINDINGS[e.code];
    if (action) {
      this.current[action] = false;
      if (e.code === "Escape") {
        this.current.back = false;
      }
      e.preventDefault();
    }
  };

  update(): void {
    // Calculate edges (transitions from false to true)
    this.edges = {
      "p1-up": !this.previous["p1-up"] && this.current["p1-up"],
      "p1-down": !this.previous["p1-down"] && this.current["p1-down"],
      "p2-up": !this.previous["p2-up"] && this.current["p2-up"],
      "p2-down": !this.previous["p2-down"] && this.current["p2-down"],
      confirm: !this.previous.confirm && this.current.confirm,
      back: !this.previous.back && this.current.back,
      pause: !this.previous.pause && this.current.pause,
      mute: !this.previous.mute && this.current.mute,
    };

    this.previous = { ...this.current };
  }

  isHeld(action: keyof Input): boolean {
    return this.current[action];
  }

  isPressed(action: keyof Input): boolean {
    return this.edges[action];
  }

  getCurrentState(): Input {
    return { ...this.current };
  }

  getEdges(): InputEdges {
    return { ...this.edges };
  }

  destroy(): void {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);
  }
}
