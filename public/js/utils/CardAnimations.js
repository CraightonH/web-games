/**
 * Card animation utilities for card games
 * Provides reusable animations for card movements, flips, and transfers
 */
class CardAnimations {
  /**
   * Animates a card being drawn from the deck to a player's hand
   * @param {Object} card - The card object
   * @param {string} targetPlayer - 'player' or 'computer'
   * @param {Function} callback - Called when animation completes
   * @param {boolean} fast - Use faster animation (default: false)
   */
  static animateCardDraw(card, targetPlayer, callback, fast = false) {
    const deckCard = document.querySelector('.deck-card');
    if (!deckCard) {
      if (callback) callback();
      return;
    }

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

    if (!targetElement) {
      animatedCard.remove();
      if (callback) callback();
      return;
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

  /**
   * Animates cards being transferred from one player to another
   * @param {Array} cards - Array of card objects to transfer
   * @param {string} fromPlayer - 'player' or 'computer'
   * @param {string} toPlayer - 'player' or 'computer'
   * @param {Function} callback - Called when all animations complete
   */
  static animateCardTransfer(cards, fromPlayer, toPlayer, callback) {
    if (!cards || cards.length === 0) {
      if (callback) callback();
      return;
    }

    const fromElement = fromPlayer === 'player'
      ? document.getElementById('player-hand')
      : document.getElementById('computer-hand');
    const toElement = toPlayer === 'player'
      ? document.getElementById('player-hand')
      : document.getElementById('computer-hand');

    if (!fromElement || !toElement) {
      if (callback) callback();
      return;
    }

    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();

    let completed = 0;
    const totalCards = cards.length;

    cards.forEach((card, index) => {
      setTimeout(() => {
        const animatedCard = document.createElement('div');
        animatedCard.className = 'card animated-card';

        if (fromPlayer === 'computer') {
          animatedCard.classList.add('card-back');
          animatedCard.textContent = '🎴';
        } else {
          animatedCard.classList.add(card.color);
          const rankEl = document.createElement('div');
          rankEl.className = 'card-rank';
          rankEl.textContent = card.rank;
          const suitEl = document.createElement('div');
          suitEl.className = 'card-suit';
          suitEl.textContent = card.suit;
          animatedCard.appendChild(rankEl);
          animatedCard.appendChild(suitEl);
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
          completed++;
          if (completed === totalCards && callback) {
            callback();
          }
        }, 1200);
      }, index * 150);
    });
  }

  /**
   * Animates a collection of cards (pair, set, etc.) being removed from hand
   * @param {Array} cards - Cards to collect
   * @param {string} player - 'player' or 'computer'
   * @param {Function} callback - Called when animation completes
   */
  static animatePairCollection(cards, player, callback) {
    if (!cards || cards.length === 0) {
      if (callback) callback();
      return;
    }

    const handElement = player === 'player'
      ? document.getElementById('player-hand')
      : document.getElementById('computer-hand');
    const pairsElement = player === 'player'
      ? document.getElementById('player-pairs')
      : document.getElementById('computer-pairs');

    if (!handElement || !pairsElement) {
      if (callback) callback();
      return;
    }

    const handRect = handElement.getBoundingClientRect();
    const pairsRect = pairsElement.getBoundingClientRect();

    cards.forEach((card, index) => {
      setTimeout(() => {
        const animatedCard = document.createElement('div');
        animatedCard.className = `card ${card.color} animated-card`;

        const rankEl = document.createElement('div');
        rankEl.className = 'card-rank';
        rankEl.textContent = card.rank;
        const suitEl = document.createElement('div');
        suitEl.className = 'card-suit';
        suitEl.textContent = card.suit;
        animatedCard.appendChild(rankEl);
        animatedCard.appendChild(suitEl);

        animatedCard.style.left = `${handRect.left + handRect.width / 2 - 40}px`;
        animatedCard.style.top = `${handRect.top + handRect.height / 2 - 60}px`;
        document.body.appendChild(animatedCard);

        setTimeout(() => {
          animatedCard.style.left = `${pairsRect.left + pairsRect.width / 2 - 40}px`;
          animatedCard.style.top = `${pairsRect.top + pairsRect.height / 2 - 60}px`;
        }, 50);

        setTimeout(() => {
          animatedCard.remove();
        }, 800);
      }, index * 100);
    });

    setTimeout(() => {
      if (callback) callback();
    }, cards.length * 100 + 600);
  }
}
