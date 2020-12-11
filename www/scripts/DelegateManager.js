/*
//Side A
var delegateId = DelegateManager.registerEvent("sync::success", function(data) {
    console.log("Sync Succeeded with Data: ", data);

    DelegateManager.unregisterEvent(delegateId);
});

//Side B
function sync() {
    ...
    var syncedData = [...]

    DelegateManager.triggerEvent("sync:success", syncedData);
}
**/

var DelegateManager = {
    _events: {},
    registerEvent: function(eventName, eventCallback) {
        var self = this;
        var eventId = eventName + "_" + Date.now() + "" + Math.floor(Math.random() * 1000 + 1);
        if(!self._events.hasOwnProperty(eventName)) {
            self._events[eventName] = {};
        }
        self._events[eventName][eventId] = eventCallback;
        
        return eventId;
    },
    unregisterEvent: function(eventId) {
        var self = this;
        Object.keys(self._events).forEach(function(k) {
            var events = self._events[k];
            if(events && events.hasOwnProperty(eventId)) {
                delete events[eventId];
            }
        });
    },
    triggerEvent: function(eventName, data) {
        var self = this;
        console.log("Trigger Event ", eventName, " with data ", data);
        var events = self._events[eventName];
        console.log("Events ", events);
        if(events) {
            Object.keys(events).forEach(function(ek) {
                events[ek] ? events[ek](data) : false;
            });
        }
    }
}