'use strict';

function HtmlActuator(EventManager, HtmlElementsObject) {
    this.events = EventManager;
    this.table = document.getElementById(HtmlElementsObject.table_id);
    this.startButton = document.getElementById(HtmlElementsObject.start_button_id);

    this.width = 0;
    this.height = 0;

    this.startButton.onclick = this.onClickStart.bind(this);

    this.events.addListener('new_grid', this.onNewGrid.bind(this));
    this.events.addListener('clear_tile', this.onClearTile.bind(this));
    this.events.addListener('set_number_tile', this.onSetNumberTile.bind(this));
    this.events.addListener('flag_tile', this.onFlagTile.bind(this));
    this.events.addListener('unflag_tile', this.onUnflagTile.bind(this));
    this.events.addListener('step_on_mine', this.onStepOnMine.bind(this));
    this.events.addListener('expose_mine', this.onExposeMine.bind(this));
    this.events.addListener('bad_flag', this.onBadFlag.bind(this));
}

HtmlActuator.prototype.onNewGrid = function(grid) {
    this.width = grid.width;
    this.height = grid.height;

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

HtmlActuator.prototype.onClearTile = function(tile) {
    var cell = this.table.rows[tile.x].cells[tile.y];
    cell.classList.add('clear');

    if (cell.dataset.number) {
        cell.innerHTML = cell.dataset.number;
    }
};

HtmlActuator.prototype.onSetNumberTile = function(tile) {
    var cell = this.table.rows[tile.x].cells[tile.y];
    cell.dataset.number = tile.tile.numberValue;
};

HtmlActuator.prototype.onFlagTile = function(tile) {
    var cell = this.table.rows[tile.x].cells[tile.y];
    cell.classList.add('flag');
};

HtmlActuator.prototype.onUnflagTile = function(tile) {
    var cell = this.table.rows[tile.x].cells[tile.y];
    cell.classList.remove('flag');
};

HtmlActuator.prototype.onStepOnMine = function(tile) {
    var cell = this.table.rows[tile.x].cells[tile.y];
    cell.classList.add('red');
};

HtmlActuator.prototype.onExposeMine = function(tile) {
    var cell = this.table.rows[tile.mine.x].cells[tile.mine.y];
    cell.classList.add('mine');
};

HtmlActuator.prototype.onBadFlag = function(tile) {
    var cell = this.table.rows[tile.mine.x].cells[tile.mine.y];
    cell.classList.add('red');
};

HtmlActuator.prototype.onClickStart = function(event) {
    this.events.trigger('start');
};

HtmlActuator.prototype.onCellClick = function(event) {

    var event_trigger;

    if (event.shiftKey || event.ctrlKey) {
        event_trigger = 'tile_flag';
    } else {
        event_trigger = 'tile_step';
    }

    this.events.trigger(event_trigger, {x: event.target.dataset.x, y: event.target.dataset.y});
};