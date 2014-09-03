define(function () {

  var animationEnd = function(scope){
    scope.dom.addEventListener('webkitAnimationIteration', function(){
      scope.style.animationName = '';
      scope.style.animationPlayState = 'paused';
      scope.style.webkitAnimationPlayState = 'paused'
    }, false)
    // scope.dom.attributeChangedCallback = function(attributeName){
    //   scope.style.webkitAnimationPlayState = 'running';
    //   scope.style.animationPlayState = 'running';
    // }
    scope.dom.addEventListener('animationIteration', function(){
      scope.style.animationName = '';
      scope.style.webkitAnimationPlayState = 'paused'
      scope.style.animationPlayState = 'paused';
    }, false)
  }

  var defaultEvents = {
    animEnd : animationEnd,
  }
  return defaultEvents
});