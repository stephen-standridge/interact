define(['./eventEmitter'], function (broadcast) {

  function ControllerObject(domElement, domListeners, control, approval /*, parentId*/){
    this.dom = domElement;
    this.children;
    this.approval = approval;
    this.events = new broadcast();
    this.domListeners = domListeners;
    this.control = control;
    this.additional;
    /*this.parentId =parentid;*/
    return this;
  };

  ControllerObject.prototype.initialize = function(){
    var self = this;
    this.additional = function(self){
      if(self.control.split(":").length > 1){
        var returned = self.control.split(":")[1];
        self.control = self.control.split(":")[0];
        return returned;
      }
    }(self);
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
    this.children = function(self){
      if(self.approval !== undefined){
        var returnedItems = {};
        var children = $(self.dom).children('.approve');
        for(var a=0; a<children.length; a++){
          returnedItems[children[a].getAttribute('data-control')] = children[a]
          children[a].removeAttribute('data-control')
        }
        return returnedItems;
      } else{
        return null
      }
    }(self);

  };

  ControllerObject.prototype.setSwitch = function(scope){
    var caseSwitch = scope.domListeners;
    switch(caseSwitch){
      case 'default':
        $(scope.dom).on('click', function(e){
          // scope.events.emit('control-given', scope.control/*, add scope.parentid to it*/)
          e.preventDefault();
          var tempClass = scope.dom.getAttribute('class')
          if(scope.approval === undefined){
            scope.events.emit('control-given', scope.control, scope.additional/*, add scope.parentid to it*/)
            return true;
          } else {
            scope.dom.setAttribute('class', tempClass + " "+ scope.approval);
            $(scope.children['revoke']).on('click', function(){
              scope.dom.setAttribute('class', tempClass);
              console.log('revoke')
              return false;
            });
            $(scope.children['confirm']).on('click', function(){
              scope.dom.setAttribute('class', tempClass);
              scope.events.emit('control-given', scope.control, scope.additional/*, add scope.parentid to it*/)
              console.log('confirm')
              return false;
            })
          }
        });
        break;
      default:
        $(scope.dom).on(scope.domListeners.toString(), function(e){
          // scope.events.emit('control-given', scope.control/*, add scope.parentid to it*/)
          e.preventDefault();
          var tempClass = scope.dom.getAttribute('class')
          if(scope.approval === undefined){
            scope.events.emit('control-given', scope.control, scope.additional/*, add scope.parentid to it*/)
            return true;
          } else {
            scope.dom.setAttribute('class', tempClass + " "+ scope.approval);
            $(scope.children['revoke']).on(scope.domListeners, function(){
              scope.dom.setAttribute('class', tempClass);
              return false;
            });
            $(scope.children['confirm']).on(scope.domListeners, function(){
              scope.dom.setAttribute('class', tempClass);
              scope.events.emit('control-given', scope.control, scope.additional/*, add scope.parentid to it*/)
              return false;
            })
          }
        });
        break;
    }
  };

  return ControllerObject
});