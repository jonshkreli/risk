function twoAttacks(attackers, defenders1, defenders2) {
    let result = [];

    let firstAttack = threeDice(attackers, defenders1);


    if(firstAttack[0] > 0) {
        let attackersForNewRound = firstAttack[0] - 1; //one soldier needs to stay back
        if(attackersForNewRound >= 3)
        result = [firstAttack[0], ...threeDice(attackersForNewRound, defenders2)]

        else if(attackersForNewRound === 2)
            result = [firstAttack[0], ...twoDice(attackersForNewRound, defenders2)]
        else if(attackersForNewRound === 1)
            result = [firstAttack[0], ...oneDice(attackersForNewRound, defenders2)]
        else if (attackersForNewRound === 0)
            result = [...firstAttack, defenders2];

    } else {
        result = [...firstAttack, defenders2]
    }

    return result;

    // [4,2,0]
    //first number attackers who were succeeded in first attack
    // second attackers/defenders left
    //third defenders left in second attack
}

function nAttacks(attackers, defendersLine) {
    if(isNaN(attackers) && attackers < 0) throw 'Attackers must be 0 or more. Attackers: ' + attackers;
    if(defendersLine === undefined || defendersLine.length === 0)
        throw 'defendersLine row must be at least 1. defendersLine: ' + defendersLine;

    let count= 0;

    let winsOnDefenderLines = {};

    for (let d = 0; d < defendersLine.length; d++) {

        if(count++ === 1000) {
            console.warn('to much loop');
            count=0;
            break;
        }

        if(defendersLine[d] === 0) {
            console.warn('defenders can not be 0');
            continue;
        }

        // console.log(attackers + " vs " +defenders[d])
        winsOnDefenderLines[d] = {};
        winsOnDefenderLines[d].match = {
            attackers: attackers, defenders: defendersLine[d],
            visual: attackers + " vs " + defendersLine[d]
    }


        let result;
        if (attackers >= 3) {
             result = threeDice(attackers, defendersLine[d]);
        } else if (attackers === 2) {
             result = twoDice(attackers, defendersLine[d]);
        } else if (attackers === 1) {
             result = oneDice(attackers, defendersLine[d]);
        } else if (attackers === 0) {
            winsOnDefenderLines[d].noMoreAttackers= defendersLine[d]
          continue;
        }

        // console.log(result)

        if(result[0] > 0) { //attack successful
            winsOnDefenderLines[d].win= result[0]

            //modify attackers for next turn
            attackers = result[0] - 1;
        } else if(result[1] > 0) { //defenders win
            //show how many defenders left
            winsOnDefenderLines[d].lose= result[1]
            attackers = 0;
        }

    }

    return winsOnDefenderLines;
}


function countWinningChanceOfTwoAttacks(attackers, defenders1, defenders2, times = 100) {

    let wins = 0;

    for (let i = 0; i < times; i++) {
       let result = twoAttacks(attackers, defenders1, defenders2);
       if(result[2] === 0) wins++;
       //if no defender is left after second attack then declare win
    }

    return wins/times;

}

/**
 * attackers Number
 * defendersLine Number
 * */
function countWinningChanceOfnAttacks(attackers, defendersLine, times = 100) {

    if(isNaN(attackers) && attackers < 0) throw 'Attackers must be 0 or more. Attackers: ' + attackers;
    if(defendersLine === undefined || defendersLine.length === 0)
        throw 'defendersLine row must be at least 1. defendersLine: ' + defendersLine;

    let winAllTotal = 0;
    let defendersBeatTotal = 0;
    let attackersLeftTotal = 0;
    let defendersLeftTotal = 0;
    let totalDefenders = defendersLine.reduce((a, b) => a + b, 0);
    let territoriesOccupiedTotal = 0;
    let territoriesLeftTotal = 0;

    for (let i = 0; i < times; i++) {
        let result = nAttacks(attackers, defendersLine);

        let winAll = true;
        let defendersBeat = 0;
        let attackersLeft = 0;
        let defendersLeft = 0;
        let territoriesOccupied = 0;
        let territoriesLeft = 0;


        for (let match of Object.values(result)) {
            if(match.win) {
                attackersLeft = match.win;
                defendersBeat += match.match.defenders;
                territoriesOccupied ++;
            }
           else if(match.lose || match.noMoreAttackers){
               defendersLeft += match.match.defenders;
               territoriesLeft++;
                winAll = false
            }
        }

        if(winAll === true) winAllTotal++;
        defendersBeatTotal += defendersBeat;
        attackersLeftTotal += attackersLeft;
        defendersLeftTotal += defendersLeft;
        territoriesOccupiedTotal += territoriesOccupied;
        territoriesLeftTotal += territoriesLeft;

    }

    return {
        winAll: winAllTotal/times,
        totalDefenders: totalDefenders,
        territoriesOccupiedTotal: territoriesOccupiedTotal/times,
        territoriesLeftTotal: territoriesLeftTotal/times,
        attackersLeft: attackersLeftTotal/times,
        defendersLeft: defendersLeftTotal/times,
        defendersBeat: defendersBeatTotal/times,
    };

}


/*
* @attackers Number
* @defenderLines [[]]
* */
function checkWhereToAttack(attackers, defenderLines) {


    let attackingRates = new AttackingRates();
    attackingRates.defenderLines = defenderLines;
    attackingRates.AttackingStrategiesPoints = AttackingStrategiesPoints;

    attackingRates.testAttacks(attackers, defenderLines);

    attackingRates.calculateAvgForBestStrategy();


    // console.log(attackingRates)

    return attackingRates;

    }


const AttackingStrategiesPoints = {
    "general" : {
        WinAll: 60,
        TerritoriesOccupiedTotal: 6,
        AttackersLeft: 8,
    },
    "drawACard": {
        WinAll: 100,
        TerritoriesOccupiedTotal: 0,
        AttackersLeft: 0,
    },
    "OccupyAsMuchAsPossible": {
        WinAll: 30,
        TerritoriesOccupiedTotal: 15,
        AttackersLeft: 0,
    },
    "Protect": {
        WinAll: 60,
        TerritoriesOccupiedTotal: 0,
        AttackersLeft: 15,
    }


};

function ratesByStrategy(attacks, staticPointsOfWisdom) {
    let rates = {};

    for (let s of Object.keys(staticPointsOfWisdom)) {
        rates[s] = addPointsToStrategy(attacks, staticPointsOfWisdom[s]);
    }

    return rates;
}

/**
 * @attacks comes from countWinningChanceOfnAttacks()
 * @strategy staticPointsOfWisdom.strategy
 * */
function addPointsToStrategy(attacks, strategy) {

  let strategyPoints =   {
        WinPoints: attacks.winAll * strategy.WinAll,
        TerritoriesOccupiedPoints: attacks.territoriesOccupiedTotal * strategy.TerritoriesOccupiedTotal,
        AttackersLeftPoints: attacks.attackersLeft * strategy.AttackersLeft,
    };
    let totalPoints = 0;
    for(let p of Object.values(strategyPoints)) {
        totalPoints += p;
    }
    strategyPoints.totalPoints = totalPoints;

    return strategyPoints;

}

function clone(A) {
    return JSON.parse(JSON.stringify(A));
}

function calculatePathsFromTo(from, to, cards, ownedTerritories) {
    if(typeof from !== 'string' ) throw 'from needs to be a string. from:' + from;
    if(typeof to !== 'string' ) throw 'to needs to be a string. to:' + to;
    if(cards.constructor !== Array ) throw 'cards needs to be an Array. cards:' + cards;
    if(ownedTerritories === undefined) console.warn("To many results may be shown. Some may get disposed!-")
    if(ownedTerritories && ownedTerritories.constructor !== Array ) throw 'ownedTerritories needs to be an Array. ownedTerritories:' + cards;



    let fromObj = cards.find(e => e.name === from);
    let toObj = cards.find(e => e.name === to);


   let res = allPathsFromTo(fromObj,toObj, cards,[],[], ownedTerritories);

    // console.log(res)

    return res;

}

function allPathsFromTo(fromObj,toObj, cards, path, validPaths, ownedTerritories) {
    if(fromObj === undefined){
        fromObj = cards[0];
    }
    if(path === undefined){
        path = [];
    }
    path.push(fromObj.name);
    //console.log("Current Path", path);
    if(fromObj === toObj){
        // console.log("Found Valid", path);
        validPaths.push(clone(path));
        return validPaths;
    }

    //find all border territories as objects
    let bordersObj = [];
    for (let bt of fromObj.borders) {
        let borderObj = cards.find(e => e.name === bt);
        if(borderObj === undefined) {
            // console.info(bt + "is deactivated");
        } else if(ownedTerritories && ownedTerritories.find(e => e.name === borderObj.name) !== undefined) {
            // console.info(bt + "is your territory");
        } else bordersObj.push(borderObj);
    }

//console.log(bordersObj, node)
    bordersObj.forEach(x => {
        if(path.indexOf(x.name) === -1){
            const newPath = clone(path);
            allPathsFromTo(x,toObj, cards, newPath, validPaths, ownedTerritories);
        }
    });

    return validPaths
}

function generateRandomSoldiers(CardsWithoutSoldiers) {
    if(CardsWithoutSoldiers.constructor !== Array ) throw 'cards needs to be an Array. cards:' + CardsWithoutSoldiers;

    // let gameTerritories = [];
    let gameTerritories = [...CardsWithoutSoldiers];

    for (let gt of gameTerritories) {

        // for (let c of CardsWithoutSoldiers) {
        // let gt = Object.assign({}, c);

        gt.soldiers = Math.floor( (Math.random()*10) / (1 + Math.random()*2) );
        if(gt.soldiers === 0) {
            gt.soldiers =1;
        }

        // gameTerritories.push(gt);
    }

    return gameTerritories;

}


function checkAttackingPathsFromTo(attackers, from, to, gameCards, ownedTerritories) {
    if(typeof from !== 'string' ) throw 'from needs to be a string. from:' + from;
    if(typeof to !== 'string' ) throw 'to needs to be a string. to:' + to;
    if(gameCards.constructor !== Array ) throw 'cards needs to be an Array. cards:' + gameCards;
    if(ownedTerritories && ownedTerritories.constructor !== Array ) throw 'ownedTerritories needs to be an Array. ownedTerritories:' + cards;

    let cardsWithSoldiers = [...gameCards] //generateRandomSoldiers(gameCards);


    let getPaths = calculatePathsFromTo(from, to, cardsWithSoldiers,ownedTerritories);

    let pathWithSoldiers = [];
    let defenderLines = [];

    for (let p of getPaths) {
        let pathP = {};
        let defenderLine = [];
        let i=0;
        for (let t of p) {
            // console.log(t,p)
            let soldiers = cardsWithSoldiers.find(e => e.name === t).soldiers;
            pathP[t] = soldiers;

            if(i !== 0) //first territory is starting territory
            defenderLine.push(soldiers);
            // console.log(pathP)
            i++;
        }

        pathWithSoldiers.push(pathP)
        defenderLines.push(defenderLine)
    }

// console.log(pathWithSoldiers, defenderLines);

//checkWhereToAttack(attackers, defenderLines);

    let AR = new AttackingRates();

    AR.AttackingStrategiesPoints = AttackingStrategiesPoints;

    AR.paths = pathWithSoldiers;

    AR.convertPathsToDefenderLines();

    // console.log(AR)

   AR.testAttacks(attackers, defenderLines);
   AR.calculateAvgForBestStrategy();


  // let tp = AR.getSelectiveRates(85);

   // let tt = AR.getSelectiveRates()

// console.log(tp,tt)

    return AR
}
