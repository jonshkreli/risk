var settings = {

    fastGame: {
        value: true,
        menu: "Fast Game"
    },
    DoOrDieAttack: {
        value: true,
        menu: "Do Or Die Attack"
    },
    TerritoriesToWin: {
        value: 20, // number or "all"
        menu: "Territories To Win"
    }

};


var rules = {
    SoldiersFromContinents: {
        "North-America":{territories: 9, soldiers: 5},
        "South-America": {territories: 4, soldiers: 2},
        "Europe": {territories: 7, soldiers: 2},
        "Africa":{territories: 6, soldiers: 2},
        "Asia": {territories: 12, soldiers: 2},
        "Australia": {territories: 4, soldiers: 2},
    },
}
