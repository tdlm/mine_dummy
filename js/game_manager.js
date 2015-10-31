'use strict';

function GameManager(width, height, mines, HtmlElementsObject) {
    this.width = width; // Grid width
    this.height = height; // Grid height
    this.mines = mines; // Number of mines
    this.grid = null;
    this.ended = false;

    this.events = new EventManager();
    this.actuator = new HtmlActuator(this.events, HtmlElementsObject);

    this.setup();

    this.events.addListener('start', this.setup.bind(this));
    this.events.addListener('tile_step', this.onTileStep.bind(this));
    this.events.addListener('tile_flag', this.onTileFlag.bind(this));
}

GameManager.prototype.setup = function() {
    this.ended = false;

    this.grid = new Grid(this.width, this.height);

    this.events.trigger('new_grid', {width: this.width, height: this.height});

    this.addStartTiles();
    this.plantTheMines();
    this.setNumberTiles();
};

GameManager.prototype.stepOnMine = function(x, y) {
    this.ended = true;

    this.events.trigger('step_on_mine', {x: x, y: y});

    this.exposeMineTiles();
    this.exposeBadFlags();
};

GameManager.prototype.addStartTiles = function() {
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            var tile = new Tile(x, y);

            this.grid.insertTile(tile);

            this.events.trigger('insert_tile', {x: x, y: y});
        }
    }
};

GameManager.prototype.exposeMineTiles = function() {
    var mines = this.grid.getTilesWithMines();
    for (var i = 0; i < mines.length; i++) {
        this.events.trigger('expose_mine', {mine: mines[i]});
    }
};

GameManager.prototype.exposeBadFlags = function() {
    var mines = this.grid.getTilesWithFlagsAndNoMines();
    for (var i = 0; i < mines.length; i++) {
        this.events.trigger('bad_flag', {mine: mines[i]});
    }
};

GameManager.prototype.plantTheMines = function() {
    for (var i = 0; i < this.mines; i++) {
        this.plantRandomMine();
    }
};

GameManager.prototype.setNumberTiles = function() {

    var tilesWithoutMinesOrNumbers = this.grid.getTilesWithoutMinesOrNumbers();

    for (var i = 0; i < tilesWithoutMinesOrNumbers.length; i++) {
        var tile = tilesWithoutMinesOrNumbers[i],
            adjacentTilesWithoutNumbers = this.grid.getTilesAdjacentWithoutNumbers(tile.x, tile.y),
            mines = 0;

        for (var e = 0; e < adjacentTilesWithoutNumbers.length; e++) {

            if (adjacentTilesWithoutNumbers[e].mine) {
                mines++;
            }
        }

        if (mines > 0) {
            tile.numbered = true;
            tile.numberValue = mines;

            this.events.trigger('set_number_tile', {x: tile.x, y: tile.y, tile: tile});
        }
    }
};

GameManager.prototype.plantRandomMine = function() {
    if (this.grid.cellsAvailable()) {
        var cell = this.grid.getRandomAvailableCell();
        var tile = this.grid.getTile(cell.x, cell.y);

        tile.plantMine();

        this.events.trigger('plant_mine', {x: cell.x, y: cell.y, tile: tile});
    }
};

GameManager.prototype.clearTile = function(x, y) {
    var tile = this.grid.getTile(x, y);

    if (!tile.cleared) {
        tile.cleared = true;
        tile.covered = false;

        if (!tile.numbered && !tile.flagged) {
            this.clearAdjacentTiles(x, y);
        }

        this.events.trigger('clear_tile', {x: x, y: y, tile: tile});
    }
};

GameManager.prototype.clearAdjacentTiles = function(x, y) {
    var adjacentEmptyTiles = this.grid.getEmptyTilesAdjacent(x, y);

    for (var i = 0, tile = null; i < adjacentEmptyTiles.length; i++) {
        tile = adjacentEmptyTiles[i];
        this.clearTile(tile.x, tile.y);
    }
};

GameManager.prototype.onTileStep = function(tile) {
    this.step(tile.x, tile.y);
};

GameManager.prototype.onTileFlag = function(tileObj) {

    var tile = this.grid.getTile(tileObj.x, tileObj.y);

    if (tile.flagged) {
        this.unflag(tile.x, tile.y);
    } else {
        this.flag(tile.x, tile.y);
    }
};

GameManager.prototype.step = function(x, y) {

    if (this.ended) {
        // Do nothing
    } else if (!this.grid.withinBounds(x, y)) {
        // Do nothing
    } else {
        var tile = this.grid.getTile(x, y);

        if (!tile.flagged && tile.mine) {
            this.stepOnMine(tile.x, tile.y);
        } else if (tile.flagged && tile.mine) {
            // Flagged mine; do nothing
        } else if (tile.flagged && !tile.mine) {
            // Flagged empty tile; do nothing
        } else if (!tile.covered) {
            // Do nothing
        } else {
            // Clear this mine and attempt to clear any adjacent
            this.clearTile(x, y);
        }
    }
};

GameManager.prototype.flag = function(x, y) {
    var tile = this.grid.getTile(x, y);
    tile.flagged = true;

    this.events.trigger('flag_tile', {x: x, y: y, tile: tile});
};

GameManager.prototype.unflag = function(x, y) {
    var tile = this.grid.getTile(x, y);
    tile.flagged = false;

    this.events.trigger('unflag_tile', {x: x, y: y, tile: tile});
};