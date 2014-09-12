define(['./defaultListeners', './eventEmitter'], function (defaults, broadcast) {

  function DynamicAppearance(object, defaultClass){
    this.dom = object;
    this.appearances = {};
    this.currentState = [];
    this.defaultClass = defaultClass;
    this.events = new broadcast(self);
    defaults.animEnd(this);
    return this;
  };

  DynamicAppearance.prototype.initialize = function(){
    var self = this;
    this.appearances = function(self){
      if( $(self.dom).data('scenemap') ){
        var appearanceTemp = $(self.dom).data('scenemap').split(' ') ;
        var returnedHash = [];
        var pref, suff, key, value, obj, scene_subscene;
        for( var a=0; a<appearanceTemp.length; a++ ){
          var splitscenemap = appearanceTemp[a].split(':');
              obj = {};
              pref = splitscenemap[0];
              suff = 0;

          if( isNaN(Number(pref)) ){
            scene_subscene = pref.split('-');
            pref = isNaN(Number(scene_subscene[0])) == false ? Number(scene_subscene[0]) : scene_subscene[0];
            value = isNaN(Number(splitscenemap[1])) == false ? Number(splitscenemap[1]) : splitscenemap[1]
            //replace subscene with 'all' or 'unsigned' if not a numerical value
            if(isNaN(Number(scene_subscene[1])) == true){
              suff = scene_subscene[1] == 'all' ? 'all' : 'unsigned'
              obj[suff] = value;
            } else {
              suff = Number(scene_subscene[1]);
              obj[suff] = value;
            }

            //replace scene with unsigned, if not a numerical value
            if(isNaN(Number(pref))){
              pref = 'unsigned';
            }else{
              pref = Number(pref)
            }

          } else { obj = { 'all': splitscenemap[1] } }

          if(pref == ''){
          }else {
            if( returnedHash[pref] == undefined ){ returnedHash[pref] = []; }
            returnedHash[pref].push(obj);
            self.events.emit('dynamic-appearance-initialized', [pref, suff]);

            if( pref == 'unsigned' || suff == 'unsigned'){
              self.events.emit('unsigned-element', [pref, suff]);
            }
          }

        }
        self.dom.removeAttribute('data-scenemap');
      } else {
        return null
      }
      return returnedHash;
    }(self);
  }

  DynamicAppearance.prototype.dynamicClass = function(scene, subscene, probability){
    ///add condition if scene == undefined || subscene == undefined

    var self = this;
    var tempClass = self.dom.getAttribute('class');
    var tempState = [];
      var theScene = self.appearances[scene];
      var theSubscene;
      if(theScene !== undefined){
        var theSceneObject = self.appearances[scene];
        for(var item in self.appearances[scene]){
          var current = self.appearances[scene][item];
          if(current[subscene] !== undefined ){
            tempClass += current[subscene] == null ? "" :" "+current[subscene]
            tempState.push(current[subscene])
          }
          if(current['all'] !== undefined) {
            tempClass += current['all'] == null ? "" :" "+current['all']
            tempState.push(current['all'])
          }
        }
      }
      for(var state in self.currentState){
        tempClass = tempClass.replace(" "+self.currentState[state], "");
      }
      self.dom.setAttribute('class', tempClass);
      self.dom.style.animationPlayState = 'running';
      self.dom.style.webkitAnimationPlayState = 'running';
      self.currentState = tempState;
      return tempClass
  }

  return DynamicAppearance
});

//creates a hash that is {scene { subscene : state } }
