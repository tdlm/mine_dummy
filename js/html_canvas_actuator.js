'use strict';

function HtmlCanvasActuator(EventManager, HtmlElementsObject) {
    // Constructor settings
    this.events = EventManager;
    this.canvas = document.getElementById(HtmlElementsObject.canvas_id);
    this.startButton = document.getElementById(HtmlElementsObject.start_button_id);
    this.context = this.canvas.getContext("2d");

    // Initial settings
    this.width = 0;
    this.height = 0;
    this.mineCount = 0;
    this.flagCount = 0;
    this.tileSize = 32;
    this.numberTiles = [];

    this.tileBackgroundCovered = '#CCC';
    this.tileBackgroundUncovered = '#EEE';
    this.tileStrokeColor = '#999';

    // Listeners for EventManager Events
    this.events.addListener('new_grid', this.onNewGrid.bind(this));
    this.events.addListener('clear_tile', this.onClearTile.bind(this));
    this.events.addListener('set_number_tile', this.onSetNumberTile.bind(this));
    this.events.addListener('flag_tile', this.onFlagTile.bind(this));
    this.events.addListener('unflag_tile', this.onUnflagTile.bind(this));
    this.events.addListener('step_on_mine', this.onStepOnMine.bind(this));
    this.events.addListener('expose_mine', this.onExposeMine.bind(this));
    this.events.addListener('bad_flag', this.onBadFlag.bind(this));

    // Listeners for HTML Events
    this.startButton.onclick = this.onClickStart.bind(this);
    this.canvas.addEventListener('click', this.onTileClick.bind(this));
}

HtmlCanvasActuator.prototype.onNewGrid = function(grid) {
    this.width = grid.width;
    this.height = grid.height;
    this.mineCount = grid.mines;
    this.flagCount = 0;
    this.numberTiles = [];

    this.events.trigger('update_mine_count', {mines: this.mineCount, flags: this.flagCount});

    // Reset Canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.width);

    // Draw grid tiles
    for (var x = 0, y = 0, row = null, col = null; x < grid.width; x++) {
        for (y = 0; y < grid.height; y++) {
            row = x * this.tileSize;
            col = y * this.tileSize;

            this.drawCellRect(this.tileBackgroundCovered, this.tileStrokeColor, col, row);
        }
    }
};

HtmlCanvasActuator.prototype.onClickStart = function() {
    this.events.trigger('start');
};

HtmlCanvasActuator.prototype.onTileClick = function(event) {
    var x = parseInt(( event.pageX - this.canvas.offsetLeft) / this.tileSize);
    var y = parseInt(( event.pageY - this.canvas.offsetTop) / this.tileSize);

    var event_trigger;

    if (event.shiftKey || event.ctrlKey || event.altKey) {
        event_trigger = 'tile_flag';
    } else {
        event_trigger = 'tile_step';
    }

    this.events.trigger(event_trigger, {x: x, y: y});
};

HtmlCanvasActuator.prototype.onClearTile = function(tile) {
    // Just clear for now
    this.drawCellRect(this.tileBackgroundUncovered, null, tile.x * this.tileSize, tile.y * this.tileSize);

    // Number logic
    var number = this.numberTiles[tile.x][tile.y];

    if ('undefined' != typeof number) {
        this.drawText(number, 'red', tile.x, tile.y);
    }
};

HtmlCanvasActuator.prototype.onSetNumberTile = function(tile) {
    if (typeof this.numberTiles[tile.x] == 'undefined') {
        this.numberTiles[tile.x] = new Array(0);
    }

    if (typeof this.numberTiles[tile.x][tile.y] == 'undefined') {
        this.numberTiles[tile.x][tile.y] = new Array(0);
    }

    this.numberTiles[tile.x][tile.y] = tile.tile.numberValue;
};

HtmlCanvasActuator.prototype.onFlagTile = function(tile) {
    this.flagCount++;
    this.events.trigger('update_mine_count', {mines: this.mineCount, flags: this.flagCount});

    // Draw flag
    this.drawFlag(tile.x, tile.y);
};

HtmlCanvasActuator.prototype.onUnflagTile = function(tile) {
    this.drawCellRect(this.tileBackgroundCovered, null, tile.x * this.tileSize, tile.y * this.tileSize);
};

HtmlCanvasActuator.prototype.onStepOnMine = function(tile) {
    this.drawCellRect('red', null, tile.x * this.tileSize, tile.y * this.tileSize);

    this.drawMine(tile.x, tile.y);
};

HtmlCanvasActuator.prototype.onExposeMine = function(tile) {
    this.drawMine(tile.mine.x, tile.mine.y);
};

HtmlCanvasActuator.prototype.onBadFlag = function(tile) {

    console.log('bad flag!');

    this.drawCellRect('red', null, tile.x * this.tileSize, tile.y * this.tileSize);

    // Draw flag
    this.drawFlag(tile.x, tile.y);
};

HtmlCanvasActuator.prototype.drawCellRect = function(backColor, strokeColor, x, y) {
    this.context.save();

    this.context.fillStyle = backColor;
    this.context.fillRect(x, y, this.tileSize, this.tileSize);


    this.context.lineWidth = 2;
    this.context.strokeStyle = strokeColor || this.tileStrokeColor;
    this.context.translate(x, y);
    this.context.strokeRect(0, 0, this.tileSize, this.tileSize);

    this.context.restore();
};

HtmlCanvasActuator.prototype.drawFlag = function(x, y) {
    x = x * this.tileSize;
    y = y * this.tileSize;

    this.context.save();

    this.context.fillStyle = '#F00';

    this.context.beginPath();
    this.context.moveTo(x + 10, y + 16);
    this.context.lineTo(x + 20, y + 10);
    this.context.lineTo(x + 20, y + 24);
    this.context.fill();

    this.context.restore();
};

HtmlCanvasActuator.prototype.drawMine = function(x, y) {
    x = x * this.tileSize;
    y = y * this.tileSize;

    this.context.save();
    this.context.fillStyle = '#000';
    this.context.beginPath();
    this.context.arc(x + (this.tileSize / 2), y + (this.tileSize / 2), 10, 2 * Math.PI, 0);
    this.context.fill();

    this.context.restore();
};

HtmlCanvasActuator.prototype.drawText = function(text, color, x, y) {
    this.context.save();

    var measureText = this.context.measureText(text);

    this.context.font = '16pt serif';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillText(text,
        ( x * this.tileSize )
        + ( ( this.tileSize / 2 ) - ( measureText.width / 2 ) ),
        ( y * this.tileSize )
        + ( this.tileSize / 2 ),
        this.tileSize
    );

    this.context.restore();
};

HtmlCanvasActuator.prototype.drawTile = function(image, x, y, sx, xy) {
    this.context.save();
    this.context.drawImage(image, sx, sy, this.tileSize, this.tileSize, x, y, this.tileSize, this.tileSize);
    this.context.restore();
};

HtmlCanvasActuator.prototype.clearRect = function(x, y) {
    this.context.clearRect(x, y, this.tileSize, this.tileSize);
};