'use strict';

/**
 * Event Manager
 *
 * @constructor
 */
function EventManager() {
    this.listeners = [];
}

/**
 * Trigger Event Callbacks
 *
 * @param event
 * @param data
 */
EventManager.prototype.trigger = function(event, data) {
    for (var i = 0; i < this.listeners.length; i++) {
        var listener = this.listeners[i];

        if (listener.event == event) {
            this.listeners[i].callback(data, data);
        }
    }
};

/**
 * Add Listener Callbacks for an Event
 *
 * @param event
 * @param callback
 */
EventManager.prototype.addListener = function(event, callback) {
    this.listeners.push({event: event, callback: callback});
};