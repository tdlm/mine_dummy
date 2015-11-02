'use strict';

/**
 * HTML Actuator
 *
 * @param EventManager
 * @param HtmlElementsObject
 * @constructor
 */
function HtmlActuator(EventManager, HtmlElementsObject) {
    // Constructor settings
    this.events = EventManager;
    this.table = document.getElementById(HtmlElementsObject.table_id);
    this.startButton = document.getElementById(HtmlElementsObject.start_button_id);
    this.mineCountSpan = document.getElementById(HtmlElementsObject.mine_count_id);

    // Initial settings
    this.width = 0;
    this.height = 0;
    this.mineCount = 0;
    this.flagCount = 0;

    // Listeners for HTML Events
    this.startButton.onclick = this.onClickStart.bind(this);

    // Listeners for EventManager Events
    this.events.addListener('new_grid', this.onNewGrid.bind(this));
    this.events.addListener('clear_tile', this.onClearTile.bind(this));
    this.events.addListener('set_number_tile', this.onSetNumberTile.bind(this));
    this.events.addListener('unset_number_tile', this.onUnsetNumberTile.bind(this));
    this.events.addListener('flag_tile', this.onFlagTile.bind(this));
    this.events.addListener('unflag_tile', this.onUnflagTile.bind(this));
    this.events.addListener('step_on_mine', this.onStepOnMine.bind(this));
    this.events.addListener('expose_mine', this.onExposeMine.bind(this));
    this.events.addListener('bad_flag', this.onBadFlag.bind(this));
    this.events.addListener('update_mine_count', this.onUpdateMineCount.bind(this));
}

/**
 * Listener: New Grid
 *
 * @param grid
 */
HtmlActuator.prototype.onNewGrid = function(grid) {
    this.width = grid.width;
    this.height = grid.height;
    this.mineCount = grid.mines;
    this.flagCount = 0;

    this.events.trigger('update_mine_count', {mines: this.mineCount, flags: this.flagCount});

    var length = this.table.rows.length;

    for (var r = 0; r < length; r++) {
        this.table.deleteRow(0);
    }

    for (var x = 0, y = 0, row = null, cell = null; x < grid.width; x++) {
        row = this.table.insertRow(x);
        for (y = 0; y < grid.height; y++) {
            cell = row.insertCell(y);
            cell.classList.add('tile');
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.onclick = this.onCellClick.bind(this);
        }
    }
};

/**
 * Listener: Clear Tile
 *
 * @param tile
 */
HtmlActuator.prototype.onClearTile = function(tile) {
    var cell = this.table.rows[tile.x].cells[tile.y];
    cell.classList.add('clear');

    if (cell.dataset.number) {
        cell.innerHTML = cell.dataset.number;
    }
};

/**
 * Listener: Set Number Tile
 *
 * @param tile
 */
HtmlActuator.prototype.onSetNumberTile = function(tile) {
    var cell = this.table.rows[tile.x].cells[tile.y];
    cell.dataset.number = tile.tile.numberValue;
};

/**
 * Listener: Unset Number Tile
 *
 * @param tile
 */
HtmlActuator.prototype.onUnsetNumberTile = function(tile) {
    var cell = this.table.rows[tile.x].cells[tile.y];
    cell.dataset.number = null;
};

/**
 * Listener: Flag Tile
 *
 * @param tile
 */
HtmlActuator.prototype.onFlagTile = function(tile) {
    this.flagCount++;
    this.events.trigger('update_mine_count', {mines: this.mineCount, flags: this.flagCount});

    var cell = this.table.rows[tile.x].cells[tile.y];
    cell.classList.add('flag');
};

/**
 * Listener: Unflag Tile
 *
 * @param tile
 */
HtmlActuator.prototype.onUnflagTile = function(tile) {
    this.flagCount--;
    this.events.trigger('update_mine_count', {mines: this.mineCount, flags: this.flagCount});

    var cell = this.table.rows[tile.x].cells[tile.y];
    cell.classList.remove('flag');
};

/**
 * Listener: Stepped on a Mine
 *
 * @param tile
 */
HtmlActuator.prototype.onStepOnMine = function(tile) {
    var cell = this.table.rows[tile.x].cells[tile.y];
    cell.classList.add('red');
};

/**
 * Listener: Mine Exposed
 *
 * @param tile
 */
HtmlActuator.prototype.onExposeMine = function(tile) {
    var cell = this.table.rows[tile.mine.x].cells[tile.mine.y];
    cell.classList.add('mine');
};

/**
 * Listener: Bad Flag Revealed
 *
 * @param tile
 */
HtmlActuator.prototype.onBadFlag = function(tile) {
    var cell = this.table.rows[tile.mine.x].cells[tile.mine.y];
    cell.classList.add('red');
};

/**
 * Listener: Update Mine Count
 *
 * @param count
 */
HtmlActuator.prototype.onUpdateMineCount = function(count) {
    this.mineCountSpan.innerHTML = count.mines - count.flags;
};

/**
 * Listener: Start Button click
 */
HtmlActuator.prototype.onClickStart = function() {
    this.events.trigger('start');
};

/**
 * Listener: Cell click
 *
 * @param event
 */
HtmlActuator.prototype.onCellClick = function(event) {
    var event_trigger;

    if (event.shiftKey || event.ctrlKey || event.altKey) {
        event_trigger = 'tile_flag';
    } else {
        event_trigger = 'tile_step';
    }

    this.events.trigger(event_trigger, {x: event.target.dataset.x, y: event.target.dataset.y});
};