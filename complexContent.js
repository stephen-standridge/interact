define(['./eventEmitter'], function (broadcast) {

  function ComplexContent(DOMelem){
    this.dom = DOMelem;
    this.containers;
    this.events = new broadcast(self);
    return this;
  };

  ComplexContent.prototype.initialize = function(){
    var self = this;
    var initialSplit = self.dom.getAttribute('data-content').split(' ');
    this.containers = function(self){
      var tempContainers = {};
      for(var w=0; w<initialSplit.length; w++){
        var subSplit = initialSplit[w].split(':');
        var actualContainer = $(self.dom).find(subSplit[0]).each(function(b){
          tempContainers[subSplit[1]] = this;
        })
        console.log(tempContainers)
      }
      return tempContainers
    }(self);
    self.dom.removeAttribute('data-content');
    self.events.emit('complex-content-initialized');
  };

  ComplexContent.prototype.dynamicClass = function(passed){
    var self = this;
    if( passed === undefined ){
      return 'no arguments passed';
    }else {
      for(var container in self.containers){
        self.containers[container].innerHTML = passed[container].value;
      }
      return 'success'
    }
  }

  return ComplexContent
});