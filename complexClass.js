define(['./eventEmitter', './defaultListeners'], function (broadcast, defaults) {
  function ComplexClass(DOMelem){
    this.dom = DOMelem;
    this.sources;
    this.startingClass;
    this.events = new broadcast(self);
    defaults.animEnd(this);
    return this;
  };

  ComplexClass.prototype.initialize = function(){
    var self = this;
    self.startingClass = self.dom.getAttribute('class');
    this.sources = function(self){
      var tempSource = self.dom.getAttribute('data-class').split(' ')
      return tempSource;
    }(self);
    self.dom.removeAttribute('data-class');
    self.events.emit('complex-class-initialized');
  };

  ComplexClass.prototype.dynamicClass = function(passed){
    var self = this;
    var tempClass = self.dom.getAttribute('class');
    if( passed === undefined){
      return tempClass;
    }else {
      for(var p=0; p<self.sources.length; p++){
        tempClass += " "+passed[self.sources[p]];
      }
      self.dom.setAttribute('class', tempClass)
      return tempClass
    }
  }

  return ComplexClass
});