define(['./defaultListeners'], function (defaults) {

  function TemporaryContent(domElement, defaultClass){
    this.dom = domElement;
    this.specialState = '';
    this.callbackState = '';
    this.currentState = 'new';
    this.defaultClass = defaultClass;
    defaults.animEnd(this);
    return this;
  };
  TemporaryContent.prototype.dynamicClass = function(){
    var self = this;
    var tempClass = self.dom.getAttribute('class')
    if(self.currentState == 'new'){
      return tempClass
    }else if(self.currentState == 'off'){
      tempClass = tempClass.replace(" "+self.specialState, "")
      tempClass = tempClass.replace(" "+self.callbackState, "")
      tempClass += self.callbackState == null ? "" :" "+self.callbackState
    }else if(self.currentState == 'on'){
      tempClass = tempClass.replace(" "+self.specialState, "")
      tempClass = tempClass.replace(" "+self.callbackState, "")
      tempClass += self.specialState == null ? "" :" "+self.specialState
    }
    self.dom.setAttribute('class', tempClass)
    return tempClass
  }
  return TemporaryContent

});