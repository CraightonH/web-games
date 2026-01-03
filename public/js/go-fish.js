class GoFish extends CardGame {
  constructor() {
    super();
    // Initialize pair collections with visual display
    PairCollections.initialize(this, { showVisualPairs: true });

    this.waitingForDraw = false;
    this.askedRank = null;
    this.waitingForPlayerResponse = false;
    this.computerAskedRank = null;
    this.isInitialDeal = false;

    this.initializeGame();
    this.setupEventListeners();
  }

  initializeGame() {
    this.createDeck();
    this.shuffleDeck();
    // Don't call updateDisplay here - it triggers auto-draw
    // Just update the deck count
    this.updateDeckCount();
    this.animateInitialDeal();
  }

  checkAndRemovePairs(hand, player) {
    PairCollections.checkAndRemovePairs(hand, player, this);
  }

  // Inherited from CardGame: drawCardFromDeck(), addCardToHand(), drawCard()

  animateCardDraw(card, targetPlayer, callback, fast = false) {
    CardAnimations.animateCardDraw(card, targetPlayer, callback, fast);
  }

  animateCardTransfer(cards, fromPlayer, toPlayer, callback) {
    CardAnimations.animateCardTransfer(cards, fromPlayer, toPlayer, callback);
  }

  animateInitialDeal() {
    this.isInitialDeal = true;
    const cardsPerPlayer = 7;
    let totalCardsDealt = 0;

    const dealNextCard = () => {
      if (totalCardsDealt >= cardsPerPlayer * 2) {
        // All cards dealt, now check for pairs with animation
        this.isInitialDeal = false;
        this.animateInitialPairCheck();
        return;
      }

      // Alternate: even indices go to player, odd to computer
      const targetPlayer = totalCardsDealt % 2 === 0 ? 'player' : 'computer';
      totalCardsDealt++;

      const card = this.drawCardFromDeck();

      if (card) {
        this.updateDisplay();
        this.animateCardDraw(card, targetPlayer, () => {
          this.addCardToHand(card, targetPlayer);
          this.updateDisplay();
          setTimeout(dealNextCard, 50); // Delay between cards
        }, true); // Use fast animation for initial deal
      }
    };

    dealNextCard();
  }

  animateInitialPairCheck() {
    // Check player pairs first
    const playerPairs = this.findPairs(this.playerHand);
    const computerPairs = this.findPairs(this.computerHand);

    if (playerPairs.length === 0 && computerPairs.length === 0) {
      // No pairs, game ready to play
      return;
    }

    // Animate removing pairs
    let animationsComplete = 0;
    const totalAnimations = playerPairs.length + computerPairs.length;

    const completePairAnimation = () => {
      animationsComplete++;
      if (animationsComplete === totalAnimations) {
        this.updateDisplay();
      }
    };

    // Animate player pairs
    playerPairs.forEach((pairCards, index) => {
      setTimeout(() => {
        this.animatePairCollection(pairCards, 'player', completePairAnimation);
      }, index * 800);
    });

    // Animate computer pairs
    computerPairs.forEach((pairCards, index) => {
      setTimeout(() => {
        this.animatePairCollection(pairCards, 'computer', completePairAnimation);
      }, (playerPairs.length + index) * 800);
    });
  }

  findPairs(hand) {
    const rankCounts = {};
    const pairs = [];

    for (let card of hand) {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    }

    for (let rank in rankCounts) {
      if (rankCounts[rank] >= 2) {
        const pairCards = hand.filter(c => c.rank === rank).slice(0, 2);
        pairs.push(pairCards);
      }
    }

    return pairs;
  }

  animatePairCollection(pairCards, player, callback) {
    PairCollections.animateCollectPair(pairCards, player, this, callback);
  }

  askForCard(askingPlayer, rank) {
    const givingHand = askingPlayer === 'player' ? this.computerHand : this.playerHand;
    const matchingCards = givingHand.filter(card => card.rank === rank);

    if (matchingCards.length > 0) {
      for (let card of matchingCards) {
        const index = givingHand.indexOf(card);
        givingHand.splice(index, 1);
      }
      return matchingCards;
    }

    return null;
  }

  transferCards(cards, toPlayer) {
    const receivingHand = toPlayer === 'player' ? this.playerHand : this.computerHand;
    cards.forEach(card => receivingHand.push(card));
  }

  playerTurn(selectedRank) {
    if (this.gameOver || this.currentTurn !== 'player' || this.waitingForPlayerResponse) return;

    const gotCards = this.askForCard('player', selectedRank);

    if (gotCards) {
      this.updateDisplay();
      this.animateCardTransfer(gotCards, 'computer', 'player', () => {
        this.transferCards(gotCards, 'player');
        this.checkAndRemovePairs(this.playerHand, 'player');
        this.updateDisplay();

        if (this.checkGameOver()) return;
      });
    } else {
      this.waitingForDraw = true;
      this.askedRank = selectedRank;
      this.showGoFishPrompt();
      this.updateDisplay();
    }
  }

  playerDrawCard() {
    if (!this.waitingForDraw || this.deck.length === 0) return;

    this.waitingForDraw = false;
    this.hideGoFishPrompt();
    const drawnCard = this.drawCardFromDeck();
    this.updateDisplay();

    this.animateCardDraw(drawnCard, 'player', () => {
      if (drawnCard) {
        this.addCardToHand(drawnCard, 'player');
      }
      this.updateDisplay();

      // Drawing a card always ends your turn, even if you get the card you asked for
      this.currentTurn = 'computer';

      this.checkAndRemovePairs(this.playerHand, 'player');
      this.updateDisplay();

      if (!this.checkGameOver()) {
        setTimeout(() => this.computerTurn(), 1500);
      }
    });
  }

  computerTurn() {
    if (this.gameOver || this.currentTurn !== 'computer') return;

    if (this.computerHand.length === 0) {
      const drawnCard = this.drawCardFromDeck();
      if (!drawnCard) {
        this.checkGameOver();
        return;
      }
      this.updateDisplay();
      this.animateCardDraw(drawnCard, 'computer', () => {
        this.addCardToHand(drawnCard, 'computer');
        this.updateDisplay();
        this.continueComputerTurn();
      });
      return;
    }

    this.continueComputerTurn();
  }

  continueComputerTurn() {
    const randomCard = this.computerHand[Math.floor(Math.random() * this.computerHand.length)];
    const askedRank = randomCard.rank;
    this.computerAskedRank = askedRank;

    this.waitingForPlayerResponse = true;
    this.showComputerRequestPrompt(askedRank);
  }

  playerRespondsToComputer(hasCard) {
    if (!this.waitingForPlayerResponse) return;

    this.waitingForPlayerResponse = false;
    this.hideComputerRequestPrompt();

    if (hasCard) {
      const gotCards = this.askForCard('computer', this.computerAskedRank);
      this.updateDisplay();
      this.animateCardTransfer(gotCards, 'player', 'computer', () => {
        this.transferCards(gotCards, 'computer');
        this.checkAndRemovePairs(this.computerHand, 'computer');
        this.updateDisplay();

        if (!this.checkGameOver()) {
          setTimeout(() => this.computerTurn(), 1500);
        }
      });
    } else {
      const drawnCard = this.drawCardFromDeck();
      this.updateDisplay();

      this.animateCardDraw(drawnCard, 'computer', () => {
        if (drawnCard) {
          this.addCardToHand(drawnCard, 'computer');
        }
        this.checkAndRemovePairs(this.computerHand, 'computer');
        this.currentTurn = 'player';
        this.updateDisplay();
        this.checkGameOver();
      });
    }
  }

  checkGameOver() {
    const allCardsGone = this.deck.length === 0 &&
                         this.playerHand.length === 0 &&
                         this.computerHand.length === 0;

    if (allCardsGone) {
      this.gameOver = true;

      const gameOverPrompt = document.getElementById('game-over-prompt');
      const gameOverText = document.getElementById('game-over-text');
      const gameOverScore = document.getElementById('game-over-score');

      if (this.playerPairs.length > this.computerPairs.length) {
        gameOverText.textContent = '🎉 You Win! 🎉';
        gameOverText.className = 'game-over-text winner';
        gameOverScore.textContent = `You: ${this.playerPairs.length} pairs | Computer: ${this.computerPairs.length} pairs`;
      } else if (this.computerPairs.length > this.playerPairs.length) {
        gameOverText.textContent = 'Computer Wins!';
        gameOverText.className = 'game-over-text loser';
        gameOverScore.textContent = `Computer: ${this.computerPairs.length} pairs | You: ${this.playerPairs.length} pairs`;
      } else {
        gameOverText.textContent = "It's a Tie!";
        gameOverText.className = 'game-over-text tie';
        gameOverScore.textContent = `Both collected ${this.playerPairs.length} pairs!`;
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

    playerHandEl.innerHTML = '';
    this.playerHand.forEach(card => {
      const cardEl = this.createCardElement(card, true);

      // Check if this card matches what the computer is asking for
      if (this.waitingForPlayerResponse && card.rank === this.computerAskedRank) {
        cardEl.classList.add('requested-glow');
      }

      cardEl.addEventListener('click', () => {
        if (this.currentTurn === 'player' && !this.gameOver && !this.waitingForDraw && !this.waitingForPlayerResponse) {
          this.playerTurn(card.rank);
        } else if (this.waitingForPlayerResponse && card.rank === this.computerAskedRank) {
          this.playerRespondsToComputer(true);
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

    const playerHandArea = document.getElementById('player-hand-area');
    const computerHandArea = document.getElementById('computer-hand-area');

    if (this.currentTurn === 'player' && !this.gameOver) {
      playerHandArea.classList.add('active-turn');
      computerHandArea.classList.remove('active-turn');
    } else if (this.currentTurn === 'computer' && !this.gameOver) {
      computerHandArea.classList.add('active-turn');
      playerHandArea.classList.remove('active-turn');
    } else {
      playerHandArea.classList.remove('active-turn');
      computerHandArea.classList.remove('active-turn');
    }

    PairCollections.displayPairs('player-pairs', this.playerPairs, this);
    PairCollections.displayPairs('computer-pairs', this.computerPairs, this);

    // Auto-draw if player has no cards on their turn (but not during initial deal)
    if (this.currentTurn === 'player' && this.playerHand.length === 0 && !this.gameOver && !this.waitingForDraw && !this.waitingForPlayerResponse && !this.isInitialDeal) {
      setTimeout(() => {
        if (this.deck.length > 0) {
          const drawnCard = this.drawCardFromDeck();
          if (drawnCard) {
            this.updateDisplay();
            this.animateCardDraw(drawnCard, 'player', () => {
              this.addCardToHand(drawnCard, 'player');
              this.checkAndRemovePairs(this.playerHand, 'player');
              this.updateDisplay();
            });
          }
        } else {
          this.checkGameOver();
        }
      }, 500);
    }
  }

  // Using PairCollections.displayPairs() from utility

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

  showGoFishPrompt() {
    const prompt = document.getElementById('go-fish-prompt');
    prompt.classList.remove('dismissing');
    prompt.style.display = 'block';

    // Auto-dismiss after 1.5 seconds
    setTimeout(() => {
      prompt.classList.add('dismissing');
      setTimeout(() => {
        prompt.style.display = 'none';
      }, 500); // Wait for fade animation to complete
    }, 1500);
  }

  hideGoFishPrompt() {
    const prompt = document.getElementById('go-fish-prompt');
    prompt.classList.remove('dismissing');
    prompt.style.display = 'none';
  }

  showComputerRequestPrompt(rank) {
    const prompt = document.getElementById('computer-request-prompt');
    const cardDisplay = document.getElementById('requested-card-display');

    // Find a card with this rank to display
    const sampleCard = this.deck.find(c => c.rank === rank) ||
                       this.playerHand.find(c => c.rank === rank) ||
                       this.computerHand.find(c => c.rank === rank) ||
                       { rank: rank, suit: '♠', color: 'black' };

    cardDisplay.innerHTML = '';
    const cardEl = this.createCardElement(sampleCard, true);
    cardEl.style.width = '100px';
    cardEl.style.height = '140px';
    cardEl.style.fontSize = '2em';
    cardEl.style.cursor = 'default';
    cardDisplay.appendChild(cardEl);

    prompt.style.display = 'block';
    this.updateDisplay();
  }

  hideComputerRequestPrompt() {
    const prompt = document.getElementById('computer-request-prompt');
    prompt.style.display = 'none';
  }

  showMessage() {
    // Messages removed - using visual turn indicators instead
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
      this.waitingForPlayerResponse = false;
      this.computerAskedRank = null;
      this.isInitialDeal = false;
      this.hideGoFishPrompt();
      this.hideComputerRequestPrompt();
      document.getElementById('game-over-prompt').style.display = 'none';
      this.initializeGame();
    });

    document.querySelector('.deck-card').addEventListener('click', () => {
      if (this.waitingForDraw && !this.gameOver) {
        this.playerDrawCard();
      }
    });

    document.getElementById('go-fish-btn').addEventListener('click', () => {
      if (this.waitingForPlayerResponse) {
        // Check if player actually has the requested card
        const hasCard = this.playerHand.some(card => card.rank === this.computerAskedRank);
        if (hasCard) {
          // Player is trying to lie - don't allow it
          return;
        }
        this.playerRespondsToComputer(false);
      }
    });
  }
}

const game = new GoFish();
