// Pointer and touch input handling for UI

export interface PointerInput {
  x: number;
  y: number;
  isDown: boolean;
  isPressed: boolean;
  isReleased: boolean;
}

export interface TouchInput {
  x: number;
  y: number;
  isPressed: boolean;
  isReleased: boolean;
}

export class PointerManager {
  private pointer: PointerInput = {
    x: 0,
    y: 0,
    isDown: false,
    isPressed: false,
    isReleased: false,
  };
  private touches: Map<number, TouchInput> = new Map();
  private logicalToCanvasScale: (x: number, y: number) => [number, number] = (
    x,
    y,
  ) => [x, y];

  constructor() {
    document.addEventListener("pointermove", this.handlePointerMove);
    document.addEventListener("pointerdown", this.handlePointerDown);
    document.addEventListener("pointerup", this.handlePointerUp);
    document.addEventListener("pointercancel", this.handlePointerCancel);

    document.addEventListener("touchmove", this.handleTouchMove);
    document.addEventListener("touchstart", this.handleTouchStart);
    document.addEventListener("touchend", this.handleTouchEnd);
    document.addEventListener("touchcancel", this.handleTouchCancel);
  }

  setScaleFunction(fn: (x: number, y: number) => [number, number]): void {
    this.logicalToCanvasScale = fn;
  }

  private handlePointerMove = (e: PointerEvent) => {
    const [x, y] = this.logicalToCanvasScale(e.clientX, e.clientY);
    this.pointer.x = x;
    this.pointer.y = y;
  };

  private handlePointerDown = (e: PointerEvent) => {
    const [x, y] = this.logicalToCanvasScale(e.clientX, e.clientY);
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.isDown = true;
    this.pointer.isPressed = true;
  };

  private handlePointerUp = (e: PointerEvent) => {
    const [x, y] = this.logicalToCanvasScale(e.clientX, e.clientY);
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.isDown = false;
    this.pointer.isReleased = true;
  };

  private handlePointerCancel = () => {
    this.pointer.isDown = false;
    this.pointer.isReleased = false;
    this.pointer.isPressed = false;
  };

  private handleTouchMove = (e: TouchEvent) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const [x, y] = this.logicalToCanvasScale(touch.clientX, touch.clientY);
      this.touches.set(touch.identifier, {
        x,
        y,
        isPressed: false,
        isReleased: false,
      });
    }
  };

  private handleTouchStart = (e: TouchEvent) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const [x, y] = this.logicalToCanvasScale(touch.clientX, touch.clientY);
      this.touches.set(touch.identifier, {
        x,
        y,
        isPressed: true,
        isReleased: false,
      });
    }
  };

  private handleTouchEnd = (e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const existing = this.touches.get(touch.identifier);
      if (existing) {
        const [x, y] = this.logicalToCanvasScale(touch.clientX, touch.clientY);
        this.touches.set(touch.identifier, {
          x,
          y,
          isPressed: false,
          isReleased: true,
        });
      }
    }
  };

  private handleTouchCancel = (_e: TouchEvent) => {
    // On cancel, clear all touches
    this.touches.clear();
  };

  update(): void {
    // Reset press/release flags for pointer
    this.pointer.isPressed = false;
    this.pointer.isReleased = false;

    // Reset press/release flags for touches
    this.touches.forEach((touch) => {
      touch.isPressed = false;
      touch.isReleased = false;
    });

    // Clean up released touches
    const toDelete: number[] = [];
    this.touches.forEach((touch, id) => {
      if (touch.isReleased) {
        toDelete.push(id);
      }
    });
    toDelete.forEach((id) => this.touches.delete(id));
  }

  getPointer(): PointerInput {
    return { ...this.pointer };
  }

  getTouches(): TouchInput[] {
    return Array.from(this.touches.values());
  }

  destroy(): void {
    document.removeEventListener("pointermove", this.handlePointerMove);
    document.removeEventListener("pointerdown", this.handlePointerDown);
    document.removeEventListener("pointerup", this.handlePointerUp);
    document.removeEventListener("pointercancel", this.handlePointerCancel);

    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchstart", this.handleTouchStart);
    document.removeEventListener("touchend", this.handleTouchEnd);
    document.removeEventListener("touchcancel", this.handleTouchCancel);
  }
}
