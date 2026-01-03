class GoFish {
  constructor() {
    this.deck = [];
    this.playerHand = [];
    this.computerHand = [];
    this.playerPairs = [];
    this.computerPairs = [];
    this.currentTurn = 'player';
    this.gameOver = false;
    this.waitingForDraw = false;
    this.askedRank = null;

    this.initializeGame();
    this.setupEventListeners();
  }

  initializeGame() {
    this.createDeck();
    this.shuffleDeck();
    this.dealCards();
    this.checkForInitialPairs();
    this.updateDisplay();
    this.showMessage("Game started! Click a card from your hand to ask the computer for it.", "info");
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
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  dealCards() {
    const cardsPerPlayer = 7;
    for (let i = 0; i < cardsPerPlayer; i++) {
      this.playerHand.push(this.deck.pop());
      this.computerHand.push(this.deck.pop());
    }
  }

  checkForInitialPairs() {
    this.checkAndRemovePairs(this.playerHand, 'player');
    this.checkAndRemovePairs(this.computerHand, 'computer');
  }

  checkAndRemovePairs(hand, player) {
    const rankCounts = {};

    for (let card of hand) {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    }

    for (let rank in rankCounts) {
      if (rankCounts[rank] >= 2) {
        const pairs = Math.floor(rankCounts[rank] / 2);
        const removedCards = [];

        for (let i = 0; i < pairs * 2; i++) {
          const index = hand.findIndex(card => card.rank === rank);
          if (index !== -1) {
            removedCards.push(hand.splice(index, 1)[0]);
          }
        }

        for (let i = 0; i < pairs; i++) {
          if (player === 'player') {
            this.playerPairs.push({
              rank: rank,
              cards: [removedCards[i * 2], removedCards[i * 2 + 1]]
            });
          } else {
            this.computerPairs.push({
              rank: rank,
              cards: [removedCards[i * 2], removedCards[i * 2 + 1]]
            });
          }
        }
      }
    }
  }

  drawCard(player) {
    if (this.deck.length === 0) {
      return null;
    }

    const card = this.deck.pop();
    if (player === 'player') {
      this.playerHand.push(card);
    } else {
      this.computerHand.push(card);
    }
    return card;
  }

  askForCard(askingPlayer, rank) {
    const givingHand = askingPlayer === 'player' ? this.computerHand : this.playerHand;
    const receivingHand = askingPlayer === 'player' ? this.playerHand : this.computerHand;

    const matchingCards = givingHand.filter(card => card.rank === rank);

    if (matchingCards.length > 0) {
      for (let card of matchingCards) {
        const index = givingHand.indexOf(card);
        givingHand.splice(index, 1);
        receivingHand.push(card);
      }
      return true;
    }

    return false;
  }

  playerTurn(selectedRank) {
    if (this.gameOver || this.currentTurn !== 'player') return;

    const gotCards = this.askForCard('player', selectedRank);

    if (gotCards) {
      this.showMessage(`Yes! The computer gave you all their ${selectedRank}s. Go again!`, "info");
      this.checkAndRemovePairs(this.playerHand, 'player');
      this.updateDisplay();

      if (this.checkGameOver()) return;
    } else {
      this.waitingForDraw = true;
      this.askedRank = selectedRank;
      this.showMessage(`Go Fish! Click the draw pile to draw a card.`, "info");
      this.updateDisplay();
    }
  }

  playerDrawCard() {
    if (!this.waitingForDraw || this.deck.length === 0) return;

    this.waitingForDraw = false;
    const drawnCard = this.drawCard('player');

    if (drawnCard) {
      if (drawnCard.rank === this.askedRank) {
        this.showMessage(`Lucky! You drew the ${this.askedRank} you asked for! Go again!`, "info");
      } else {
        this.showMessage(`You drew a ${drawnCard.rank}${drawnCard.suit}. Computer's turn!`, "info");
        this.currentTurn = 'computer';
        setTimeout(() => this.computerTurn(), 1500);
      }
    } else {
      this.currentTurn = 'computer';
      setTimeout(() => this.computerTurn(), 1500);
    }

    this.checkAndRemovePairs(this.playerHand, 'player');
    this.updateDisplay();

    if (this.checkGameOver()) return;
  }

  computerTurn() {
    if (this.gameOver || this.currentTurn !== 'computer') return;

    if (this.computerHand.length === 0) {
      const drawnCard = this.drawCard('computer');
      if (!drawnCard) {
        this.checkGameOver();
        return;
      }
    }

    const randomCard = this.computerHand[Math.floor(Math.random() * this.computerHand.length)];
    const askedRank = randomCard.rank;

    this.showMessage(`Computer asks: Do you have any ${askedRank}s?`, "info");

    setTimeout(() => {
      const gotCards = this.askForCard('computer', askedRank);

      if (gotCards) {
        this.showMessage(`You gave the computer your ${askedRank}s. Computer goes again!`, "error");
        this.checkAndRemovePairs(this.computerHand, 'computer');
        this.updateDisplay();

        if (!this.checkGameOver()) {
          setTimeout(() => this.computerTurn(), 1500);
        }
      } else {
        this.showMessage(`You said "Go Fish!" Computer draws a card. Your turn!`, "info");
        this.drawCard('computer');
        this.checkAndRemovePairs(this.computerHand, 'computer');
        this.currentTurn = 'player';
        this.updateDisplay();

        this.checkGameOver();
      }
    }, 1000);
  }

  checkGameOver() {
    const allCardsGone = this.deck.length === 0 &&
                         this.playerHand.length === 0 &&
                         this.computerHand.length === 0;

    if (allCardsGone) {
      this.gameOver = true;

      if (this.playerPairs.length > this.computerPairs.length) {
        this.showMessage(`🎉 You win! You collected ${this.playerPairs.length} pairs vs computer's ${this.computerPairs.length} pairs!`, "info");
      } else if (this.computerPairs.length > this.playerPairs.length) {
        this.showMessage(`Computer wins! Computer collected ${this.computerPairs.length} pairs vs your ${this.playerPairs.length} pairs. Try again!`, "error");
      } else {
        this.showMessage(`It's a tie! Both collected ${this.playerPairs.length} pairs!`, "info");
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
      cardEl.addEventListener('click', () => {
        if (this.currentTurn === 'player' && !this.gameOver && !this.waitingForDraw) {
          this.playerTurn(card.rank);
        }
      });
      playerHandEl.appendChild(cardEl);
    });

    computerHandEl.innerHTML = '';
    this.computerHand.forEach(() => {
      const cardEl = this.createCardElement(null, false);
      computerHandEl.appendChild(cardEl);
    });

    computerHandCount.textContent = this.computerHand.length;
    document.getElementById('player-score').textContent = this.playerPairs.length;
    document.getElementById('computer-score').textContent = this.computerPairs.length;
    document.getElementById('deck-count').textContent = this.deck.length;

    const deckCard = document.querySelector('.deck-card');
    if (this.deck.length === 0) {
      deckCard.classList.add('disabled');
      deckCard.style.opacity = '0.3';
    } else {
      deckCard.classList.remove('disabled');
      deckCard.style.opacity = '1';
    }

    if (this.waitingForDraw) {
      deckCard.classList.add('waiting');
      deckCard.style.boxShadow = '0 0 20px 5px #ffc107';
    } else {
      deckCard.classList.remove('waiting');
      deckCard.style.boxShadow = '';
    }

    this.displayPairs('player-pairs', this.playerPairs);
    this.displayPairs('computer-pairs', this.computerPairs);
  }

  displayPairs(elementId, pairsArray) {
    const pairsEl = document.getElementById(elementId);
    pairsEl.innerHTML = '';

    pairsArray.forEach(pair => {
      const pairGroup = document.createElement('div');
      pairGroup.className = 'pair-group';

      pair.cards.forEach(card => {
        const cardEl = this.createCardElement(card, true);
        cardEl.style.width = '60px';
        cardEl.style.height = '90px';
        cardEl.style.fontSize = '0.9em';
        cardEl.style.cursor = 'default';
        pairGroup.appendChild(cardEl);
      });

      pairsEl.appendChild(pairGroup);
    });
  }

  createCardElement(card, showFace) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';

    if (showFace && card) {
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

  showMessage(text, type = "info") {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
  }

  setupEventListeners() {
    document.getElementById('new-game-btn').addEventListener('click', () => {
      this.playerHand = [];
      this.computerHand = [];
      this.playerPairs = [];
      this.computerPairs = [];
      this.currentTurn = 'player';
      this.gameOver = false;
      this.waitingForDraw = false;
      this.askedRank = null;
      this.initializeGame();
    });

    document.querySelector('.deck-card').addEventListener('click', () => {
      if (this.waitingForDraw && !this.gameOver) {
        this.playerDrawCard();
      }
    });
  }
}

const game = new GoFish();
