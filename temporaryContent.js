define(['./defaultListeners'], function (defaults) {

  function TemporaryContent(domElement, defaultClass){
    this.dom = domElement;
    this.specialState = '';
    this.callbackState = '';
    this.defaultClass = defaultClass;
    defaults.animEnd(this);
    return this;
  };
  return TemporaryContent

});