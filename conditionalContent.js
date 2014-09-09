define(['./temporaryContent', './eventEmitter', './defaultListeners'], function (temp, broadcast, defaults) {
  //operates like a switch, checks its children for data-transformation
  //if none, return null/error
  //if exists
  //takes one scene, one subscene, a special state, and a default state.
  //toggles the special state on during specified scene
  //creates a hash that is { scene { subscene : [temporaryContent] } }


  function ConditionalContent(DOMelem, classes){
    this.dom = DOMelem;
    this.onClass = "";
    this.offClass = "";
    this.startingClass = classes;
    this.currentState = ["new"];
    this.states = [];
    this.events = new broadcast(self);
    defaults.animEnd(this);
    return this;
  };

  ConditionalContent.prototype.initialize = function(){
    var self = this;
    self.startingClass = self.dom.getAttribute('class');
    this.contents = function(self){
      var returnedArray = [];
      var emittedData = [];
      if( $(self.dom).data('condition') ){
        var allConditions = $(self.dom).data('condition').split(" ");
        var active, callback, cond, obj, subsplit;
        for(var condition in allConditions){
          subsplit = allConditions[condition].split(":");
          cond = subsplit[0];
          active = subsplit[1].split("||")[0] || null;
          callback = subsplit[1].split("||")[1] || null;
          obj = {};
          obj[cond] = [active, callback];
          self.states.push(obj);
        }
      } else {
        return null
      }
      self.dom.removeAttribute('data-condition');
      self.events.emit('conditional-initialized');
      return returnedArray;
    }(self);
  };

  ConditionalContent.prototype.dynamicClass = function(passed){
    var self = this;
    var tempClass = self.dom.getAttribute('class');
    if( passed === undefined || passed.length === undefined){
      return tempClass;
    }else {
      console.log(tempClass)
      for( var state in passed){
        for( var y=0; y<self.states.length; y++){
          var twoStates = self.states[y][passed[state]];
          if(twoStates !== undefined){
            if(Object.keys(self.states[y]) == passed[state] ){
              tempClass = tempClass.replace(" "+twoStates[1], "")
              tempClass = tempClass.replace(" "+twoStates[0], "")
              tempClass += twoStates[0] == null ? "" :" "+twoStates[0]
            } else {
              tempClass = tempClass.replace(" "+twoStates[1], "")
              tempClass = tempClass.replace(" "+twoStates[0], "")
              tempClass += twoStates[1] == null ? "" :" "+twoStates[1]
            }
          }
        }
      }
      self.dom.setAttribute('class', tempClass)
      return tempClass
      }
  }

  return ConditionalContent
});