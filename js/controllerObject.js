define(['./eventEmitter'], function (broadcast) {

  function ControllerObject(domElement, domListeners, control /*, parentId*/){
    this.dom = domElement;
    this.events = new broadcast();
    this.domListeners = domListeners;
    this.control = control;
    /*this.parentId =parentid;*/
    return this;
  };

  ControllerObject.prototype.initialize = function(){
    var self = this;
    this.processedListeners = function(self){
      var caseSwitch = typeof self.domListeners;
      switch(caseSwitch){
        case 'string':
          self.setSwitch(self);
          break;
        case 'ojbect':
          for(var t = 0; t < self.domListeners.length; t++){
            if(typeof self.domListeners == 'string'){
              self.setSwitch(self);
            }
          }
          break;
      }
    }(self);
  };

  ControllerObject.prototype.setSwitch = function(scope){
    var caseSwitch = scope.domListeners;
    switch(caseSwitch){
      case 'default':
        $(scope.dom).on('click', function(){
          scope.events.emit('control-given', scope.control/*, add scope.parentid to it*/)
        });
        break;
      default:
        $(scope.dom).on(scope.domListeners, function(){
          scope.events.emit('control-given', scope.control/*, add scope.parentid to it*/)
        });
        break;
    }
  };

  return ControllerObject
});