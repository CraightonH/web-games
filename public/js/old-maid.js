class OldMaid {
  constructor() {
    this.deck = [];
    this.playerHand = [];
    this.computerHand = [];
    this.playerPairs = 0;
    this.computerPairs = 0;
    this.currentTurn = 'player';
    this.gameOver = false;

    this.initializeGame();
    this.setupEventListeners();
  }

  initializeGame() {
    this.createDeck();
    this.shuffleDeck();
    this.dealCards();
    this.checkForInitialPairs();
    this.updateDisplay();
    this.showMessage("Game started! Click a card from the computer's hand to draw it.", "info");
  }

  createDeck() {
    const suits = ['♥', '♦', '♣', '♠'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    this.deck = [];
    for (let suit of suits) {
      for (let rank of ranks) {
        this.deck.push({ rank, suit, color: (suit === '♥' || suit === '♦') ? 'red' : 'black' });
      }
    }

    const queenOfSpadesIndex = this.deck.findIndex(card => card.rank === 'Q' && card.suit === '♠');
    if (queenOfSpadesIndex !== -1) {
      this.deck.splice(queenOfSpadesIndex, 1);
    }

    this.deck.push({ rank: 'OLD MAID', suit: '👵', color: 'black', isOldMaid: true });
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
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

  removeAllPairs(hand, player) {
    let foundPair = true;

    while (foundPair) {
      foundPair = false;

      for (let i = 0; i < hand.length; i++) {
        if (hand[i].isOldMaid) continue;

        for (let j = i + 1; j < hand.length; j++) {
          if (hand[j].isOldMaid) continue;

          if (hand[i].rank === hand[j].rank) {
            hand.splice(j, 1);
            hand.splice(i, 1);

            if (player === 'player') {
              this.playerPairs++;
            } else {
              this.computerPairs++;
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
    this.playerHand.push(drawnCard);

    if (drawnCard.isOldMaid) {
      this.showMessage("Oh no! You drew the Old Maid! 👵", "error");
    } else {
      this.showMessage(`You drew a ${drawnCard.rank}${drawnCard.suit}`, "info");
    }

    this.removeAllPairs(this.playerHand, 'player');
    this.updateDisplay();

    if (this.checkGameOver()) return;

    this.currentTurn = 'computer';
    setTimeout(() => this.computerTurn(), 1500);
  }

  computerTurn() {
    if (this.gameOver || this.currentTurn !== 'computer' || this.playerHand.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * this.playerHand.length);
    const drawnCard = this.playerHand.splice(randomIndex, 1)[0];
    this.computerHand.push(drawnCard);

    if (drawnCard.isOldMaid) {
      this.showMessage("Computer drew the Old Maid! 👵 Your turn!", "info");
    } else {
      this.showMessage(`Computer drew a card from your hand. Your turn!`, "info");
    }

    this.removeAllPairs(this.computerHand, 'computer');
    this.updateDisplay();

    if (this.checkGameOver()) return;

    this.currentTurn = 'player';
  }

  checkGameOver() {
    const totalCards = this.playerHand.length + this.computerHand.length;

    if (totalCards === 1) {
      this.gameOver = true;

      if (this.playerHand.length === 1 && this.playerHand[0].isOldMaid) {
        this.showMessage(`😢 You lose! You're stuck with the Old Maid! Computer collected ${this.computerPairs} pairs vs your ${this.playerPairs} pairs.`, "error");
      } else if (this.computerHand.length === 1 && this.computerHand[0].isOldMaid) {
        this.showMessage(`🎉 You win! Computer is stuck with the Old Maid! You collected ${this.playerPairs} pairs vs computer's ${this.computerPairs} pairs!`, "info");
      }

      return true;
    }

    return false;
  }

  updateDisplay() {
    const playerHandEl = document.getElementById('player-hand');
    const computerHandEl = document.getElementById('computer-hand');
    const computerHandCount = document.getElementById('computer-hand-count');

    playerHandEl.innerHTML = '';
    this.playerHand.forEach(card => {
      const cardEl = this.createCardElement(card, true);
      playerHandEl.appendChild(cardEl);
    });

    computerHandEl.innerHTML = '';
    this.computerHand.forEach((card, index) => {
      const cardEl = this.createCardElement(null, false);
      if (this.currentTurn === 'player' && !this.gameOver) {
        cardEl.addEventListener('click', () => {
          this.playerDrawsCard(index);
        });
        cardEl.style.cursor = 'pointer';
      }
      computerHandEl.appendChild(cardEl);
    });

    computerHandCount.textContent = this.computerHand.length;
    document.getElementById('player-score').textContent = this.playerPairs;
    document.getElementById('computer-score').textContent = this.computerPairs;
  }

  createCardElement(card, showFace) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';

    if (showFace && card) {
      if (card.isOldMaid) {
        cardEl.classList.add('black');
        const rankEl = document.createElement('div');
        rankEl.style.fontSize = '2em';
        rankEl.textContent = '👵';
        cardEl.appendChild(rankEl);
      } else {
        cardEl.classList.add(card.color);
        const rankEl = document.createElement('div');
        rankEl.className = 'card-rank';
        rankEl.textContent = card.rank;
        const suitEl = document.createElement('div');
        suitEl.className = 'card-suit';
        suitEl.textContent = card.suit;
        cardEl.appendChild(rankEl);
        cardEl.appendChild(suitEl);
      }
    } else {
      cardEl.classList.add('card-back');
      cardEl.textContent = '🎴';
    }

    return cardEl;
  }

  showMessage(text, type = "info") {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
  }

  setupEventListeners() {
    document.getElementById('new-game-btn').addEventListener('click', () => {
      this.playerHand = [];
      this.computerHand = [];
      this.playerPairs = 0;
      this.computerPairs = 0;
      this.currentTurn = 'player';
      this.gameOver = false;
      this.initializeGame();
    });
  }
}

const game = new OldMaid();
