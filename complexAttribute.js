define(['./eventEmitter', './defaultListeners'], function (broadcast, defaults) {
  function ComplexAttribute(DOMelem){
    this.dom = DOMelem;
    this.attributes;
    this.events = new broadcast(self);
    defaults.animEnd(this);
    return this;
  };

  ComplexAttribute.prototype.initialize = function(){
    var self = this;
    var initialSplit = self.dom.getAttribute('data-attribute').split(' ');
    this.attributes = function(self){
      var tempAttributes = {};
      for(var q=0; q<initialSplit.length; q++){
        var subSplit = initialSplit[q].split(':');
        tempAttributes[subSplit[0]] = subSplit[1]
      }
      return tempAttributes;
    }(self);
    self.dom.removeAttribute('data-attribute');
    self.events.emit('complex-attribute-initialized');
  };

  ComplexAttribute.prototype.dynamicClass = function(passed){
    var self = this;
    if( passed === undefined ){
      return 'no arguments passed';
    }else {
      for(var attribute in self.attributes){
        self.dom.style[attribute] =  passed[self.attributes[attribute]].value;
      }
      return 'success'
    }
  }

  return ComplexAttribute
});