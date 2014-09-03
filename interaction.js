define(["./dynamicAppearance", "./dynamicContent", "./controllerObject", "./eventEmitter", "./simpleFunctions"], function(oneshot, toggleable, remote, broadcast, fun) {

  function Interaction(domElem){
      this.changeables = {};
      this.currentScene = 0;
      this.currentSubscene = 0;
      this.dom = domElem;
      this.sceneMap = [];
      this.events = new broadcast(self);
      return this;
  };
  Interaction.prototype.initialize = function(){
    var self = this;
    this.controls = {
        start : function(context){
          self.currentScene = 1;
          self.controls.updateAllContent();
        },
        forward : function(){
          if(self.sceneMap[self.currentScene] !== undefined){
            if(self.currentSubscene < self.sceneMap[self.currentScene].length - 1){
              self.currentSubscene++;
            }else {
              if(self.sceneMap[self.currentScene + 1]!== undefined){
                self.currentScene++;
                self.currentSubscene = 0;
              }
            }
          }
          self.controls.updateAllContent();
        },
        backward : function(){
          if(self.currentScene > 0){
            if(self.currentSubscene > 0){
              self.currentSubscene--;
            } else {
              if(self.currentScene > 1){
                self.currentScene--;
                self.currentSubscene = self.sceneMap[self.currentScene].length-1;
              }else if(self.currentScene == 1){
                if(self.currentSubscene >= 1){
                  self.currentSubscene--;
                }
              }
            }
          }
          self.controls.updateAllContent();
        },
        updateAllContent : function(){
          self.controls.updateDynamicContent();
          self.controls.updateDynamicAppearances();
        },
        updateDynamicContent : function(direction){
          for(var current in self.changeables.content){
            var item =  self.changeables.content[current].contents;
            for(var scene in item){
              for(var subscene in item[scene]){
                var that = item[scene][subscene];
                for(var one in that){
                  var obj, element, onClass, offClass, classFrom;
                      obj = that[one];
                      element = obj.dom;
                      onClass = obj.specialState;
                      offClass = obj.callbackState;
                      classFrom = obj.defaultClass;
                      element.setAttribute("class", classFrom);
                  if(scene == self.currentScene){
                    if(subscene == self.currentSubscene || subscene == 'all'){
                      element.setAttribute("class", classFrom+ ' ' +onClass)
                    } else {
                      element.setAttribute("class", classFrom+ ' ' +offClass)
                    }
                  } else {
                    element.setAttribute("class", classFrom+ ' ' +offClass);
                  }
                }
              }
            }
          }
        },
        updateDynamicAppearances : function(){
          for( var current in self.changeables.appearance ){
            var element, classFrom, item;
                element = self.changeables.appearance[current].dom;
                classFrom = self.changeables.appearance[current].defaultClass;
                item = self.changeables.appearance[current].appearances;
                element.setAttribute("class", classFrom)
            for( var scene in item ){
              for( var one in item[scene] ){
                var that, subscene;
                    that = item[scene];
                    subscene = Object.keys(that[one])[0];
                if( self.currentScene == scene ){
                  if( self.currentSubscene == subscene || subscene == 'all' ){
                    element.setAttribute("class", classFrom+ " "+ that[one][subscene])
                    element.style.animationPlayState = 'running';
                    element.style.webkitAnimationPlayState = 'running';
                  }
                }
              }
            }
          }
        }
      }


    this.addToSceneMap = function(arg){
        var pref, suff;
        if(arg !== undefined){
          pref = arg[0];
          suff = arg[1];
          if(isNaN(pref) == false && isNaN(suff) === false){
            if(this.sceneMap[pref] == undefined){
              this.sceneMap[pref] = [];
            }
            isInArray = fun.inArray(suff, this.sceneMap[pref]);
            if( isInArray === false) {
              this.sceneMap[pref].push(suff);
            }
          }
        }
      }


      this.events.on('dynamic-content-initialized', function(data){
        self.addToSceneMap(data);
      });
      this.events.on('dynamic-appearance-initialized', function(data){
        self.addToSceneMap(data);
      });
      this.events.on('control-given', function(control){
        ///check if emitted id matches its id
        self.controls[control](control);
      });


    this.totalScenes = function(self){
        var total = self.dom.getAttribute('data-scenes');
        if(total === undefined || isNaN(Number(total)) === true){
          return null
        } else {
          return Number(total);
        }
        self.dom.removeAttribute('data-scenes');
      }(self);


    this.controller = function(self){
        var retrunedControls = [];
        if($(self.dom).find('.control').length){
          var allControls = $(self.dom).find('.control');
          var currentControls = [];
          $(allControls).each(function(a){
            currentControls = {
              tempdom : allControls[a],
              templistener : $(allControls[a]).data('control-listener'),
              tempcontrol : $(allControls[a]).data('control'),
            }
            allControls[a].removeAttribute('data-control')
            allControls[a].removeAttribute('data-control-listener')

            var currentControl = new remote(currentControls.tempdom, currentControls.templistener, currentControls.tempcontrol)
            currentControl.initialize();
            retrunedControls.push(currentControl);
          });
        }else{
          newController = new remote(self.dom, 'default', 'forward');
          newController.initialize();
          retrunedControls.push(newController);
        }
        return retrunedControls;
        //add click/swipe/other handler to its prototype//
        //add event emitter to it//
      }(self);


    this.changeables = function(self){
        var possibleChangeables = { appearance : [], content : [] };
        var dynamicItems = $(self.dom).find('.dynamic');
        var dynamicContainer = $(self.dom).find('.dynamic-content');

        if ( dynamicItems.length ) {
          for( var j = 0; j< dynamicItems.length; j++ ){
            var appearanceChangeable = new oneshot(dynamicItems[j], dynamicItems[j].getAttribute("class"));
                appearanceChangeable.initialize();
                possibleChangeables.appearance.push(appearanceChangeable);
          }
        } else { possibleChangeables.appearance = null; }

        if( dynamicContainer.length ){
          for(var k = 0; k<dynamicContainer.length; k++){
            var changeable = new toggleable(dynamicContainer[k])
                changeable.initialize();
                possibleChangeables.content.push(changeable);
          }
        }else { possibleChangeables.content = null; }
        if(possibleChangeables.appearance === null && possibleChangeables.content === null){
          return null;
        }else {
          return possibleChangeables;
        }

      }(self);
    };

    return Interaction
});


// Interaction ->(the game)
//    changeables ->(things about the game that will change)
//      appearance->(one-shot changes)
//                  dom Element
//                    scene changed=>
//                      subscene   => value
//      content->   (toggleable changes)
//                  dom Element
//                    scene changed in => value to change
//
//
