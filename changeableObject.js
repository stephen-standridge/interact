define(['./defaultListeners', './eventEmitter', './temporarContent'], function (defaults, broadcast,temp) {

  function ChangeableObject(object classes){
    this.dom = object;

    //dynamicAppearance related attributes//
    this.appearances = {}; //|| [scene{subscene: 'class'}, scene{subscene: 'class'}]
                           //|| created by 'dynamic' in DOM class
                           //|| takes data from DOM data-scenemap
                           //|| expects 'scene-subscene:class '
                           //|| can have multiple appearances separated by space
                           //|| can have scene set to 'unassigned' for random entry
                           //|| doesn't need a subscene
                           //|| can have subscene set to 'all', defaults to 'all' if not given
                           //|| can have 'unassigned' as subscene ***not implemented?**
                           //|| is used by sceneCheck()
                           //|| created at initialization
                           //|| scene can equal 'unassigned' for random appearance
                           //|| unassigned will be assigned a scene number once chosen
                           //|| if it contains an 'unassigned', this.unassigned = true
    this.unassigned = false;


    this.currentClass = classes;//|| ['class', 'class', 'class']
                                //|| created by DOM class
                                //|| sceneCheck() updates it.
                                //|| needed so linear logic won't interfere with conditional logic

    //dynamicContent related attributes//
    this.contents = {}; ///|| [scene{subscene : [child, child, child]}]
                        ///|| created by 'dynamic-content' in DOM class
                        ///|| dependent on 'toggle-content' in DOM children classes
                        ///|| takes data from child's DOM data-scenemap
                        ///|| expects 'scene-subscene:onclass offclass'
                        ///|| can only have one 'scene/subscene',
                        ///|| scene and subscene can be 'unassigned', if both are, it will break
                        ///|| subscene can be 'all'
                        ///|| is used by update Children


    //conditionalContent related attributes//
    this.states = [];   ///|| [{condition: ['true class', 'false class']}, ]
                        ///|| created by 'conditional' in DOM class
                        ///|| takes data from 'data-condition'
                        ///|| expects  'condition:truestate||falsestate'
                        ///|| either can be blank and will default to ''
                        ///|| is used by changeBooleans


    //complexAttribute related attributes//
    this.attributes;    ///|| ['attribute': 'abstract Output', 'attribute': 'abstract Output']
                        ///|| created by 'result-attribute' in DOM class
                        ///|| takes data from data-attribute
                        ///|| expects 'attribute:abstractOutput'
                        ///|| can take multiple separated by space


    //complexClass related attributes//
    this.sources;      ////|| ['abstractOutput', 'abstractOutput', 'abstractOutput']
                        ///|| created by 'result-class' in DOM class
                      /////|| takes data from data-class
                      /////|| expects 'abstractOutput'
                      /////|| can take multiple separated by space
                      /////|| not very good yet ***needs to be implemented


    //complexContent related states///
    this.containers;    ///|| {'abstractOutput': '$(.domSelector)' }
                        ///|| created by 'result-content' in DOM class
                        ///|| takes data from data-content
                        ///|| expects '.domSelector:abstractOutput'
                        ///|| can have multiple separated by space
                        ///|| not very good yet. ***Need to implement '


                        ///***so close to amazing***//
                        ///|| should allow for ajax content determined by some sort of routing
                        ///|| should be established in abstractions.
                        ///|| ideally could be used to construct a final ajax/file path/ DOM elem
                        ///|| from various things that happened within the interaction
                        ///|| and inject that into the content


                        ///|| this could be dependent on the data-tracking record (hidden record)
                        ///|| this could report to said record or I could separate this idea...
                        ///|| said record would be responsible for ajax/email/etc communication.

    this.events = new broadcast(self);
    defaults.animEnd(this); ///inserts animation breaks onto the elements, otherwise CSS freaks out
                            ///and won't replay previous animations, won't correctly shift animations
                            ///etc, the animation is restarted every class shift.
    return this;
  };

  ChangeableObject.prototype.initialize = function(){
    var self = this;
    //dynamicAppearance setter//
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



    //dynamicContent setter//
    this.contents = function(self){
      var returnedArray = {};
      var objectifiedChildren = [];
      var emittedData = [];
      var allTheChildren = $(self.dom).children('.toggle-content');

      for( var r=0; r<allTheChildren.length; r++ ){
        var current = allTheChildren[r];
        var classes = current.getAttribute('class');
        var currentObj = new temp(current, classes);///create child's data object
        var tempscenemap = $(current).data('scenemap').split(':');
        var scene_subscene, pref, suff;
        var on_off = tempscenemap[1].split(' ');
            currentObj.specialState = on_off[0];///sets the child's on state
            currentObj.callbackState = on_off[1];///sets the child's off state

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

      ///sets the content array to [scene{subscene : [child, child, child]}]
        if( returnedArray[pref] == undefined ){
          returnedArray[pref] = {};
          returnedArray[pref][suff] = []
        }else if( returnedArray[pref][suff] == undefined ){
          returnedArray[pref][suff] = [];
        }
        current.removeAttribute('data-scenemap');///factor out into interaction as 'garbage collection' or something
        returnedArray[pref][suff].push(currentObj)
        self.events.emit('dynamic-content-initialized', [pref, suff]);
        if( pref == 'unassigned' || suff == 'unassigned'){
          self.events.emit('unassigned-element', [pref, suff]);
        }
      }
      self.dom.removeAttribute('data-scenemap');
      return returnedArray
    }(self);



    //conditionalContent setters//
    this.states = function(self){
      var returnedArray = [];
      var emittedData = [];
      if( $(self.dom).data('condition') ){
        var allConditions = $(self.dom).data('condition').split(" ");
        var active, callback, cond, obj, subsplit;
        for(var condition in allConditions){
          subsplit = allConditions[condition].split(":");
          cond = subsplit[0];
          active = subsplit[1].split("||")[0] || null;
          callback = subsplit[1].split("||")[1] || null;
          obj = new Condition(cond, active, callback); ///can extract this to an object
          returnedArray.push(obj);
        }
      } else {
        return null
      }
      self.dom.removeAttribute('data-condition');
      self.events.emit('conditional-initialized');
      return returnedArray;
    }(self);



    //complexAttribute setter//
    var initialSplit = self.dom.getAttribute('data-attribute').split(' ');
    this.attributes = function(self){
      var tempAttributes = {};
      for(var q=0; q<initialSplit.length; q++){
        var subSplit = initialSplit[q].split(':');
        tempAttributes[subSplit[0]] = subSplit[1]
      }
      return tempAttributes;
      self.dom.removeAttribute('data-attribute');
      self.events.emit('complex-attribute-initialized');
    }(self);



    //complexClass setter//
    this.sources = function(self){
      var tempSource = self.dom.getAttribute('data-class').split(' ')
      return tempSource;
      self.dom.removeAttribute('data-class');
      self.events.emit('complex-class-initialized');
    }(self);



    //complexContent setter//
    var initialSplit2 = self.dom.getAttribute('data-content').split(' ');
      this.containers = function(self){
        var tempContainers = {};
        for(var w=0; w<initialSplit2.length; w++){
          var subSplit = initialSplit2[w].split(':');
          var actualContainer = $(self.dom).find(subSplit[0]).each(function(b){
            tempContainers[subSplit[1]] = this;
          })
          console.log(tempContainers)
        }
      self.dom.removeAttribute('data-content');
      self.events.emit('complex-content-initialized');
        return tempContainers
    }(self);

  }


//Dynamic Appearance update//
  ChangeableObject.prototype.sceneCheck = function(scene, subscene){
    ///add condition if scene == undefined || subscene == undefined
    var self = this;
    var tempClass = self.dom.getAttribute('class');
    var tempState = "";
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
      self.dom.setAttribute('class', tempClass);
      self.currentClass = tempState;
      return tempClass
  }
  ChangeableObject.prototype.determineProbability = function(scene, subscene, probability){
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


//dynamicContent update function//
  ChangeableObject.prototype.updateChildren = function(passed_scene, passed_subscene, probability){
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
  //conditionalContent update function//
  ChangeableObject.prototype.changeBooleans = function(passed){
    var self = this;
    var tempClass = self.dom.getAttribute('class');
    if( passed === undefined || passed.length === undefined){
      return tempClass;
    }else {

      for( var y=0; y<self.states.length; y++){

        var onState = self.states[y].trueState;
        var offState = self.states[y].falseState;
        tempClass = tempClass.replace(" "+onState, "")
        tempClass = tempClass.replace(" "+offState, "")
        tempClass += offState == null ? "" :" "+offState
        for( var state in passed){
          if(self.states[y].assertion == passed[state] ){
            tempClass = tempClass.replace(" "+offState, "")
            tempClass += onState == null ? "" :" "+onState
          }
        }

      }
      self.dom.setAttribute('class', tempClass)
      return tempClass
      }
  }

  //complexAttribute update function//
  ChangeableObject.prototype.determineAttribute = function(arrayofAttributes){
    var self = this;
    if( passed === undefined ){
      return 'no arguments passed';
    }else {
      for(var attribute in self.attributes){
        self.dom.style[attribute] =  arrayofAttributes[self.attributes[attribute]].value;
      }
      return 'success'
    }
  }

  //complexClass update function//
  ChangeableObject.prototype.determineClass = function(passed){
    var self = this;
    var tempClass = self.dom.getAttribute('class');
    if( passed === undefined){
      return tempClass;
    }else {
      for(var p=0; p<self.sources.length; p++){
        tempClass += " "+passed[self.sources[p]];
      }
      self.dom.setAttribute('class', tempClass)
      return tempClass
    }
  }

  //complexContent update function//
  ChangeableObject.prototype.injectContent = function(passed){
    var self = this;
    if( passed === undefined ){
      return 'no arguments passed';
    }else {
      for(var container in self.containers){
        self.containers[container].innerHTML = passed[container].value;
      }
      return 'success'
    }
  }
  function Condition(assertion, trueState, falseState){
    this.assertion : assertion,
    this.trueState : trueState,
    this.falseState : falseState
  }


  return ChangeableObject
});

//creates a hash that is {scene { subscene : state } }
