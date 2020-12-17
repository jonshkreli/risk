class Player {

    color;
    hasOccupiedTerritory = false;

    isPlaying = false;

   constructor(name, type) {
       this.name = name;
       this.territories = [];
       this.cards = [];

       if(type) {
           this.type = type;
       } else this.type = PlayerType.HUMAN;
   }

   play() {
       this.isPlaying = true;

       let territoriesConn = this.whereAreMoreConnectedTerritories();
       let withMostAlliesAndOneEnemy = this.terrWithMostAlliesAndOneEnemy(territoriesConn);
       let bestTerr = this.territories.find( e => e === withMostAlliesAndOneEnemy.territory);
       bestTerr.soldiers += game.soldierToPut;

       // think where to attack
       let enemyTerritories = this.getAllEnemyTerritories();
       // console.log(enemyTerritories);

       let ars = [];


       for (let t of enemyTerritories) {
           let ar = checkAttackingPathsFromTo(bestTerr.soldiers-1, bestTerr.name, t.name, game.cards, this.territories)
           ars.push(ar)
       }

       // console.log(bestTerr.name, enemyTerritories[0].name)

       let attackChoice = ars[0].BestChoseForStrategy.drawACard;
       for (let attRes of ars) {
           if(attRes.BestChoseForStrategy.drawACard.value > attackChoice.value) {
               attackChoice = attRes.BestChoseForStrategy.drawACard;
           }
       }

       console.log(ars, attackChoice)

        attackFromState = Object.keys(attackChoice.path)[0];
       activeState = Object.keys(attackChoice.path)[1];

       if(game.playerTurn.territories[activeState].soldiers > 3) {
           attack(3);
       } else if(game.playerTurn.territories[activeState].soldiers === 3) {
           attack(2);
       } else if(game.playerTurn.territories[activeState].soldiers === 2) {
           attack(1);
       } else {
           //do not attack
       }



       attackFromState = undefined; activeState = undefined;

       // game.nextPlayerTurn();
   }

   whereAreMoreConnectedTerritories() {
       let conn = {

       };
       //{"alaska": {allies:2, enemies: 1}}
       for (let t of this.territories) {
           conn[t.name] = {allies:0, enemies: 0};
           for (let b of t.borders) {
               //allies terr
                if(this.territories.find(e => e.name === b) !== undefined) {
                    conn[t.name].allies ++;
           }   else { // enemy territory
                    conn[t.name].enemies ++;
                }
           }
       }

       // console.log(conn);

       return conn;
   }


   //requires object form whereAreMoreConnectedTerritories
    terrWithMostAlliesAndOneEnemy(territoriesConn) {
       if(territoriesConn === undefined) throw 'territoriesConn is required';

        let terrWithMostAlliesAndOneEnemy = {territory: this.territories[0], allies: 0};

        for (let c of Object.keys(territoriesConn)) {
            let connections = territoriesConn[c];
            if(connections.enemies > 0) {
                if(terrWithMostAlliesAndOneEnemy.allies < connections.allies) {
                    terrWithMostAlliesAndOneEnemy.allies = connections.allies;
                    terrWithMostAlliesAndOneEnemy.territory = this.territories.find(e=>e.name === c);
                }

            }
        }

        console.log(terrWithMostAlliesAndOneEnemy);

        return terrWithMostAlliesAndOneEnemy;

    }


    getAllEnemyTerritories() {
       let terr = [];

        for (let p of game.players) {
            if(p === this) continue;
            terr = terr.concat(p.territories);
        }

        return terr;
    }
}


const PlayerType = {
    HUMAN: "human", COMPUTER: "computer"
}
