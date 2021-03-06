'use strict';

/**
 * Tile
 *
 * @param x
 * @param y
 * @constructor
 */
function Tile(x, y) {
    this.x = x;
    this.y = y;

    this.mine = false;
    this.flagged = false;
    this.cleared = false;
    this.numbered = false;
    this.numberValue = 0;
    this.covered = true;
}

/**
 * Plant the Mine
 */
Tile.prototype.plantMine = function() {
    this.mine = true;
};

/**
 * Unplant Mine
 */
Tile.prototype.unplantMine = function() {
    this.mine = false;
};

/**
 * Reset Tile
 */
Tile.prototype.reset = function() {
    this.mine = false;
    this.flagged = false;
    this.cleared = false;
    this.numbered = false;
    this.numberValue = 0;
    this.covered = true;
};