class OldMaid extends CardGame {
  constructor() {
    super();
    // Initialize pair collections with visual display
    PairCollections.initialize(this, { showVisualPairs: true });

    this.initializeGame();
    this.setupEventListeners();
  }

  initializeGame() {
    // Create standard deck then add Old Maid card
    this.createDeck();

    // Add Old Maid card (don't remove any cards - we want 52 + 1 = 53 total)
    this.deck.push({ rank: 'OLD MAID', suit: '👵', color: 'black', isOldMaid: true });

    this.shuffleDeck();
    this.dealCards();
    this.checkForInitialPairs();
    this.updateDisplay();
  }

  dealCards() {
    let currentPlayer = 0;
    while (this.deck.length > 0) {
      if (currentPlayer === 0) {
        this.playerHand.push(this.deck.pop());
      } else {
        this.computerHand.push(this.deck.pop());
      }
      currentPlayer = 1 - currentPlayer;
    }
  }

  checkForInitialPairs() {
    this.removeAllPairs(this.playerHand, 'player');
    this.removeAllPairs(this.computerHand, 'computer');
  }

  shuffleHand(hand) {
    // Fisher-Yates shuffle for the hand
    for (let i = hand.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [hand[i], hand[j]] = [hand[j], hand[i]];
    }
  }

  removeAllPairs(hand, player) {
    let foundPair = true;

    while (foundPair) {
      foundPair = false;

      for (let i = 0; i < hand.length; i++) {
        if (hand[i].isOldMaid) continue;

        for (let j = i + 1; j < hand.length; j++) {
          if (hand[j].isOldMaid) continue;

          if (hand[i].rank === hand[j].rank) {
            // Found a pair - remove from hand and add to pairs collection
            const card1 = hand.splice(j, 1)[0];
            const card2 = hand.splice(i, 1)[0];

            // Add to pairs array for visual display
            const pairObj = {
              rank: card1.rank,
              cards: [card1, card2]
            };

            if (player === 'player') {
              this.playerPairs.push(pairObj);
            } else {
              this.computerPairs.push(pairObj);
            }

            foundPair = true;
            break;
          }
        }

        if (foundPair) break;
      }
    }
  }

  playerDrawsCard(cardIndex) {
    if (this.gameOver || this.currentTurn !== 'player' || this.computerHand.length === 0) {
      return;
    }

    const drawnCard = this.computerHand.splice(cardIndex, 1)[0];
    this.updateDisplay();

    // Animate the card transfer from computer to player
    CardAnimations.animateCardTransfer([drawnCard], 'computer', 'player', () => {
      this.playerHand.push(drawnCard);
      this.removeAllPairs(this.playerHand, 'player');
      this.currentTurn = 'computer';
      this.updateDisplay();

      // Check game over after a brief delay to allow UI to update
      setTimeout(() => {
        if (this.checkGameOver()) return;
        this.computerTurn();
      }, 1500);
    });
  }

  computerTurn() {
    if (this.gameOver || this.currentTurn !== 'computer' || this.playerHand.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * this.playerHand.length);
    const drawnCard = this.playerHand.splice(randomIndex, 1)[0];
    this.updateDisplay();

    // Animate the card transfer from player to computer
    CardAnimations.animateCardTransfer([drawnCard], 'player', 'computer', () => {
      this.computerHand.push(drawnCard);

      // Shuffle computer's hand so the drawn card isn't always at the end
      this.shuffleHand(this.computerHand);

      this.removeAllPairs(this.computerHand, 'computer');
      this.currentTurn = 'player';
      this.updateDisplay();

      // Check game over after a brief delay to allow UI to update
      setTimeout(() => {
        this.checkGameOver();
      }, 500);
    });
  }

  checkGameOver() {
    const totalCards = this.playerHand.length + this.computerHand.length;

    if (totalCards === 1) {
      this.gameOver = true;

      // Update display to flip the computer's Old Maid if they have it
      this.updateDisplay();

      const gameOverPrompt = document.getElementById('game-over-prompt');
      const gameOverText = document.getElementById('game-over-text');
      const gameOverScore = document.getElementById('game-over-score');

      if (this.playerHand.length === 1 && this.playerHand[0].isOldMaid) {
        gameOverText.textContent = '😢 You Lose! 👵';
        gameOverText.className = 'game-over-text loser';
        gameOverScore.textContent = `You're stuck with the Old Maid! Computer: ${this.computerPairs.length} pairs | You: ${this.playerPairs.length} pairs`;
      } else if (this.computerHand.length === 1 && this.computerHand[0].isOldMaid) {
        gameOverText.textContent = '🎉 You Win! 🎉';
        gameOverText.className = 'game-over-text winner';
        gameOverScore.textContent = `Computer is stuck with the Old Maid! You: ${this.playerPairs.length} pairs | Computer: ${this.computerPairs.length} pairs`;
      }

      gameOverPrompt.style.display = 'block';

      return true;
    }

    return false;
  }

  updateDisplay() {
    const playerHandEl = document.getElementById('player-hand');
    const computerHandEl = document.getElementById('computer-hand');
    const computerHandCount = document.getElementById('computer-hand-count');
    const playerHandArea = document.getElementById('player-hand-area');
    const computerHandArea = document.getElementById('computer-hand-area');

    playerHandEl.innerHTML = '';
    this.playerHand.forEach(card => {
      const cardEl = this.createCardElement(card, true);
      playerHandEl.appendChild(cardEl);
    });

    computerHandEl.innerHTML = '';
    for (let i = 0; i < this.computerHand.length; i++) {
      // Show computer's card face-up if game is over and it's the Old Maid
      const showFace = this.gameOver && this.computerHand[i].isOldMaid;
      const cardEl = this.createCardElement(showFace ? this.computerHand[i] : null, showFace);
      if (this.currentTurn === 'player' && !this.gameOver) {
        cardEl.addEventListener('click', ((cardIndex) => {
          return () => this.playerDrawsCard(cardIndex);
        })(i));
        cardEl.style.cursor = 'pointer';
      }
      computerHandEl.appendChild(cardEl);
    }

    computerHandCount.textContent = this.computerHand.length;

    // Update turn indicators
    if (this.currentTurn === 'player' && !this.gameOver) {
      computerHandArea.classList.add('active-turn');
      playerHandArea.classList.remove('active-turn');
    } else if (this.currentTurn === 'computer' && !this.gameOver) {
      playerHandArea.classList.add('active-turn');
      computerHandArea.classList.remove('active-turn');
    } else {
      playerHandArea.classList.remove('active-turn');
      computerHandArea.classList.remove('active-turn');
    }

    // Display pairs visually
    PairCollections.displayPairs('player-pairs', this.playerPairs, this);
    PairCollections.displayPairs('computer-pairs', this.computerPairs, this);
  }

  createCardElement(card, showFace) {
    // Handle Old Maid card specially
    if (showFace && card && card.isOldMaid) {
      const cardEl = document.createElement('div');
      cardEl.className = 'card black old-maid-card';
      const rankEl = document.createElement('div');
      rankEl.style.fontSize = '2em';
      rankEl.textContent = '👵';
      cardEl.appendChild(rankEl);
      return cardEl;
    }

    // Use parent class method for normal cards
    return super.createCardElement(card, showFace);
  }

  setupEventListeners() {
    document.getElementById('new-game-btn').addEventListener('click', () => {
      this.playerHand = [];
      this.computerHand = [];
      this.playerPairs = [];
      this.computerPairs = [];
      this.currentTurn = 'player';
      this.gameOver = false;
      document.getElementById('game-over-prompt').style.display = 'none';
      this.initializeGame();
    });
  }
}

const game = new OldMaid();
