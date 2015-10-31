'use strict';

function EventManager() {
    this.listeners = [];
}

EventManager.prototype.trigger = function(event, data) {
    for (var i = 0; i < this.listeners.length; i++) {
        var listener = this.listeners[i];

        if (listener.event == event) {
            this.listeners[i].callback(data, data);
        }
    }
};

EventManager.prototype.addListener = function(event, callback) {
    this.listeners.push({event: event, callback: callback});
};