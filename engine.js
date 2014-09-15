require(["./interaction", "./eventEmitter"], function(game, broadcast) {
(function() {
    if ( typeof Object.prototype.uniqueId == "undefined" ) {
        var id = 0;
        Object.prototype.uniqueId = function() {
            if ( typeof this.__uniqueid == "undefined" ) {
                this.__uniqueid = ++id;
            }
            return this.__uniqueid;
        };
        Object.defineProperty(Object.prototype, "uniqueId", {
          enumerable: false
        })
    }
})();
    var masterEmitter = new broadcast;
    var allTheInteractions =  function(){
      var possibleInteractions = document.getElementsByClassName('interaction');
      var parsedInteractions = [];
      for (var l = 0; l < possibleInteractions.length; l ++){
          var currentInteraction = new game(possibleInteractions[l]);
          currentInteraction.initialize();
          parsedInteractions.push(currentInteraction);
      }
      return parsedInteractions;
    }();
    return allTheInteractions
})();


