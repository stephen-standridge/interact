define(['./temporaryContent', './eventEmitter', './defaultListeners'], function (temp, broadcast, defaults) {
  //operates like a switch, checks its children for data-scenemap
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
        var tempscenemap = $(current).data('scenemap').split(':');
        var scene_subscene, pref, suff;
        var on_off = tempscenemap[1].split(' ');
            currentObj.specialState = on_off[0];
            currentObj.callbackState = on_off[1];

          if( isNaN(Number(scene_subscene)) ){
            scene_subscene = tempscenemap[0].split('-');
            //replace subscene with 'all' or 'unassigned' if not a numerical value
            if(isNaN(Number(scene_subscene[1])) == true){
              suff = scene_subscene[1] == 'all' ? 'all' : 'unassigned'
            } else {
              suff = Number(scene_subscene[1]);
            }

            //replace scene with unassigned, if not a numerical value
            if(isNaN(Number(scene_subscene[0]))){
              pref = 'unassigned';
            }else{
              pref = Number(scene_subscene[0])
            }

          } else {
            pref = Number(scene_subscene);
            suff = 'all';
          }


        if( returnedArray[pref] == undefined ){
          returnedArray[pref] = {};
          returnedArray[pref][suff] = []
        }else if( returnedArray[pref][suff] == undefined ){
          returnedArray[pref][suff] = [];
        }
        current.removeAttribute('data-scenemap');
        returnedArray[pref][suff].push(currentObj)
        self.events.emit('dynamic-content-initialized', [pref, suff]);
        if( pref == 'unassigned' || suff == 'unassigned'){
          self.events.emit('unassigned-element', [pref, suff]);
        }
      }
      self.dom.removeAttribute('data-scenemap');
      return returnedArray
    }(self);
  };
  DynamicContent.prototype.dynamicClass = function(passed_scene, passed_subscene, probability){
      var self = this;
      var scenes =  self.contents;
      for(var scene in scenes){
        for(var subscene in scenes[scene]){
          var temporaryItems = scenes[scene][subscene];
          for(var item in temporaryItems){

///if logic for unassigned scenes/subscenes///
                var obj = temporaryItems[item]
                element = obj.dom;
                classFrom = obj.defaultClass;
                element.setAttribute("class", classFrom);
            if(scene == passed_scene){
              if( subscene == passed_subscene || subscene == 'all' ){ obj.currentState = "on"; }
              else { obj.currentState = "off";}
              obj.dynamicClass();
            } else {
              obj.currentState = "off";
              obj.dynamicClass();
            }
          }
        }
      }
  }

  return DynamicContent
});