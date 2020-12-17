class Game {

    players = [];
    playerTurn;
    soldierToPut;
    colors = ['red', 'green', 'blue', 'yellow', 'orange', 'black'];
    winner;


    // newGame cardsDistributed soldersDistributed
    // newTurn finishedNewTurnSoldiers attackTo attackFinished moveSoldiersTo finishTurn

    //cards[]

    constructor(players) {
        this.players = players;

        if(players.length > 6){
            throw 'max number of players is 6';
        }

        for (let i = 0; i< this.players.length; i++) {
            this.players[i].color = this.colors[i];
        }

        this.playerTurn = this.players[0];
        this.calculateSoldiersToPut();

        this.cards =  [...cards];
        this.shuffleCards()

        this.currentState = gameState.newGame;
    }

    shufflePlayers() {
        this.shuffleArray(this.players)
    }

    shuffleCards() {
        this.shuffleArray(this.cards)
    }

    get playerTurn () {
        return this.playerTurn;
    }

    nextPlayerTurn() {
        if(this.playerTurn.hasOccupiedTerritory) {
            this.currentPLayerDrawOneCard();
            this.playerTurn.hasOccupiedTerritory = false; //reset
        }

        let position = this.players.indexOf(this.playerTurn);

        if(position === this.players.length - 1) { //if it the last player in array
            this.playerTurn = this.players[0];
        } else if(position < this.players.length - 1) {
            this.playerTurn = this.players[position+1];
        }

        this.currentState = gameState.newTurn;
        this.playerTurn.isPlaying = false;
        this.calculateSoldiersToPut();
        UpdateTable();
    }

    hasCurrentPlayerWon() {
        if(settings.TerritoriesToWin.value === 'all') {
            let Won = true;

            for (let pl of this.players) {
                if(pl === this.playerTurn) continue;
                if(pl.territories.length > 0) Won = false;
            }

            return Won;
        } else return this.playerTurn.territories.length >= settings.TerritoriesToWin.value;
    }

    currentPLayerDrawOneCard() {

        if(this.cards.length === 0) {
            this.cards = [...cards];
            this.shuffleCards()
        }

        let card = this.cards.pop();
        this.playerTurn.cards.push(card);
    }

    assignCardsToPlayers() {

        let playerTurnToTakeCard = 0;
        let th = this;
        assignCardToPlayerRecursive();

        function  assignCardToPlayerRecursive () {
            th.players[playerTurnToTakeCard].cards.push(th.cards.pop());

            //if player turn goes to the last element of players array restart it to 0
            if(playerTurnToTakeCard === th.players.length -1 ) {
                playerTurnToTakeCard = 0;
            } else { //just increase it
                playerTurnToTakeCard++;
            }
          //  if there are enough cards assign again
          if(th.cards.length>0){
              assignCardToPlayerRecursive();
          }
        }


      UpdateTable();

    }

    putSoldiersInFieldFromPlayersHand() {
        for (let p of this.players) {
            p.territories = [... p.cards];

            for (let t of p.territories){
                t.soldiers = t.stars;
            }
            p.cards = [];
        }

        //put cards in game ready to draw and shuffle
        this.cards = [...cards]
        this.shuffleCards()

        UpdateTable();
    }

    calculateSoldiersToPut() {
        let soldiersFromTerritories = 0;

        if(this.playerTurn.territories.length > 11) {
        soldiersFromTerritories = Math.ceil((this.playerTurn.territories.length - 11) / 3);

        console.log(`Player gets ${soldiersFromTerritories} from ${this.playerTurn.territories.length} territories owned.`)
        }

        //check if someone owns a continent
        let playerTerrByContinent = {};
        let soldiersFromContinent = {};
        let totalSoldiersFromContinents = 0;

        for (let continent of Object.keys(rules.SoldiersFromContinents)) {
           playerTerrByContinent[continent] = 0;//{europe: 0, asia: 0,...etc};
           soldiersFromContinent[continent] = 0; //{europe: 0, asia: 0,...etc};
       }

       for (let t of this.playerTurn.territories) {
           playerTerrByContinent[t.continent] +=1; //{europe: 3, asia: 2,...etc};
       }

        for (let continent of Object.keys(rules.SoldiersFromContinents)) {
            //if europe.territories = 7 and player has 7 territories from europe
            if(rules.SoldiersFromContinents[continent].territories === playerTerrByContinent[continent]) {
                soldiersFromContinent[continent] = rules.SoldiersFromContinents[continent].soldiers; //{europe: 5, asia: 0,...etc};
                totalSoldiersFromContinents += rules.SoldiersFromContinents[continent].soldiers;
                console.log(`Player ${this.playerTurn.name} gets ${soldiersFromContinent[continent]} from ${continent}`)

            }
        }

        this.soldierToPut = 3 + totalSoldiersFromContinents + soldiersFromTerritories;
    }

    /*
    * If yes, remove from players
    * */
    isPlayerOutOfGame(playerIndex) {
        if(this.players[playerIndex].territories.length === 0) {
            let removedPlayer = this.players[playerIndex];
           game.players.splice(playerIndex, 1);
           UpdateTable();

           return removedPlayer;
        } else return false;
    }


    shuffleArray(arr) {
        for(let i = arr.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * i);
            const temp = arr[i]
            arr[i] = arr[j]
            arr[j] = temp
        }
    }


}

const gameState = {
    newGame: "newGame",
    cardsDistributed : "cardsDistributed",
    soldersDistributed: "soldersDistributed",
    newTurn : "newTurn",
    finishedNewTurnSoldiers : "finishedNewTurnSoldiers",
    attackTo : "attackTo",
    attackFinished : "attackFinished",
    moveSoldiersTo : "moveSoldiersTo",
    finishTurn: "finishTurn",
};

