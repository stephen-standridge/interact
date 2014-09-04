require(["./interaction", "./eventEmitter"], function(game, broadcast) {
    var masterEmitter = new broadcast;
    var allTheInteractions =  function(){
      var possibleInteractions = document.getElementsByClassName('interaction');
      var parsedInteractions = [];
      for (var l = 0; l < possibleInteractions.length; l ++){
          var currentInteraction = new game(possibleInteractions[l]);
          currentInteraction.initialize();
          currentInteraction.events.emit('control-given', 'start');
          parsedInteractions.push(currentInteraction);
      }
      return parsedInteractions;
    }();
    return allTheInteractions
})();

