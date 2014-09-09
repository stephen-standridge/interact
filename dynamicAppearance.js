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
      if( $(self.dom).data('transformation') ){
        var appearanceTemp = $(self.dom).data('transformation').split(' ') ;
        var returnedHash = [];
        var pref, suff, key, value, obj, subsplit;
        for( var a=0; a<appearanceTemp.length; a++ ){
          var splitTransformation = appearanceTemp[a].split(':');
              obj = {};
              pref = splitTransformation[0];
              suff = 0;

          if( isNaN(Number(pref)) ){
            subsplit = pref.split('-');
            pref = subsplit[0];
            if( isNaN(Number(pref)) != true ){
              suff = Number(subsplit[1]);
              key = subsplit[1];
              value = splitTransformation[1];
              obj[key] = value;
            }
          } else { obj = { 'all': splitTransformation[1] } }

          if( returnedHash[pref] == undefined ){ returnedHash[pref] = []; }
          returnedHash[pref].push(obj);
          if( self.appearances[pref] == undefined){ self.appearances[pref] = [];}
          self.appearances[pref].push(obj)
          self.events.emit('dynamic-appearance-initialized', [pref, suff]);

        }
        self.dom.removeAttribute('data-transformation');
      } else {
        return null
      }
      self.events.emit('dynamic-appearance-initialized');
      return returnedHash;
    }(self);
  }

  DynamicAppearance.prototype.dynamicClass = function(scene, subscene){
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
