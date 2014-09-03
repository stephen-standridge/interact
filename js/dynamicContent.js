define(['./temporaryContent', './eventEmitter', './defaultListeners'], function (temp, broadcast, defaults) {
  //operates like a switch, checks its children for data-transformation
  //if none, return null/error
  //if exists
  //takes one scene, one subscene, a special state, and a default state.
  //toggles the special state on during specified scene
  //creates a hash that is { scene { subscene : [temporaryContent] } }


  function DynamicContent(parent){
    this.dom = parent;
    this.contents = {};
    this.events = new broadcast(self);
    defaults.animEnd(this);
    return this;
  };

  DynamicContent.prototype.initialize = function(){
    var self = this;
    this.contents = function(self){
      var returnedArray = {};
      var objectifiedChildren = [];
      var emittedData = [];
      var allTheChildren = $(self.dom).children('.toggle-content');

      for( var r=0; r<allTheChildren.length; r++ ){
        var current = allTheChildren[r];
        var classes = current.getAttribute('class');
        var currentObj = new temp(current, classes);
        var tempTransformation = $(current).data('transformation').split(':');
        var subsplitScene = tempTransformation[0].split('-');
        var subsplitObjData = tempTransformation[1].split(' ');
        var pre = subsplitScene[0];
        var suff = subsplitScene[1];
            currentObj.specialState = subsplitObjData[0];
            currentObj.callbackState = subsplitObjData[1];

        if( returnedArray[pre] == undefined ){
          returnedArray[pre] = {};
          returnedArray[pre][suff] = []
        }else if( returnedArray[pre][suff] == undefined ){
          returnedArray[pre][suff] = [];
        }
        current.removeAttribute('data-transformation');
        returnedArray[pre][suff].push(currentObj)
        self.events.emit('dynamic-content-initialized', [Number(pre), Number(suff)]);
      }
      self.dom.removeAttribute('data-transformation');
      return returnedArray
    }(self);
  };

  return DynamicContent
});