/**
 * Base class for all card games
 * Provides common functionality like deck creation, shuffling, and hand management
 */
class CardGame {
  constructor() {
    this.deck = [];
    this.playerHand = [];
    this.computerHand = [];
    this.currentTurn = 'player';
    this.gameOver = false;
  }

  /**
   * Creates a standard 52-card deck
   */
  createDeck() {
    const suits = ['♥', '♦', '♣', '♠'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    this.deck = [];
    for (let suit of suits) {
      for (let rank of ranks) {
        this.deck.push({
          rank,
          suit,
          color: (suit === '♥' || suit === '♦') ? 'red' : 'black'
        });
      }
    }
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  /**
   * Draws a card from the deck
   * @returns {Object|null} The drawn card or null if deck is empty
   */
  drawCardFromDeck() {
    if (this.deck.length === 0) {
      return null;
    }
    return this.deck.pop();
  }

  /**
   * Adds a card to a player's hand
   * @param {Object} card - The card to add
   * @param {string} player - 'player' or 'computer'
   */
  addCardToHand(card, player) {
    if (player === 'player') {
      this.playerHand.push(card);
    } else {
      this.computerHand.push(card);
    }
  }

  /**
   * Draws a card from deck and adds to hand (convenience method)
   * @param {string} player - 'player' or 'computer'
   * @returns {Object|null} The drawn card
   */
  drawCard(player) {
    const card = this.drawCardFromDeck();
    if (card) {
      this.addCardToHand(card, player);
    }
    return card;
  }

  /**
   * Creates a card element for display
   * @param {Object} card - The card object
   * @param {boolean} faceUp - Whether to show the card face up
   * @returns {HTMLElement} The card element
   */
  createCardElement(card, faceUp = true) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';

    if (faceUp && card) {
      cardEl.classList.add(card.color);

      const rankEl = document.createElement('div');
      rankEl.className = 'card-rank';
      rankEl.textContent = card.rank;

      const suitEl = document.createElement('div');
      suitEl.className = 'card-suit';
      suitEl.textContent = card.suit;

      cardEl.appendChild(rankEl);
      cardEl.appendChild(suitEl);
    } else {
      cardEl.classList.add('card-back');
      cardEl.textContent = '🎴';
    }

    return cardEl;
  }

  /**
   * Updates the deck count display
   */
  updateDeckCount() {
    const deckCountEl = document.getElementById('deck-count');
    if (deckCountEl) {
      deckCountEl.textContent = this.deck.length;
    }
  }

  /**
   * Template method - to be overridden by subclasses
   */
  initializeGame() {
    throw new Error('initializeGame must be implemented by subclass');
  }

  /**
   * Template method - to be overridden by subclasses
   */
  updateDisplay() {
    throw new Error('updateDisplay must be implemented by subclass');
  }

  /**
   * Template method - to be overridden by subclasses
   */
  setupEventListeners() {
    throw new Error('setupEventListeners must be implemented by subclass');
  }
}
