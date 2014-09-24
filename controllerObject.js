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
    ///need to make all controls on each element one object that cycles through and emits each control after approval//
    var self = this;
    this.control = function(self){
      var returnedControl = {};
      for(var i=0; i<self.control.length; i++){
        var pref = self.control[i].split(":")[0];
        var suff = self.control[i].split(":")[1] == undefined ? null : self.control[i].split(":")[1];
        returnedControl[pref] = suff;
      }
      return returnedControl;
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
    this.emitControls = function(){
      for(var item in self.control){
        console.log(item+" "+self.control[item])
        self.events.emit('control-given', item, self.control[item])
      }
    };

  };

  ControllerObject.prototype.setSwitch = function(scope){
    var caseSwitch = scope.domListeners;
    switch(caseSwitch){
      case 'default':
        $(scope.dom).on('click', function(e){
          e.preventDefault();
          var tempClass = scope.dom.getAttribute('class')
          if(scope.approval === undefined){
            scope.emitControls();
            return true;
          } else {
            scope.dom.setAttribute('class', tempClass + " "+ scope.approval);
            $(scope.children['revoke']).on('click', function(){
              scope.dom.setAttribute('class', tempClass);
              return false;
            });
            $(scope.children['confirm']).on('click', function(){
              scope.dom.setAttribute('class', tempClass);
              scope.emitControls();
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
            scope.emitControls();
            return true;
          } else {
            scope.dom.setAttribute('class', tempClass + " "+ scope.approval);
            $(scope.children['revoke']).on(scope.domListeners, function(){
              scope.dom.setAttribute('class', tempClass);
              return false;
            });
            $(scope.children['confirm']).on(scope.domListeners, function(){
              scope.dom.setAttribute('class', tempClass);
              scope.emitControls();
              return false;
            })
          }
        });
        break;
    }
  };

  return ControllerObject
});