/*Menu events*/

$( document ).ready(function() {

    $('#newGame').on('click',() => {

        let playersNumber;

        let HowManyPlayers = $('#HowManyPlayers');

        HowManyPlayers.modal('show');

        $('#cancelPlayersNumber').click(() => {
            console.log(HowManyPlayers);

            HowManyPlayers.modal('hide')
        });


        $('#continueToPlayersConfiguration').click(() => {

            playersNumber = $('#numberOfPlayers').val();

            HowManyPlayers.modal('hide');
            console.log(HowManyPlayers)

            let playersConfiguration = $('#playersConfiguration');

            let playerListForm = $(getPlayerListForm(playersNumber))

            $('#players-config-list').replaceWith(playerListForm);

            playersConfiguration.modal('show');

            $('#cancelPLayersConfiguration').click(() => {
                playersConfiguration.modal('hide');
            });

            $('#startGame').click(() => {

                // console.log(playersNumber)

                let playerList = [];
                for (let i = 0; i < playersNumber; i++) {
                   let playerName = $('#player-'+i).val();
                   let playerType = $("input[name='player-type-" + i + "']:checked").val();

playerList.push({name: playerName, playerType: playerType});
                   console.log(playerName,playerType)
                }

                initGameAndPlayers(playerList);
                playersConfiguration.modal('hide');

                $('#distributeCards').toggleClass('disabled')
            })

        });


    });

    let distributeCards = $('#distributeCards');
    let putSoldersInField = $('#putSoldersInField');
    let openCards = $('#openCards');

    distributeCards.click(() => {
        game.assignCardsToPlayers();
        game.currentState = gameState.cardsDistributed;
        distributeCards.toggleClass('disabled');

        putSoldersInField.toggleClass('disabled');
    });

    putSoldersInField.click(() => {
      game.putSoldiersInFieldFromPlayersHand();
        game.currentState = gameState.soldersDistributed;
        UpdateTable();
        game.currentState = gameState.newTurn;
        putSoldersInField.toggleClass('disabled');

    })


    /*numberOfSoldiersToMove Modal buttons*/

    $('#cancelNumberOfSoldiersToMove').on('click', () => {
        console.log('cancel')

        activeState = undefined;
        $('#howManySoldiersToMove').modal('hide')
    })


    $('#continueNumberOfSoldiersToMove').on('click', () => {
        let numberOfSoldiers = parseInt( $('#numberOfSoldiersToMove').val())

        let TerritoryFrom =  game.playerTurn.territories.find(e => e.name === moveSoldiersFromState)
        let availableNumberOfSoldiers = TerritoryFrom.soldiers - 1

        if(numberOfSoldiers === undefined || isNaN(numberOfSoldiers)) {
            console.log("Please put a number");
            return;
        }
        else if(numberOfSoldiers > availableNumberOfSoldiers) {
            console.log("Invalid number of Soldiers. Please put " + availableNumberOfSoldiers + " or less.");
            return;
        }

        //remove soldiers from
        TerritoryFrom.soldiers -= numberOfSoldiers;

        //put soldiers into new territory
        game.playerTurn.territories.find(e => e.name === activeState).soldiers +=numberOfSoldiers

        console.log(numberOfSoldiers + ' soldiers moved from '+moveSoldiersFromState+ ' to '+ activeState);

        game.currentState = gameState.attackFinished;
        UpdateTable();
        moveSoldiersFromState = undefined;
        activeState = undefined;
        $('#nextTurn').removeClass('disabled');
        $('#howManySoldiersToMove').modal('hide');

    })


    $('#nextTurn').on('click',() => {
        $('#nextTurn').addClass('disabled');
        game.nextPlayerTurn();
    })


    $('#showCards').on('click', () => {
        let playerCardsTable;
        if(game.playerTurn.cards.length > 0) {

            let totalStars = 0;
            for (let c of game.playerTurn.cards) totalStars+=c.stars
            let soldiersReceived = soldiersByStars(totalStars);

            playerCardsTable = $(`
<div  id="PlayerCardsTable">
    <table class="table">
        <thead>
        <tr>
            <th scope="col">Name</th>
            <th scope="col">Stars</th>
        </tr>
        </thead>
        <tbody>
        ` +
                game.playerTurn.cards.map((card) => {
                    return `
<tr>
            <td>${card.name}</td>
            <td>${card.stars}</td>

        </tr>`
                })
                + `</tbody>
    </table>
    <p class="align-content-center soliers-cards">You get ${soldiersReceived}.</p>
    </div>
     `)
        } else {
            playerCardsTable = $('<div  id="PlayerCardsTable">You do not have any card.</div>')
        }

        $('#PlayerCards #PlayerCardsTable').replaceWith(playerCardsTable);

        $('#PlayerCards').modal('show');
    })


    $('#cancel').on('click', () => {
        attackFromState = undefined;
        moveSoldiersFromState = undefined;

        if(game.currentState === gameState.moveSoldiersTo) game.currentState = gameState.attackFinished;

        if(game.currentState === gameState.attackTo) game.currentState = gameState.finishedNewTurnSoldiers;
    })


});


function getPlayerListForm(playerAmount) {
    let formString = '<form>';
    for (let i=0; i<playerAmount; i++) {
        let id = 'player-'+i;
        formString += `
  <div class="form-group row">
<input type="text" id="${id}" class="col-sm-4">
   <label for="${id}" class="col-sm-2 col-form-label">Name</label>
   
        <div class="form-check col-sm-2">
          <input class="form-check-input" type="radio" name="player-type-${i}" value="${PlayerType.HUMAN}" checked>
          <label class="form-check-label" for="human">
            Human
          </label>
        </div>
        <div class="form-check col-sm-2">
          <input class="form-check-input" type="radio" name="player-type-${i}" value="${PlayerType.COMPUTER}">
          <label class="form-check-label" for="computer">
            Computer
          </label>
        </div>
</div>
`;

    }
    formString += '</form>';

    return formString;

}


function createPlayersTable() {
    let tableContainer = $('<div id="tableContainer"></div>').append(initPlayersTable());

    $('body').append(tableContainer)

}
