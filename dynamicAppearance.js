define(['./defaultListeners', './eventEmitter'], function (defaults, broadcast) {

  function DynamicAppearance(object, defaultClass){
    this.dom = object;
    this.appearances = {};
    this.currentState = [];
    this.defaultClass = defaultClass;
    this.events = new broadcast(self);
    this.unassigned = false;
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
            //replace subscene with 'all' or 'unassigned' if not a numerical value
            if(isNaN(Number(scene_subscene[1])) == true){
              // suff = scene_subscene[1] == 'all' ? 'all' : 'unassigned'
              suff = 'all'
              self.unassigned = scene_subscene[0] == 'all' ? false : true
              obj[suff] = value;
            } else {
              suff = Number(scene_subscene[1]);
              obj[suff] = value;
            }

            //replace scene with unassigned, if not a numerical value
            if(isNaN(Number(pref))){
              pref = 'unassigned';
              self.unassigned = true;
            }else{
              pref = Number(pref)
            }

          } else { obj = { 'all': splitscenemap[1] } }

          if(pref == ''){
          }else {
            if( returnedHash[pref] == undefined ){ returnedHash[pref] = []; }
            returnedHash[pref].push(obj);
            self.events.emit('dynamic-appearance-initialized', [pref, suff]);

            if( pref == 'unassigned' || suff == 'unassigned'){
              self.events.emit('unassigned-element', [pref, suff]);
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

  DynamicAppearance.prototype.dynamicClass = function(scene, subscene){
    ///add condition if scene == undefined || subscene == undefined
    var self = this;
    var tempClass = self.dom.getAttribute('class');
    var tempState = "";
      // var theScene = this.appearances[scene];
      // var theSubscene;
      // if(theScene !== undefined){
      //   var theSceneObject = self.appearances[scene];
      //   for(var item in self.appearances[scene]){
      //     var current = self.appearances[scene][item];
      //     if(current[subscene] !== undefined ){
      //       tempClass += current[subscene] == null ? "" :" "+current[subscene]
      //       tempState.push(current[subscene])
      //     }
      //     if(current['all'] !== undefined) {
      //       tempClass += current['all'] == null ? "" :" "+current['all']
      //       tempState.push(current['all'])
      //     }
      //   }
      // }
      for(var loopedScene in self.appearances){
        for(var loopedSubscene in self.appearances[loopedScene]){
          var current = self.appearances[loopedScene][loopedSubscene];
          var currentSubscene = Object.keys(self.appearances[loopedScene][loopedSubscene])
          if(loopedScene == scene){
            if(currentSubscene == 'all' || currentSubscene == subscene){
              if(tempClass.indexOf(current[currentSubscene]) == -1){
                tempState += " "+current[currentSubscene];
              }
            } else {
              tempClass = tempClass.replace(" "+current[currentSubscene], "");
            }
          } else {
            tempClass = tempClass.replace(" "+current[currentSubscene], "");
          }
        }
      }
      tempClass += tempState;

      //takes each class(set by the previous call to this function)and replaces it with nothing//

      // for(var state in self.currentState){

      //   tempClass = tempClass.replace(" "+self.currentState[state], "");
      // }
      self.dom.setAttribute('class', tempClass);
      // self.dom.style.animationPlayState = 'running';
      // self.dom.style.webkitAnimationPlayState = 'running';
      self.currentState = tempState;
      return tempClass
  }
  DynamicAppearance.prototype.determineProbability = function(scene, subscene, probability){
    var actuality = Math.random()
    if( actuality < probability){
      this.appearances[scene] = this.appearances['unassigned']
      delete this.appearances['unassigned'];
      this.dynamicClass(scene, subscene)
      this.events.emit('probable', this)
      return true;
    } else {
      return false;
    }
  }

  return DynamicAppearance
});

//creates a hash that is {scene { subscene : state } }
