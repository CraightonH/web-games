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

## HTML Structure

To use these utilities, include them in your game's HTML:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>My Card Game</title>
    <link rel="stylesheet" href="/css/styles.css">
    <link rel="stylesheet" href="/css/card-game-common.css">
    <link rel="stylesheet" href="/css/my-game.css">
</head>
<body>
    <!-- Game UI -->

    <script src="/js/utils/CardGame.js"></script>
    <script src="/js/utils/CardAnimations.js"></script>
    <script src="/js/my-game.js"></script>
</body>
</html>
```

## Required HTML Elements

For animations to work, your HTML must include:

- `.deck-card` - The draw pile element
- `#player-hand` - Container for player's cards
- `#computer-hand` - Container for computer's cards
- `#deck-count` - Element showing number of cards in deck (optional)
- `#player-pairs` - Container for player's collected pairs (if applicable)
- `#computer-pairs` - Container for computer's collected pairs (if applicable)

## Example: Go Fish

See `/public/js/go-fish.js` for a complete example of a game using these utilities.
