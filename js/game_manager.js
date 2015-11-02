'use strict';

/**
 * Game Manager
 *
 * @param width
 * @param height
 * @param mines
 * @param HtmlElementsObject
 * @constructor
 */
function GameManager(width, height, mines, HtmlElementsObject) {
    this.width = width; // Grid width
    this.height = height; // Grid height
    this.mines = mines; // Number of mines
    this.grid = null;
    this.ended = false;
    this.steps = 0;

    this.events = new EventManager();
    this.actuator = new HtmlActuator(this.events, HtmlElementsObject);

    this.setup();

    this.events.addListener('start', this.setup.bind(this));
    this.events.addListener('tile_step', this.onTileStep.bind(this));
    this.events.addListener('tile_flag', this.onTileFlag.bind(this));
}

/**
 * Set Things Up
 */
GameManager.prototype.setup = function() {
    this.ended = false;
    this.steps = 0;

    this.grid = new Grid(this.width, this.height);

    this.events.trigger('new_grid', {width: this.width, height: this.height, mines: this.mines});

    this.addStartTiles();
    this.plantTheMines();
    this.setNumberTiles();
};

/**
 * Step On a Mine
 *
 * @param x
 * @param y
 */
GameManager.prototype.stepOnMine = function(x, y) {
    if (this.steps <= 1 && this.moveFirstMine(x, y)) {
        this.clearTile(x, y);
        this.resetNumberTiles();
        return;
    }

    this.ended = true;

    this.events.trigger('step_on_mine', {x: x, y: y});

    this.exposeMineTiles();
    this.exposeBadFlags();
};

/**
 * Add Starting Tiles
 */
GameManager.prototype.addStartTiles = function() {
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            var tile = new Tile(x, y);

            this.grid.insertTile(tile);

            this.events.trigger('insert_tile', {x: x, y: y});
        }
    }
};

GameManager.prototype.moveFirstMine = function(x, y) {
    if (!this.grid.cellsAvailable()) {
        return false;
    }

    var tile = this.grid.getTile(x, y),
        cell = this.grid.getRandomAvailableCell(),
        newTile = this.grid.getTile(cell.x, cell.y);

    tile.unplantMine();
    newTile.plantMine();

    return true;
};

/**
 * Expose Mine Tiles
 */
GameManager.prototype.exposeMineTiles = function() {
    var mines = this.grid.getTilesWithMines();
    for (var i = 0; i < mines.length; i++) {
        this.events.trigger('expose_mine', {mine: mines[i]});
    }
};

/**
 * Expose Bad Flags (ouch)
 */
GameManager.prototype.exposeBadFlags = function() {
    var mines = this.grid.getTilesWithFlagsAndNoMines();
    for (var i = 0; i < mines.length; i++) {
        this.events.trigger('bad_flag', {mine: mines[i]});
    }
};

/**
 * Plant the Mines
 */
GameManager.prototype.plantTheMines = function() {
    for (var i = 0; i < this.mines; i++) {
        this.plantRandomMine();
    }
};

GameManager.prototype.resetNumberTiles = function() {
    var tilesWithNumbers = this.grid.getTilesWithNumbers();

    for (var i = 0; i < tilesWithNumbers.length; i++) {

        var tile = tilesWithNumbers[i];

        tile.numbered = false;
        tile.numberValue = 0;
    }

    this.setNumberTiles();
};

/**
 * Set the Number Tiles
 */
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

/**
 * Plant a Random Mine somewhere
 */
GameManager.prototype.plantRandomMine = function() {
    if (this.grid.cellsAvailable()) {
        var cell = this.grid.getRandomAvailableCell();
        var tile = this.grid.getTile(cell.x, cell.y);

        tile.plantMine();

        this.events.trigger('plant_mine', {x: cell.x, y: cell.y, tile: tile});
    }
};

/**
 * Clear Tile at X, Y
 *
 * @param x
 * @param y
 */
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

/**
 * Attempt to Clear Adjacent Tiles
 *
 * @param x
 * @param y
 */
GameManager.prototype.clearAdjacentTiles = function(x, y) {
    var adjacentEmptyTiles = this.grid.getEmptyTilesAdjacent(x, y);

    for (var i = 0, tile = null; i < adjacentEmptyTiles.length; i++) {
        tile = adjacentEmptyTiles[i];
        this.clearTile(tile.x, tile.y);
    }
};

/**
 * Listener: On Tile Step
 *
 * @param tile
 */
GameManager.prototype.onTileStep = function(tile) {
    this.step(tile.x, tile.y);
};

/**
 * Listener: On Tile Flag
 *
 * @param tileObj
 */
GameManager.prototype.onTileFlag = function(tileObj) {

    var tile = this.grid.getTile(tileObj.x, tileObj.y);

    if (tile.flagged) {
        this.unflag(tile.x, tile.y);
    } else {
        this.flag(tile.x, tile.y);
    }
};

/**
 * Step at X, Y
 *
 * @param x
 * @param y
 */
GameManager.prototype.step = function(x, y) {
    if (this.ended) {
        // Do nothing
    } else if (!this.grid.withinBounds(x, y)) {
        // Do nothing
    } else {
        var tile = this.grid.getTile(x, y);

        if (!tile.flagged && tile.mine) {
            this.steps++;

            this.stepOnMine(tile.x, tile.y);
        } else if (tile.flagged && tile.mine) {
            // Flagged mine; do nothing
        } else if (tile.flagged && !tile.mine) {
            // Flagged empty tile; do nothing
        } else if (!tile.covered) {
            // Do nothing
        } else {
            this.steps++;

            // Clear this mine and attempt to clear any adjacent
            this.clearTile(x, y);
        }
    }
};

/**
 * Flag Tile at X, Y
 *
 * @param x
 * @param y
 */
GameManager.prototype.flag = function(x, y) {

    if (this.ended) {
        // Do nothing
        return;
    }

    var tile = this.grid.getTile(x, y);

    if (tile.cleared) {
        return;
    }

    tile.flagged = true;

    this.events.trigger('flag_tile', {x: x, y: y, tile: tile});
};

/**
 * Unflag Tile at X, Y
 *
 * @param x
 * @param y
 */
GameManager.prototype.unflag = function(x, y) {
    if (this.ended) {
        // Do nothing
        return;
    }

    var tile = this.grid.getTile(x, y);
    tile.flagged = false;

    this.events.trigger('unflag_tile', {x: x, y: y, tile: tile});
};