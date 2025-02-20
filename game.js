class EgyptianRatScrew {
    constructor() {
        this.deck = this.createDeck();
        this.p1Deck = this.deck.slice(0, 26);
        this.p2Deck = this.deck.slice(26);
        this.pile = [];
        this.chanceCount = 0;
        this.currentPlayer = 1; // Player 1 starts a new game
        this.faceCardActive = false;

        this.flipSound = new Audio('sounds/flip.wav');
        this.winSound = new Audio('sounds/winner.wav');

        this.p1Flip = document.getElementById('p1-flip');
        this.p2Flip = document.getElementById('p2-flip');
        this.p1Pile = document.getElementById('p1-pile');
        this.middlePile = document.getElementById('middle-pile');
        this.p2Pile = document.getElementById('p2-pile');
        this.p1Score = document.getElementById('p1-score');
        this.p2Score = document.getElementById('p2-score');
        this.p1ScoreBox = document.getElementById('p1-score-box');
        this.p2ScoreBox = document.getElementById('p2-score-box');
        this.message = document.getElementById('message');
        this.countdown = document.getElementById('countdown');

        console.log('Constructor called');
        console.log('p1Flip:', this.p1Flip);
        console.log('p2Flip:', this.p2Flip);

        // Initial state
        this.p1Pile.style.backgroundImage = 'url(playing_card_images/back_of_card.png)';
        this.p2Pile.style.backgroundImage = 'url(playing_card_images/back_of_card.png)';
        this.middlePile.style.backgroundImage = 'none';
        this.updateTurnIndicator();

        // Add event listeners with logging
        this.p1Flip.addEventListener('click', () => {
            console.log('Player 1 Flip clicked');
            this.playTurn(1);
        });
        this.p2Flip.addEventListener('click', () => {
            console.log('Player 2 Flip clicked');
            this.playTurn(2);
        });
    }

    createDeck() {
        const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
        let deck = [];
        for (let suit of suits) {
            for (let value of values) {
                deck.push(`playing_card_images/${value}_of_${suit}.png`);
            }
        }
        return this.shuffle(deck);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    playTurn(player) {
        console.log('playTurn called for Player', player, 'currentPlayer:', this.currentPlayer);
        if (player !== this.currentPlayer) {
            console.log('Not your turn!');
            return;
        }

        const deck = player === 1 ? this.p1Deck : this.p2Deck;
        if (deck.length === 0) {
            console.log('No cards left for Player', player);
            return;
        }

        const card = deck.shift();
        console.log('Card flipped:', card);
        this.pile.push(card);
        this.flipSound.play().catch(error => console.error('Flip sound error:', error));
        this.middlePile.style.backgroundImage = `url(${card})`;

        this.updateScores();

        const faceCards = {
            'jack': 1,
            'queen': 2,
            'king': 3,
            'ace': 4
        };
        
        const cardValue = card.split('/').pop().split('_')[0];
        console.log('Card value:', cardValue);
        
        if (Object.keys(faceCards).includes(cardValue)) {
            this.faceCardActive = true;
            this.chanceCount = faceCards[cardValue];
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            this.showCountdown();
        } else if (this.faceCardActive) {
            this.chanceCount--;
            this.showCountdown();
            if (this.chanceCount <= 0) {
                this.winHand(this.currentPlayer === 1 ? 2 : 1);
                return;
            }
        } else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            this.countdown.style.display = 'none';
        }

        this.updateTurnIndicator();
        this.checkGameOver();
    }

    winHand(winner) {
        this.winSound.play().catch(error => console.error('Win sound error:', error));
        const winningDeck = winner === 1 ? this.p1Deck : this.p2Deck;
        const pileSize = this.pile.length;
        winningDeck.push(...this.pile);
        
        this.message.textContent = `Player ${winner} takes the pile! They got ${pileSize} cards!`;
        this.countdown.style.display = 'none';
        this.updateScores();

        setTimeout(() => {
            this.pile = [];
            this.middlePile.style.backgroundImage = 'none';
            this.message.textContent = '';
            this.faceCardActive = false;
            this.currentPlayer = winner;
            this.p1Pile.style.backgroundImage = 'url(playing_card_images/back_of_card.png)';
            this.p2Pile.style.backgroundImage = 'url(playing_card_images/back_of_card.png)';
            this.updateTurnIndicator();
        }, 3000);
    }

    updateScores() {
        this.p1Score.textContent = this.p1Deck.length;
        this.p2Score.textContent = this.p2Deck.length;
        
        if (this.p1Deck.length === 0) this.p1Pile.style.backgroundImage = 'none';
        if (this.p2Deck.length === 0) this.p2Pile.style.backgroundImage = 'none';
    }

    updateTurnIndicator() {
        console.log('Updating turn for Player', this.currentPlayer);
        this.p1ScoreBox.classList.remove('active');
        this.p2ScoreBox.classList.remove('active');
        this.p1Flip.classList.remove('active');
        this.p2Flip.classList.remove('active');

        if (this.currentPlayer === 1) {
            this.p1ScoreBox.classList.add('active');
            this.p1Flip.classList.add('active');
            console.log('Player 1 button should be visible');
        } else {
            this.p2ScoreBox.classList.add('active');
            this.p2Flip.classList.add('active');
            console.log('Player 2 button should be visible');
        }
    }

    showCountdown() {
        this.countdown.style.display = 'block';
        this.countdown.textContent = `Chances left: ${this.chanceCount}`;
    }

    checkGameOver() {
        if (this.p1Deck.length === 0) {
            this.message.textContent = 'Player 2 wins!';
            this.p1Flip.disabled = true;
            this.p2Flip.disabled = true;
            this.countdown.style.display = 'none';
        } else if (this.p2Deck.length === 0) {
            this.message.textContent = 'Player 1 wins!';
            this.p1Flip.disabled = true;
            this.p2Flip.disabled = true;
            this.countdown.style.display = 'none';
        }
    }
}
