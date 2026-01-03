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
    document.getElementById('deck-count').textContent = this.deck.length;
    this.animateInitialDeal();
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

  drawCardFromDeck() {
    if (this.deck.length === 0) {
      return null;
    }
    return this.deck.pop();
  }

  addCardToHand(card, player) {
    if (player === 'player') {
      this.playerHand.push(card);
    } else {
      this.computerHand.push(card);
    }
  }

  drawCard(player) {
    const card = this.drawCardFromDeck();
    if (card) {
      this.addCardToHand(card, player);
    }
    return card;
  }

  animateCardDraw(card, targetPlayer, callback, fast = false) {
    const deckCard = document.querySelector('.deck-card');
    const deckRect = deckCard.getBoundingClientRect();

    const animatedCard = document.createElement('div');
    animatedCard.className = 'card card-back animated-card';
    animatedCard.textContent = '🎴';
    animatedCard.style.left = `${deckRect.left}px`;
    animatedCard.style.top = `${deckRect.top}px`;
    if (fast) {
      animatedCard.style.transition = 'all 0.4s ease-in-out';
    }
    document.body.appendChild(animatedCard);

    let targetElement;
    if (targetPlayer === 'player') {
      targetElement = document.getElementById('player-hand');
    } else {
      targetElement = document.getElementById('computer-hand');
    }

    const moveDelay = fast ? 25 : 50;
    const flipStartDelay = fast ? 200 : 400;
    const flipMidDelay = fast ? 150 : 300;
    const totalDuration = fast ? 600 : 1200;

    setTimeout(() => {
      const targetRect = targetElement.getBoundingClientRect();
      animatedCard.style.left = `${targetRect.left + targetRect.width / 2 - 40}px`;
      animatedCard.style.top = `${targetRect.top + targetRect.height / 2 - 60}px`;

      if (targetPlayer === 'player' && card) {
        setTimeout(() => {
          animatedCard.classList.add('flipping');
          setTimeout(() => {
            animatedCard.classList.remove('card-back');
            animatedCard.classList.add(card.color);
            animatedCard.textContent = '';

            const rankEl = document.createElement('div');
            rankEl.className = 'card-rank';
            rankEl.textContent = card.rank;
            const suitEl = document.createElement('div');
            suitEl.className = 'card-suit';
            suitEl.textContent = card.suit;
            animatedCard.appendChild(rankEl);
            animatedCard.appendChild(suitEl);
          }, flipMidDelay);
        }, flipStartDelay);
      }
    }, moveDelay);

    setTimeout(() => {
      animatedCard.remove();
      if (callback) callback();
    }, totalDuration);
  }

  animateCardTransfer(cards, fromPlayer, toPlayer, callback) {
    const fromElement = fromPlayer === 'player' ? document.getElementById('player-hand') : document.getElementById('computer-hand');
    const toElement = toPlayer === 'player' ? document.getElementById('player-hand') : document.getElementById('computer-hand');

    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();

    let animationsComplete = 0;
    const totalAnimations = cards.length;

    cards.forEach((card, index) => {
      setTimeout(() => {
        const animatedCard = document.createElement('div');
        animatedCard.className = 'card animated-card';

        if (fromPlayer === 'player') {
          animatedCard.classList.add(card.color);
          const rankEl = document.createElement('div');
          rankEl.className = 'card-rank';
          rankEl.textContent = card.rank;
          const suitEl = document.createElement('div');
          suitEl.className = 'card-suit';
          suitEl.textContent = card.suit;
          animatedCard.appendChild(rankEl);
          animatedCard.appendChild(suitEl);
        } else {
          animatedCard.classList.add('card-back');
          animatedCard.textContent = '🎴';
        }

        animatedCard.style.left = `${fromRect.left + fromRect.width / 2 - 40}px`;
        animatedCard.style.top = `${fromRect.top + fromRect.height / 2 - 60}px`;
        document.body.appendChild(animatedCard);

        setTimeout(() => {
          animatedCard.style.left = `${toRect.left + toRect.width / 2 - 40}px`;
          animatedCard.style.top = `${toRect.top + toRect.height / 2 - 60}px`;

          if (toPlayer === 'player' && fromPlayer === 'computer') {
            setTimeout(() => {
              animatedCard.classList.add('flipping');
              setTimeout(() => {
                animatedCard.classList.remove('card-back');
                animatedCard.classList.add(card.color);
                animatedCard.textContent = '';

                const rankEl = document.createElement('div');
                rankEl.className = 'card-rank';
                rankEl.textContent = card.rank;
                const suitEl = document.createElement('div');
                suitEl.className = 'card-suit';
                suitEl.textContent = card.suit;
                animatedCard.appendChild(rankEl);
                animatedCard.appendChild(suitEl);
              }, 300);
            }, 400);
          }
        }, 50);

        setTimeout(() => {
          animatedCard.remove();
          animationsComplete++;
          if (animationsComplete === totalAnimations && callback) {
            callback();
          }
        }, 1200);
      }, index * 150);
    });
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
    // Remove from hand
    pairCards.forEach(card => {
      const hand = player === 'player' ? this.playerHand : this.computerHand;
      const index = hand.indexOf(card);
      if (index !== -1) {
        hand.splice(index, 1);
      }
    });

    // Add to pairs collection
    if (player === 'player') {
      this.playerPairs.push({
        rank: pairCards[0].rank,
        cards: pairCards
      });
    } else {
      this.computerPairs.push({
        rank: pairCards[0].rank,
        cards: pairCards
      });
    }

    this.updateDisplay();

    if (callback) {
      setTimeout(callback, 600);
    }
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

    this.displayPairs('player-pairs', this.playerPairs);
    this.displayPairs('computer-pairs', this.computerPairs);

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

  showMessage(text, type = "info") {
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
