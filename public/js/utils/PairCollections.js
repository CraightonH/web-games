/**
 * Optional utility for games that collect pairs/sets visually
 * Provides methods for managing and displaying collected pairs
 */
class PairCollections {
  /**
   * Initialize pair collections for a game
   * @param {Object} game - The game instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.showVisualPairs - Whether to display pairs visually (default: true)
   * @param {string} options.playerPairsElementId - ID of player pairs container (default: 'player-pairs')
   * @param {string} options.computerPairsElementId - ID of computer pairs container (default: 'computer-pairs')
   */
  static initialize(game, options = {}) {
    game._pairCollectionsConfig = {
      showVisualPairs: options.showVisualPairs !== false,
      playerPairsElementId: options.playerPairsElementId || 'player-pairs',
      computerPairsElementId: options.computerPairsElementId || 'computer-pairs'
    };

    game.playerPairs = [];
    game.computerPairs = [];
  }

  /**
   * Check for and remove pairs from a hand
   * @param {Array} hand - The hand to check
   * @param {string} player - 'player' or 'computer'
   * @param {Object} game - The game instance
   * @returns {Array} Array of pairs found (each pair is an array of 2 cards)
   */
  static checkAndRemovePairs(hand, player, game) {
    const rankCounts = {};

    for (let card of hand) {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    }

    const pairsFound = [];

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
          const pairCards = [removedCards[i * 2], removedCards[i * 2 + 1]];
          pairsFound.push(pairCards);

          if (player === 'player') {
            game.playerPairs.push({
              rank: rank,
              cards: pairCards
            });
          } else {
            game.computerPairs.push({
              rank: rank,
              cards: pairCards
            });
          }
        }
      }
    }

    return pairsFound;
  }

  /**
   * Display pairs in the UI (if visual pairs are enabled)
   * @param {string} elementId - ID of the container element
   * @param {Array} pairsArray - Array of pair objects
   * @param {Object} game - The game instance
   */
  static displayPairs(elementId, pairsArray, game) {
    if (!game._pairCollectionsConfig || !game._pairCollectionsConfig.showVisualPairs) {
      return;
    }

    const pairsEl = document.getElementById(elementId);
    if (!pairsEl) return;

    pairsEl.innerHTML = '';

    pairsArray.forEach(pair => {
      const pairGroup = document.createElement('div');
      pairGroup.className = 'pair-group';

      pair.cards.forEach(card => {
        const cardEl = game.createCardElement(card, true);
        cardEl.style.width = '60px';
        cardEl.style.height = '90px';
        cardEl.style.fontSize = '0.9em';
        pairGroup.appendChild(cardEl);
      });

      pairsEl.appendChild(pairGroup);
    });
  }

  /**
   * Animate collecting a pair with visual feedback
   * @param {Array} pairCards - Array of cards in the pair
   * @param {string} player - 'player' or 'computer'
   * @param {Object} game - The game instance
   * @param {Function} callback - Called when animation completes
   */
  static animateCollectPair(pairCards, player, game, callback) {
    // Remove from hand and add to pairs
    pairCards.forEach(card => {
      const hand = player === 'player' ? game.playerHand : game.computerHand;
      const index = hand.indexOf(card);
      if (index !== -1) {
        hand.splice(index, 1);
      }
    });

    if (player === 'player') {
      game.playerPairs.push({
        rank: pairCards[0].rank,
        cards: pairCards
      });
    } else {
      game.computerPairs.push({
        rank: pairCards[0].rank,
        cards: pairCards
      });
    }

    game.updateDisplay();

    // Only animate if visual pairs are enabled
    if (game._pairCollectionsConfig && game._pairCollectionsConfig.showVisualPairs) {
      CardAnimations.animatePairCollection(pairCards, player, callback);
    } else {
      if (callback) callback();
    }
  }

  /**
   * Get the total number of pairs collected by a player
   * @param {string} player - 'player' or 'computer'
   * @param {Object} game - The game instance
   * @returns {number} Number of pairs
   */
  static getPairCount(player, game) {
    return player === 'player' ? game.playerPairs.length : game.computerPairs.length;
  }

  /**
   * Check if the pairs collection sections exist in the HTML
   * @param {Object} game - The game instance
   * @returns {boolean} True if both pair elements exist
   */
  static hasPairElements(game) {
    if (!game._pairCollectionsConfig) return false;

    const playerEl = document.getElementById(game._pairCollectionsConfig.playerPairsElementId);
    const computerEl = document.getElementById(game._pairCollectionsConfig.computerPairsElementId);

    return !!(playerEl && computerEl);
  }
}
