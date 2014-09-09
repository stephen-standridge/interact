define(['./temporaryContent', './eventEmitter', './defaultListeners'], function (temp, broadcast, defaults) {
  //operates like a conditional switch
  //used on concert with the assertion/revokation controllers
  //set class to be used when assertion == true

  //takes conditions, a special state, and a reverted state
  //toggles the special state on during condition


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

      for( var y=0; y<self.states.length; y++){
        for(var current in self.states[y]){
          var onState = self.states[y][current][0]
          var offState = self.states[y][current][1]
        }
        tempClass = tempClass.replace(" "+onState, "")
        tempClass = tempClass.replace(" "+offState, "")
        tempClass += offState == null ? "" :" "+offState
        for( var state in passed){
          if(Object.keys(self.states[y]) == passed[state] ){
            tempClass = tempClass.replace(" "+offState, "")
            tempClass += onState == null ? "" :" "+onState
          }
        }

      }
      self.dom.setAttribute('class', tempClass)
      return tempClass
      }
  }

  return ConditionalContent
});