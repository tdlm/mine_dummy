'use strict';

function Grid(width, height) {
    this.width = width;
    this.height = height;

    this.cells = this.empty();
}

Grid.prototype.eachCell = function(callback) {
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            callback(x, y, this.cells[x][y]);
        }
    }
};

Grid.prototype.availableCells = function() {
    var cells = [];

    this.eachCell(function(x, y, cell) {
        if (!cell.mine) {
            cells.push({x: x, y: y});
        }
    });

    return cells;
};

Grid.prototype.cellsAvailable = function() {
    return !!this.availableCells().length;
};

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

Grid.prototype.insertTile = function(tile) {
    this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.getTile = function(x, y) {
    return this.cells[x][y];
};

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

Grid.prototype.getTilesWithoutMinesOrNumbers = function() {
    var tiles = [];
    this.eachCell(function(x, y, tile) {
        if (!tile.mine && !tile.numbered) {
            tiles.push(tile);
        }
    });

    return tiles;
};

Grid.prototype.getTilesWithMines = function() {
    var tiles = [];
    this.eachCell(function(x, y, tile) {
        if (tile.mine) {
            tiles.push(tile);
        }
    });

    return tiles;
};

Grid.prototype.getTilesWithFlagsAndNoMines = function() {
    var tiles = [];
    this.eachCell(function(x, y, tile) {
        if (!tile.mine && tile.flagged) {
            tiles.push(tile);
        }
    });

    return tiles;
};

Grid.prototype.getTilesAdjacent = function(x, y) {
    var cells = this.getCellsAdjacent(x, y);
    var tiles = [];

    for (var i = 0; i < cells.length; i++) {
        tiles.push(this.getTile(cells[i].x, cells[i].y));
    }

    return tiles;
};

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

Grid.prototype.getRandomAvailableCell = function() {
    var cells = this.availableCells();

    if (cells.length) {
        return cells[Math.floor(Math.random() * cells.length)];
    }
};

Grid.prototype.withinBounds = function(x, y) {
    return x >= 0 && x < this.width &&
        y >= 0 && y < this.height;
};