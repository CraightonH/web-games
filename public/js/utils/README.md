# Card Game Utilities

This directory contains reusable utilities for building card games.

## CardGame.js

Base class that all card games should extend. Provides common functionality:

### Methods

- `createDeck()` - Creates a standard 52-card deck with suits (♥, ♦, ♣, ♠) and ranks (A-K)
- `shuffleDeck()` - Fisher-Yates shuffle algorithm
- `drawCardFromDeck()` - Removes and returns a card from the deck
- `addCardToHand(card, player)` - Adds a card to player's or computer's hand
- `drawCard(player)` - Convenience method that draws from deck and adds to hand
- `createCardElement(card, faceUp)` - Creates a DOM element for a card
- `updateDeckCount()` - Updates the deck count display element

### Template Methods (must be implemented by subclass)

- `initializeGame()` - Game-specific initialization
- `updateDisplay()` - Updates the game board display
- `setupEventListeners()` - Sets up game-specific event handlers

### Usage

```javascript
class MyCardGame extends CardGame {
  constructor() {
    super();
    // Add game-specific properties
    this.initializeGame();
    this.setupEventListeners();
  }

  initializeGame() {
    this.createDeck();
    this.shuffleDeck();
    this.updateDeckCount();
    // Game-specific initialization
  }

  updateDisplay() {
    // Render cards, update UI, etc.
  }

  setupEventListeners() {
    // Add event listeners for user interaction
  }
}
```

## CardAnimations.js

Static utility class for card animations. All methods are static.

### Methods

#### `animateCardDraw(card, targetPlayer, callback, fast)`

Animates a card being drawn from the deck to a player's hand.

- `card` - The card object
- `targetPlayer` - 'player' or 'computer'
- `callback` - Function called when animation completes
- `fast` - Boolean, use faster animation (default: false)

```javascript
CardAnimations.animateCardDraw(drawnCard, 'player', () => {
  this.addCardToHand(drawnCard, 'player');
  this.updateDisplay();
}, true);
```

#### `animateCardTransfer(cards, fromPlayer, toPlayer, callback)`

Animates cards being transferred from one player to another.

- `cards` - Array of card objects
- `fromPlayer` - 'player' or 'computer'
- `toPlayer` - 'player' or 'computer'
- `callback` - Function called when all animations complete

```javascript
CardAnimations.animateCardTransfer(matchingCards, 'computer', 'player', () => {
  this.transferCards(matchingCards, 'player');
  this.updateDisplay();
});
```

#### `animatePairCollection(cards, player, callback)`

Animates cards being collected (e.g., pairs, sets) from hand to collection area.

- `cards` - Array of card objects
- `player` - 'player' or 'computer'
- `callback` - Function called when animation completes

```javascript
CardAnimations.animatePairCollection(pairCards, 'player', () => {
  console.log('Pair collected!');
});
```

## PairCollections.js

Optional utility for games that collect pairs/sets. Provides visual display and management of collected pairs.

### Initialization

```javascript
// In your game constructor
class MyCardGame extends CardGame {
  constructor() {
    super();
    // Initialize with visual pair display
    PairCollections.initialize(this, { showVisualPairs: true });
    // this.playerPairs and this.computerPairs are now arrays
  }
}

// Or without visual display (count only)
PairCollections.initialize(this, { showVisualPairs: false });
```

### Methods

#### `checkAndRemovePairs(hand, player, game)`

Checks for and removes pairs from a hand.

```javascript
PairCollections.checkAndRemovePairs(this.playerHand, 'player', this);
```

#### `displayPairs(elementId, pairsArray, game)`

Displays collected pairs visually (if enabled).

```javascript
PairCollections.displayPairs('player-pairs', this.playerPairs, this);
```

#### `animateCollectPair(pairCards, player, game, callback)`

Animates collecting a pair with removal from hand.

```javascript
PairCollections.animateCollectPair(pairCards, 'player', this, () => {
  console.log('Pair collected!');
});
```

#### `getPairCount(player, game)`

Get the total number of pairs collected.

```javascript
const count = PairCollections.getPairCount('player', this);
```

### Example Usage

**Go Fish** (with visual pairs):
```javascript
class GoFish extends CardGame {
  constructor() {
    super();
    PairCollections.initialize(this, { showVisualPairs: true });
    // ...
  }

  checkAndRemovePairs(hand, player) {
    PairCollections.checkAndRemovePairs(hand, player, this);
  }

  updateDisplay() {
    // ...
    PairCollections.displayPairs('player-pairs', this.playerPairs, this);
    PairCollections.displayPairs('computer-pairs', this.computerPairs, this);
  }
}
```

**Old Maid** (count only):
```javascript
class OldMaid extends CardGame {
  constructor() {
    super();
    // Old Maid just counts pairs, doesn't display them visually
    this.playerPairs = 0;
    this.computerPairs = 0;
    // Don't use PairCollections utility
  }
}
```

## CSS Files

### card-game-common.css

Common styles for all card games:
- Game board layout (`.game-board`, `.hand`, `.cards`)
- Card styling (`.card`, `.card-back`, `.card-rank`, `.card-suit`)
- Draw pile area (`.draw-pile-area`, `.deck-card`)
- Card animations (`.animated-card`, `@keyframes flipCard`, `@keyframes highlightDraw`)
- Collections display (`.collections-area`, `.pairs-display`, `.pair-group`)
- Interactive elements (`.requested-glow`)
- Game over prompt (`.game-over-prompt`, `.game-over-text`)

### Game-Specific CSS

Each game should have its own CSS file for game-specific styles (e.g., `go-fish.css`).

## Standard Game Layout

All card games should follow this consistent HTML structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>My Card Game - Kids Card Games</title>
    <link rel="stylesheet" href="/css/styles.css">
    <link rel="stylesheet" href="/css/card-game-common.css">
    <link rel="stylesheet" href="/css/my-game.css"> <!-- Game-specific styles -->
</head>
<body>
    <div class="container">
        <div class="game-container">
            <!-- STANDARD HEADER (all games must have this) -->
            <div class="header-controls">
                <a href="/" class="back-button">← Back to Games</a>
                <button id="new-game-btn" class="btn">New Game</button>
            </div>
            <h1>🎮 My Card Game 🎮</h1>

            <!-- GAME INFO SECTION (optional, game-specific) -->
            <div class="score">
                <!-- Score display, status info, etc. -->
            </div>

            <!-- GAME OVER PROMPT (recommended for consistency) -->
            <div id="game-over-prompt" class="game-over-prompt" style="display: none;">
                <div id="game-over-text" class="game-over-text"></div>
                <div id="game-over-score" class="game-over-score"></div>
            </div>

            <!-- GAME BOARD (game-specific layout) -->
            <div class="game-board">
                <!-- Your game's UI here -->
            </div>
        </div>
    </div>

    <!-- SCRIPTS (in this order) -->
    <script src="/js/utils/CardGame.js"></script>
    <script src="/js/utils/CardAnimations.js"></script>
    <script src="/js/utils/PairCollections.js"></script> <!-- If using pair collections -->
    <script src="/js/my-game.js"></script>
</body>
</html>
```

## Required HTML Elements

For basic card game functionality:

- `#player-hand` - Container for player's cards
- `#computer-hand` - Container for computer's cards
- `#deck-count` - Element showing number of cards in deck (optional)

For animations:

- `.deck-card` - The draw pile element (required for CardAnimations)

For pair collections (if using PairCollections utility):

- `#player-pairs` - Container for player's collected pairs
- `#computer-pairs` - Container for computer's collected pairs

## Example: Go Fish

See `/public/js/go-fish.js` for a complete example of a game using these utilities.
