# Carom

Carom is a top-down paddle duel that runs entirely in the browser. Two paddles face each other across a dark field while a ball ricochets between them, off walls, and off obstacles in the middle of the field. A player scores when the ball passes behind their opponent's paddle.

Carom's defining mechanic is **spin**: the motion of a paddle at the moment it strikes the ball curves that ball's flight afterward. Paddles moving downward impart downward spin that curves the ball's arc downward over time. Upward motion curves it upward. The obstacles in the middle turn the open field into a bank-shot puzzle where the ball bounces off in unexpected directions.

## Installation

Carom requires Node.js 18 or later.

```bash
npm ci
```

This installs all dependencies. No additional setup or configuration is needed.

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The game will be available at `http://localhost:5173/` (or the URL shown in your terminal).

## Production Build

Build the complete static site for deployment:

```bash
npm run build
```

This produces a `dist/` directory with an `index.html` entry point that runs on any static file server. The entire game is self-contained with no external dependencies or API calls.

### Preview the Build

To test the production build locally:

```bash
npm run preview
```

## Running Tests

Run the test suite with coverage:

```bash
npm test
```

## Code Quality

Check TypeScript compilation:
```bash
npm run typecheck
```

Check code style:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

All checks must pass before submission.

## Controls

### Keyboard

- **P1 Up/Down**: W and S keys
- **P2 Up/Down**: Arrow Up and Arrow Down keys
- **Confirm Menu**: Enter or Space
- **Back/Cancel**: Escape
- **Pause**: P or Escape
- **Mute**: M

### Mouse and Touch

Menu items can be selected by clicking (mouse) or tapping (touch). Hover over an item to highlight it, then click or tap to confirm.

## Game Modes

**Solo**: Player one controls the left paddle; an AI opponent controls the right.

**Versus**: Two local players, player one with W/S, player two with Arrow keys.

**How to Play**: Instructions describing spin and obstacles.

## Scoring

First player to 11 points with a 2-point lead wins. At 10-10, play continues until someone has a 2-point advantage.

## Technical

- **Engine**: Custom browser runtime with frame loop, physics, and rendering
- **Language**: TypeScript
- **Build**: Vite
- **Testing**: Vitest
- **Graphics**: Canvas 2D
- **Audio**: Web Audio API (procedural synthesis)
- **No External Assets**: All visuals and sounds are generated in code
- **No Backend**: Fully client-side, runs entirely in the browser

## Project Structure

- `src/` — Game source code
  - `constants.ts` — All numeric specifications and game constants
  - `types.ts` — TypeScript type definitions
  - `main.ts` — Entry point
  - `game/` — Game state, physics, AI, and logic
  - `runtime/` — Canvas, input, audio, and frame loop
  - `ui/` — Menus, screens, and UI rendering
- `index.html` — Page and canvas element
- `vite.config.ts`, `tsconfig.json` — Build and type configuration

## Debugging

The game exposes a debug API at `window.__carom` for automation and testing:

```javascript
// Take a snapshot of the entire game state
const state = window.__carom.snapshot();

// Advance the game by 1 second (60 frames)
window.__carom.advance(1, 60);

// Set the ball position
window.__carom.setBallPosition(640, 360);

// Start a match in solo mode
window.__carom.reset();
window.__carom.setMode("solo");
window.__carom.setScreen("countdown");
```

See `specs/instrumentation.md` for the complete API.

## License

Carom is an original game created as part of a comprehensive browser gaming exercise.
