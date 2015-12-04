'use strict';

/**
 * Grid
 *
 * @param width
 * @param height
 * @constructor
 */
function Grid(width, height) {
    this.width = width;
    this.height = height;

    this.cells = this.empty();
}

/**
 * Cell Iterator
 *
 * @param callback
 */
Grid.prototype.eachCell = function(callback) {
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            callback(x, y, this.cells[x][y]);
        }
    }
};

/**
 * Array of Available Cells
 *
 * @returns {Array}
 */
Grid.prototype.availableCells = function() {
    var cells = [];

    this.eachCell(function(x, y, cell) {
        if (!cell.mine) {
            cells.push({x: x, y: y});
        }
    });

    return cells;
};

/**
 * Are there cells available?
 *
 * @returns {boolean}
 */
Grid.prototype.cellsAvailable = function() {
    return !!this.availableCells().length;
};

/**
 * Empty the Grid
 *
 * @returns {Array}
 */
Grid.prototype.empty = function() {
    var cells = [];

    for (var x = 0; x < this.width; x++) {
        var row = cells[x] = [];

        for (var y = 0; y < this.height; y++) {
            row.push(null);
        }
    }

    return cells;
};

/**
 * Insert Tile
 *
 * @param tile
 */
Grid.prototype.insertTile = function(tile) {
    this.cells[tile.x][tile.y] = tile;
};

/**
 * Get Tile at X, Y
 *
 * @param x
 * @param y
 * @returns {*}
 */
Grid.prototype.getTile = function(x, y) {
    return this.cells[x][y];
};

/**
 * Get Cells Adjacent to X, Y
 *
 * @param x
 * @param y
 * @returns {Array}
 */
Grid.prototype.getCellsAdjacent = function(x, y) {
    var cells = [];

    for (var x2 = x - 1; x2 <= x + 1; x2++) {
        for (var y2 = y - 1; y2 <= y + 1; y2++) {
            if ((x2 != x || y2 != y) && this.withinBounds(x2, y2)) {
                cells.push({x: x2, y: y2});
            }
        }
    }

    return cells;
};

/**
 * Get Adjacent Tiles without Nummbers
 *
 * @param x
 * @param y
 * @returns {Array}
 */
Grid.prototype.getTilesAdjacentWithoutNumbers = function(x, y) {
    var tiles = [];

    for (var x2 = x - 1; x2 <= x + 1; x2++) {
        for (var y2 = y - 1; y2 <= y + 1; y2++) {
            if ((x2 != x || y2 != y) && this.withinBounds(x2, y2)) {

                var tile = this.getTile(x2, y2);

                if (!tile.numbered) {
                    tiles.push(tile);
                }
            }
        }
    }

    return tiles;
};

/**
 * Get Tiles without Mines or Numbers
 *
 * @returns {Array}
 */
Grid.prototype.getTilesWithoutMinesOrNumbers = function() {
    var tiles = [];
    this.eachCell(function(x, y, tile) {
        if (!tile.mine && !tile.numbered) {
            tiles.push(tile);
        }
    });

    return tiles;
};

/**
 * Get Tiles without Mines or Numbers
 *
 * @returns {Array}
 */
Grid.prototype.getTilesWithNumbers = function() {
    var tiles = [];
    this.eachCell(function(x, y, tile) {
        if (tile.numbered) {
            tiles.push(tile);
        }
    });

    return tiles;
};

/**
 * Get Tiles without Mines or Numbers
 *
 * @returns {Array}
 */
Grid.prototype.getAllTiles = function() {
    var tiles = [];
    this.eachCell(function(x, y, tile) {
        tiles.push(tile);
    });

    return tiles;
};

/**
 * Get Tiles with Mines
 *
 * @returns {Array}
 */
Grid.prototype.getTilesWithMines = function() {
    var tiles = [];
    this.eachCell(function(x, y, tile) {
        if (tile.mine) {
            tiles.push(tile);
        }
    });

    return tiles;
};

/**
 * Get Tiles with Flags, yet no Mines
 *
 * @returns {Array}
 */
Grid.prototype.getTilesWithFlagsAndNoMines = function() {
    var tiles = [];
    this.eachCell(function(x, y, tile) {
        if (!tile.mine && tile.flagged) {
            tiles.push(tile);
        }
    });

    return tiles;
};

/**
 * Get Tiles Adjacent to X, Y
 *
 * @param x
 * @param y
 * @returns {Array}
 */
Grid.prototype.getTilesAdjacent = function(x, y) {
    var cells = this.getCellsAdjacent(x, y);
    var tiles = [];

    for (var i = 0; i < cells.length; i++) {
        tiles.push(this.getTile(cells[i].x, cells[i].y));
    }

    return tiles;
};

/**
 * Get Empty Tiles Adjacent to X, Y
 *
 * @param x
 * @param y
 * @returns {Array}
 */
Grid.prototype.getEmptyTilesAdjacent = function(x, y) {
    var cells = this.getTilesAdjacent(x, y);
    var tiles = [];

    for (var i = 0; i < cells.length; i++) {
        var tile = cells[i];

        if (!tile.mine && !tile.flagged && !tile.cleared) {
            tiles.push(tile);
        }
    }

    return tiles;
};

/**
 * Get Random Available Cell
 */
Grid.prototype.getRandomAvailableCell = function() {
    var cells = this.availableCells();

    if (cells.length) {
        return cells[Math.floor(Math.random() * cells.length)];
    }
};

/**
 * Are the coordinates within the bounds of the grid?
 *
 * @param x
 * @param y
 * @returns {boolean}
 */
Grid.prototype.withinBounds = function(x, y) {
    return x >= 0 && x < this.width &&
        y >= 0 && y < this.height;
};