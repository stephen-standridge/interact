define(function () {

  function eventEmitter(arg){
    this.self = arg;
  };
  eventEmitter.prototype.events = Object.create(null);
  eventEmitter.prototype.on = function(event, listener) {
      if (typeof this.events[event] !== "undefined"){
        this.events[event].push(listener);
      } else {
        this.events[event] = [listener];
      }
    };
  eventEmitter.prototype.emit = function(event){
      if(typeof this.events[event] !== "undefined"){
        var listeners = this.events[event];
        var length = listeners.length;
        var index = length;
        var args = Array.prototype.slice.call(arguments, 1);
        while(index){
          var listener = listeners[length -(index--)];
          listener.apply(this, args);
        }
      }
    };
  eventEmitter.prototype.clear = function(){
    eventEmitter.prototype.events = Object.create(null);
    return this.events;
  };

  return eventEmitter
});