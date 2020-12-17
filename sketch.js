var buttonAttackFrom, buttonMoveSoldersFrom, statePressMenu, activeState;
var game, playersTable;
var attackFromState, moveSoldiersFromState;
let map;
var isInPlayersTerritoryTree = false;




let z = 0;

function setup() {
    createCanvas(1280, 720);
    frameRate(20);
    loadImage('assets/risk2.jpg', img => {
      map = img;
    });

    createOnStatePressMenu();

    $('#closeStateMenu').click(() => {
        statePressMenu.hide();
        activeState = undefined;
    });

     initGameAndPlayers();
      game.assignCardsToPlayers()
     game.putSoldiersInFieldFromPlayersHand()
     // onNextPlayerTurn()
     game.currentState = gameState.newTurn

}

function draw() {
    // background(0); // Set the background to black
    clear();
    if(map) {
        image(map, 0, 0);
    }

    z = z - 1;
    if (z < 0) {
        z = height;
    }
    // line(0, z, width, z);
    textSize(50)
    text(z, 50,50)

    /*init country rectangles so they can by clicked/touched*/
    initTouchingRect();

    // background(0); // Set the background to black


}


function initTouchingRect() {
    noFill();
    stroke('blue');

    for (const continentKey of Object.keys(continentsCoordinates)) {
        const c = continentsCoordinates[continentKey];
        for (const stateKey of Object.keys(c)) {
            const s = c[stateKey];
            for (const stateCoord of s) {
                if(stateCoord.type === 'rect') {
                    rect(stateCoord.x, stateCoord.y, stateCoord.w, stateCoord.h);
                } else if (stateCoord.type === 'ellipse') {
                    push();
                    ellipseMode(CORNER);
                    ellipse(stateCoord.x, stateCoord.y, stateCoord.w, stateCoord.h);
                    pop();
                }
                if(game.winner === undefined)
                    if(game.playerTurn.type === PlayerType.HUMAN) {
                        if($('.modal').hasClass('show') === false)
                            if(statePressMenu.css('display') === 'none')
                                if(mouseX > stateCoord.x && mouseX < stateCoord.x + stateCoord.w &&
                                    mouseY > stateCoord.y && mouseY < stateCoord.y + stateCoord.h ) {
                                    // console.log(mouseY);

                                    if(mouseIsPressed) {

                                        activeState = stateKey;
                                        $('#activeStateTitle').text(activeState);


                                        if(game.currentState === gameState.newTurn) { //put solders in field

                                            for (let t of game.playerTurn.territories) {
                                                if(t.name === stateKey) { //find correct state
                                                    t.soldiers += game.soldierToPut;
                                                    game.currentState = gameState.finishedNewTurnSoldiers;

                                                }
                                            }

                                            $('#nextTurn').removeClass('disabled');
                                        }

                                        // time to open menu on state
                                        else if ((game.currentState === gameState.finishedNewTurnSoldiers ||
                                            game.currentState === gameState.attackFinished)) {
                                            // ellipse(mouseX, mouseY, 50, 50);
                                            // console.log((stateKey + " " + continentKey));

                                            //check if it territory belong to player
                                            let PlayerTerritory = game.playerTurn.territories.find(e => e.name === stateKey);

                                            if (PlayerTerritory !== undefined) {
                                                statePressMenu.hide();
                                                statePressMenu.css({'left': stateCoord.x, "top": stateCoord.y});
                                                buttonAttackFrom.off(); //remove all event listeners before
                                                buttonMoveSoldersFrom.off(); //remove all event listeners before

                                                if (game.currentState === gameState.finishedNewTurnSoldiers) {
                                                    buttonAttackFrom.click(() => onAttackFromClick(stateKey));
                                                    buttonAttackFrom.attr("disabled", false);
                                                } //if attack has not finished enable attack

                                                if(PlayerTerritory.soldiers === 1) {
                                                    buttonMoveSoldersFrom.attr("disabled", true);
                                                } else {
                                                    buttonMoveSoldersFrom.attr("disabled", false);
                                                    buttonMoveSoldersFrom.click(() => onMoveSoldersFromClick(stateKey));
                                                }

                                                statePressMenu.show('fast', () => {
                                                    if(game.playerTurn.territories.find(e => e.name === activeState).soldiers ===1 ){
                                                        buttonAttackFrom.off(); //remove all event listeners before
                                                        buttonAttackFrom.attr("disabled", true);
                                                    }
                                                });

                                            }

                                        } //finishedNewTurnSoldiers/attackFinished


                                        //pick where to attack
                                        else if(game.currentState === gameState.attackTo) {

                                            let AttackingTerritory = game.playerTurn.territories.find(e => e.name === attackFromState);

                                            //check if it territory belong to player
                                            let AttackedTerritory = game.playerTurn.territories.find(e => e.name === stateKey);

                                            if(AttackedTerritory !== undefined) { //can not attack own territory
                                                console.log("can not attack your territory")
                                            } else if(AttackingTerritory.borders.find(e => e === stateKey) === undefined){ //check if attacked state is in border
                                                console.log("territory not in border")
                                            } else { //attack
                                                console.log("att with all forces till to the end");

                                                if(AttackingTerritory.soldiers > 3) {
                                                    attack(3);
                                                } else if(AttackingTerritory.soldiers === 3){
                                                    attack(2);
                                                } else if(AttackingTerritory.soldiers === 2){
                                                    attack(1);
                                                } else if(AttackingTerritory.soldiers === 1){
                                                    throw 'can not attack from here. Here are '+AttackingTerritory.soldiers +' soldiers.'
                                                } else throw  AttackingTerritory.soldiers+' soldiers.';

                                                /*check if player can not attack anymore because he/she has only 1 soldier per territory*/
                                                if(game.playerTurn.territories.find(e => e.soldiers > 1)) {
                                                    game.currentState = gameState.finishedNewTurnSoldiers;
                                                } else { //means all territories have only 1 soldier
                                                    game.currentState = gameState.attackFinished;
                                                }

                                                UpdateTable();
                                                attackFromState = undefined;
                                                activeState = undefined;
                                                $('#nextTurn').removeClass('disabled');


                                            }

                                        }

                                        //pick where to mov soldiers
                                        else if ((game.currentState === gameState.moveSoldiersTo)) {
                                            let PlayerTerritory = game.playerTurn.territories.find(e => e.name === stateKey);

                                            if(PlayerTerritory === undefined) { //can not move in others territory
                                                console.log("can not move in others territory")
                                            } else if (stateKey === moveSoldiersFromState) {
                                                console.log("can not move into same territory")

                                            } else if (! canMoveToTerritory()) {
                                                console.log("can not move into unconnected territory")

                                            } else { //move
                                                console.log("move to " + activeState);

                                                $('#howManySoldiersToMove').modal('show')

                                            }

                                        }

                                    } //mouse pressed on state
                                }

                    } else if(game.playerTurn.type === PlayerType.COMPUTER) {

                        if(game.playerTurn.isPlaying === false)
                        game.playerTurn.play();
                    }


                    if(s.indexOf(stateCoord) === 0) { //only for one zone
                        let textvalue = 0;

                        /*check if players have territories*/
                        if(game && game.players)
                        for (let p of game.players) {

                            if(p.territories)
                            for (let t of p.territories) {
                                if(t.name.toLowerCase() === stateKey.toLocaleLowerCase()) {
                                    textvalue = t.soldiers
                                    push();
                                    fill(p.color)
                                    stroke(10); textSize(46); rectMode(CENTER); // Set rectMode to CENTER
                                    text(textvalue, stateCoord.x+ stateCoord.w /2 ,  stateCoord.y+ stateCoord.h /2 );
                                    pop();
                                }
                            }
                        }


                    }


            }
        }
    }


}


function onAttackFromClick(state) {
    console.log(state);
    $('#nextTurn').addClass('disabled');

    attackFromState = state;
    game.currentState = gameState.attackTo;
    statePressMenu.hide();
}

function onMoveSoldersFromClick(state) {
    console.log(state)

    $('#nextTurn').addClass('disabled');

    moveSoldiersFromState = state;
    game.currentState = gameState.moveSoldiersTo;
    statePressMenu.hide();

}



function createOnStatePressMenu() {

statePressMenu = $(`<div class="statePressMenu rounded">
<div>
<h4 id="activeStateTitle">${activeState}</h4> 
<button id="closeStateMenu" type="button" class="close" aria-label="Close">
  <span aria-hidden="true">&times;</span>
</button>
</div>
</div>`);



    buttonAttackFrom = $('<button class="btn btn-primary btn-block">Attack from </button>');
    buttonMoveSoldersFrom = $('<button class="btn btn-info btn-block">Move Soldiers from </button>');

    statePressMenu.append(buttonAttackFrom, buttonMoveSoldersFrom);

    $('body').append(statePressMenu);

    statePressMenu.hide();

}

function initGameAndPlayers(playerList) {
    let newGame = game === undefined;

    if(playerList === undefined) {
        let player2 = new Player("RRR", PlayerType.HUMAN);
        game = new Game([new Player("Jon", PlayerType.HUMAN),
            new Player("p3", PlayerType.COMPUTER), new Player("p4", PlayerType.COMPUTER)]);
    }
    else {
        let players = [];
        for (let pl of playerList) {
            players.push(new Player(pl.name, pl.playerType))
        }

        game = new Game(players);
    }

if(newGame) {
    let tableContainer = $('<div id="tableContainer"></div>').append(initPlayersTable());
    $('body').append(tableContainer)
} else UpdateTable();
}


function initPlayersTable() {
  return   playersTable = $(`
    <table class="table table-dark" id="playersTable">
        <thead>
        <tr>
            <th scope="col">#</th>
            <th scope="col">Nme</th>
            <th scope="col">Cards</th>
            <th scope="col">Territories</th>
            <th scope="col">Type</th>
        </tr>
        </thead>
        <tbody>
        ` +
        game.players.map((player, i) => {
            let playerTurn = "";
            if(player.name === game.playerTurn.name) {
                playerTurn = 'table-primary'
            }
            return `
<tr class="${playerTurn}">
            <th scope="row">${i+1}</th>
            <td style="color: ${player.color}">${player.name}</td>
            <td>${player.cards.length}</td>
            <td>${player.territories.length}</td>
            <td>${player.type}</td>

        </tr>`
        })
        + `</tbody>
    </table>
     `)

}

function UpdateTable() {
   // $('#playersTable').text(initPlayersTable().html());
    $('#tableContainer table').replaceWith(initPlayersTable());
}




