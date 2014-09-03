define(function () {

  var animationEnd = function(scope){
    scope.dom.addEventListener('webkitAnimationIteration', function(){
      this.style.animationName = '';
      this.style.webkitAnimationName = '';
      this.style.animationPlayState = 'paused';
      this.style.webkitAnimationPlayState = 'paused'
    }, false)
    scope.dom.addEventListener('animationIteration', function(){
      this.style.animationName = '';
      this.style.webkitAnimationPlayState = 'paused'
      this.style.animationPlayState = 'paused';
    }, false)
    // scope.dom.attributeChangedCallback = function(attributeName){
    //   scope.style.webkitAnimationPlayState = 'running';
    //   scope.style.animationPlayState = 'running';
    // }
  }

  var defaultEvents = {
    animEnd : animationEnd,
  }
  return defaultEvents
});