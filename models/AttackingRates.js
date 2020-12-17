class AttackingRates {
    AttackingStrategiesPoints;
    BestChoseForStrategy = {
        general : {index: -1, description: null, value: 0, avg: 0},
        drawACard : {index: -1, description: null, value: 0, avg: 0},
        OccupyAsMuchAsPossible : {index: -1, description: null, value: 0, avg: 0},
        Protect : {index: -1, description: null, value: 0, avg: 0},
    };

    defenderLinesRate = [];

    attackers;

    selectiveRates = {
        over60PercentWin : [],
        over85PercentWin: [],
        over95PercentWin: [],
    };

    defenderLines;

    paths;


    ratesByStrategy(attacks, staticPointsOfWisdom) {
        if(staticPointsOfWisdom === undefined) staticPointsOfWisdom = this.AttackingStrategiesPoints;
        let rates = {};

        for (let s of Object.keys(staticPointsOfWisdom)) {
            rates[s] = addPointsToStrategy(attacks, staticPointsOfWisdom[s]);
        }
        return rates;
    }


    addRateForEachAttack(WinningChanceOfnAttacks, d, defenderLines) {
        if(defenderLines.constructor !== Array ) throw 'defenderLines needs to be an Array. defenderLines:' + defenderLines;

        this.defenderLinesRate[d] = {
            description: defenderLines[d].toString(),
            rates: this.ratesByStrategy(WinningChanceOfnAttacks, AttackingStrategiesPoints),
            attackResults: WinningChanceOfnAttacks,
        }

    }

    calculateAvgForBestStrategy() {
        for (let s of Object.values(this.BestChoseForStrategy)) {
            s.avg /= this.defenderLinesRate.length;
        }

    }

    testAttacks(attackers, defenderLines) {
        if(defenderLines === undefined) defenderLines = this.defenderLines;
        if(defenderLines.constructor !== Array ) throw 'defenderLines needs to be an Array. defenderLines:' + defenderLines;
        if(attackers.constructor !== Number) throw 'Put a valid number of attackers'
        if(attackers < 0) throw 'Attackers must be 0 or more. Attackers: ' + attackers;


        this.attackers = attackers;

        for (let d = 0; d < defenderLines.length; d++) {
            let attacks = countWinningChanceOfnAttacks(attackers, defenderLines[d], 1000);

            this.addRateForEachAttack(attacks, d, defenderLines);


            for (let r of Object.keys(this.defenderLinesRate[d].rates)) {
                if( this.BestChoseForStrategy[r].value < this.defenderLinesRate[d].rates[r].totalPoints) {
                    this.BestChoseForStrategy[r].value = this.defenderLinesRate[d].rates[r].totalPoints;
                    this.BestChoseForStrategy[r].index = d;
                    this.BestChoseForStrategy[r].description = this.defenderLinesRate[d].description;
                    this.BestChoseForStrategy[r].attackResults = this.defenderLinesRate[d];
                    if(this.paths[d]) {
                        this.BestChoseForStrategy[r].path = this.paths[d];

                    }
                }

                //just add points to calc avg
                this.BestChoseForStrategy[r].avg += this.defenderLinesRate[d].rates[r].totalPoints;
            }

        }

    }


    convertPathsToDefenderLines() {
        this.defenderLines = [];
        for (let p of this.paths) {
            let defenderLine = [];
            let i=0;
            for (let s of Object.values(p)) {

                if(i !== 0) //first territory is starting territory
                    defenderLine.push(s);

                i++;
            }

            this.defenderLines.push(defenderLine)
        }

    }

    getSelectiveRates(whichRate) {
        if(this.defenderLinesRate.length === 0) {
            console.info("No rate is done yet! defenderLinesRate is empty.")
            return;
        }

        if(whichRate === undefined) {
            if(this.selectiveRates.over60PercentWin.length === 0) {

                for (let dr of this.defenderLinesRate) {
                       if(dr.attackResults.winAll > 0.60) {
                       this.selectiveRates.over60PercentWin.push(dr);
                   }
                       if(dr.attackResults.winAll > 0.85) {
                           this.selectiveRates.over85PercentWin.push(dr);
                       }
                       if(dr.attackResults.winAll > 0.95) {
                           this.selectiveRates.over95PercentWin.push(dr);
                       }

               }//for
        } //if 60rate is empty

            return this.selectiveRates;
        } //get all rates

        else {
            let selectedRate;
            if(/60/g.test(whichRate)) {selectedRate = this.selectiveRates.over60PercentWin}
            if(/85/g.test(whichRate)) {selectedRate = this.selectiveRates.over85PercentWin}
            if(/95/g.test(whichRate)) {selectedRate = this.selectiveRates.over95PercentWin}

            if(selectedRate === undefined) {console.warn(whichRate + " is not in selectiveRates"); return;}

            if(selectedRate.length === 0) {
                for (let dr of this.defenderLinesRate) { //calculate all rates
                    if(/60/g.test(whichRate)) {
                        if(dr.attackResults.winAll > 0.60) {
                            this.selectiveRates.over60PercentWin.push(dr);
                        }
                    } //if 60rate is empty
                    if(/85/g.test(whichRate)){
                        if(dr.attackResults.winAll > 0.85) {
                            this.selectiveRates.over85PercentWin.push(dr);
                        }
                    } //if 60rate is empty
                    if(/90/g.test(whichRate)) {
                        if(dr.attackResults.winAll > 0.95) {
                            this.selectiveRates.over95PercentWin.push(dr);
                        }
                    } //if 60rate is empty

                }
            }//if selected rate is empty

            return selectedRate;
        }


    }

}


