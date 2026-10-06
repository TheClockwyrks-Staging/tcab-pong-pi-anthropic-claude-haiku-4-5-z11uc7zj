# Carom

Carom is a top-down paddle duel for the browser where two players face off across a dark field with a ball ricocheting between them. One player or an AI opponent controls the right paddle while player one controls the left, creating an intense back-and-forth rally.

The defining mechanic is spin: when a paddle strikes the ball, the paddle's motion at that moment curves the ball's subsequent flight. A downward-moving paddle imparts downward spin, causing the ball to arc downward over time. An upward-moving paddle curves it upward. A stationary paddle leaves the ball's flight unchanged. This creates a physics-based gameplay where paddle control directly affects ball trajectory.

The field contains two fixed obstacles in the middle—rounded rectangles that act as bank-shot puzzles. The ball bounces off these obstacles, opening up complex rally patterns and strategic positioning. Players must predict where the ball will travel after bouncing off an obstacle and move their paddle to intercept it, building extended rallies that test reaction time and spatial reasoning.

The match plays first to 11 points with a 2-point lead. When the ball passes behind your opponent's paddle, you score. Each rally begins with a serve that travels at a fixed angle toward the receiver, with the opening direction drawn randomly. The paddles move vertically only, constrained to stay within the field, so positioning and timing are everything.

Carom ships with solo mode against an AI opponent, versus mode for two local players, and a complete menu system. Every visual element—paddles, ball, obstacles, net, and scores—is drawn on a single canvas with no external assets, making the game completely self-contained and instantly playable in any browser.
