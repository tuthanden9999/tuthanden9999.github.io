var KLoterryContract = function() {
    LocalContractStorage.defineMapProperty(this, "history");

    LocalContractStorage.defineProperties(this, {
        requirePersonNumber: null,
        price: null,
        historyOrderIndex: null
    });
};

KLoterryContract.prototype = {
    init: function() {
        this.requirePersonNumber = 2;
        this.price = new BigNumber(0.1).times(new BigNumber(10).pow(18));
        this.historyOrderIndex = -1;
    },
    
    joinLottery: function() {
        const player_address = Blockchain.transaction.from
        var value = new BigNumber(Blockchain.transaction.value);
        if(!value.gte(this.price)) {
            throw Error("Required at least " + this.price + " to play!")
        } else {
        }

        var lastGameID = this.historyOrderIndex

        if (lastGameID === -1) {
            lastGameID = this._initNewGame()
        }

        const lastGameData = this.history.get(lastGameID)

        if (lastGameData.index === this.requirePersonNumber) {
            lastGameID = this._initNewGame()
        } else {
            if (lastGameData.players.includes(player_address)) {
                throw Error("You have joined this round. Please wait until next round!")
            }
        }

        this._addPlayerToGame(player_address, lastGameID);

        this._lottery(lastGameID);
        
        return {
            game_id: lastGameID,
            player_address: player_address
        };
    },

    getHistory: function() {
        var arr = []
        for (var i = 0; i <= this.historyOrderIndex; i++) {
            arr.push(this.history.get(i))
        }
        return arr
    },
    
    
    _lottery: function(gameID) {
        const gameData = this.history.get(gameID)

        if(gameData.index === this.requirePersonNumber) 
        {
            const winnerNumber = Math.floor(Math.random() * this.requirePersonNumber);
            const bounty = new BigNumber(this.price).times(new BigNumber(0.9 * this.requirePersonNumber))
            const winnerAddress = gameData.players[winnerNumber]
            
            this._transfer(winnerAddress, bounty);

            gameData.winner = winnerAddress
            this.history.put(gameID, gameData)
        }
    },

    _initNewGame: function() {
        const nextGameID = ++this.historyOrderIndex

        this.history.put(nextGameID, {
            id: nextGameID,
            index:  0,
            players: [],
            winner: null,
        })

        return nextGameID
    },

    _addPlayerToGame: function(playerAddress, gameID) {
        const gameData = this.history.get(gameID)
        gameData.players.push(playerAddress)
        gameData.index++

        this.history.put(gameID, gameData)

        return gameData.players.length
    },

    _transfer: function(to, value) {
        var result = Blockchain.transfer(to, value);
        return result;
    },
}

module.exports = KLoterryContract;