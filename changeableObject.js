define(['./defaultListeners', './eventEmitter', './temporaryContent'], function (defaults, broadcast,temp) {
  Object.prototype.extend = function () {
        var hasOwnProperty = Object.hasOwnProperty;
        var object = Object.create(this);
        var length = arguments.length;
        var index = length;

        while (index) {
          var extension = arguments[length - (index--)][0];
          for (var property in extension){
            if (hasOwnProperty.call(extension, property) || typeof object[property] === "undefined"){
                object[property] = extension[property];
            }
          }
        }
      return object;
  };

  var ChildControl = {
        ///|| [scene{subscene : [child, child, child]}]
        ///|| created by 'dynamic-content' in DOM class
        ///|| dependent on 'toggle-content' in DOM children classes
        ///|| takes data from child's DOM data-scenemap
        ///|| expects 'scene-subscene:onclass offclass'
        ///|| can only have one 'scene/subscene',
        ///|| scene and subscene can be 'unassigned', if both are, it will break
        ///|| subscene can be 'all'
        ///|| is used by update Children
    children : function(){
      var returnedArray = {};
      var objectifiedChildren = [];
      var emittedData = [];
      var allTheChildren = $(this.dom).children('.toggle-content');

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
        this.events.emit('dynamic-content-initialized', [pref, suff]);
        if( pref == 'unassigned' || suff == 'unassigned'){
          this.events.emit('unassigned-element', [pref, suff]);
        }
      }
      this.dom.removeAttribute('data-scenemap');
      return returnedArray
    },
    updateChildren : function(passed_scene, passed_subscene, probability){
      var scenes =  this.children;
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
  }

  var SceneAwareness = {
     //|| [scene{subscene: 'class'}, scene{subscene: 'class'}]
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
    appearances : function(){
      if( $(this.dom).data('scenemap') ){
          var appearanceTemp = $(this.dom).data('scenemap').split(' ') ;
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
                this.unassigned = scene_subscene[0] == 'all' ? false : true
                obj[suff] = value;
              } else {
                suff = Number(scene_subscene[1]);
                obj[suff] = value;
              }

              //replace scene with unassigned, if not a numerical value
              if(isNaN(Number(pref))){
                pref = 'unassigned';
                this.unassigned = true;
              }else{
                pref = Number(pref)
              }

            } else { obj = { 'all': splitscenemap[1] } }

            if(pref == ''){
            }else {
              if( returnedHash[pref] == undefined ){ returnedHash[pref] = []; }
              returnedHash[pref].push(obj);
              this.events.emit('dynamic-appearance-initialized', [pref, suff]);

              if( pref == 'unassigned' || suff == 'unassigned'){
                this.events.emit('unassigned-element', [pref, suff]);
              }
            }

          }
          this.dom.removeAttribute('data-scenemap');
        } else {
          return null
        }
        return returnedHash;
    }(),
    unassigned : false,
    sceneCheck : function(scene, subscene){
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
    },
    determineProbability : function(scene, subscene, probability){
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
  }

  var ConditionalExistence = {
        ///|| [{condition: ['true class', 'false class']}, ]
        ///|| created by 'conditional' in DOM class
        ///|| takes data from 'data-condition'
        ///|| expects  'condition:truestate||falsestate'
        ///|| either can be blank and will default to ''
        ///|| is used by changeBooleans
    states : function(){
      var returnedArray = [];
      var emittedData = [];
      if( $(this.dom).data('condition') ){
        var allConditions = $(this.dom).data('condition').split(" ");
        var active, callback, cond, obj, subsplit;
        for(var condition in allConditions){
          subsplit = allConditions[condition].split(":");
          cond = subsplit[0];
          active = subsplit[1].split("||")[0] || null;
          callback = subsplit[1].split("||")[1] || null;
          obj = Condition.create(cond, active, callback); ///can extract this to an object
          returnedArray.push(obj);
        }
      } else {
        return null
      }
      this.dom.removeAttribute('data-condition');
      this.events.emit('conditional-initialized');
      return returnedArray;
    }(),
    changeBooleans : function(passed){
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
  }

  var ComplexAttributes = {
      ///|| ['attribute': 'abstract Output', 'attribute': 'abstract Output']
      ///|| created by 'result-attribute' in DOM class
      ///|| takes data from data-attribute
      ///|| expects 'attribute:abstractOutput'
      ///|| can take multiple separated by space
    attributes : function(){

        var initialSplit = this.dom.getAttribute('data-attribute').split(' ');
        var tempAttributes = {};
        for(var q=0; q<initialSplit.length; q++){
          var subSplit = initialSplit[q].split(':');
          tempAttributes[subSplit[0]] = subSplit[1]
        }
        return tempAttributes;
        this.dom.removeAttribute('data-attribute');
        this.events.emit('complex-attribute-initialized');
    },
    determineAttribute : function(arrayofAttributes){
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
  }

  var ComplexContents = {
      ///|| {'abstractOutput': '$(.domSelector)' }
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
    containers : function(){
      var initialSplit2 = this.dom.getAttribute('data-content').split(' ');
      var tempContainers = {};
      for(var w=0; w<initialSplit2.length; w++){
        var subSplit = initialSplit2[w].split(':');
        var actualContainer = $(this.dom).find(subSplit[0]).each(function(b){
          tempContainers[subSplit[1]] = this;
        })
      }
      this.dom.removeAttribute('data-content');
      this.events.emit('complex-content-initialized');
      return tempContainers
    },
    injectContent : function(passed){
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
  }

  var ComplexClass = {
      /////|| ['abstractOutput', 'abstractOutput', 'abstractOutput']
      /////|| created by 'result-class' in DOM class
      /////|| takes data from data-class
      /////|| expects 'abstractOutput'
      /////|| can take multiple separated by space
      /////|| not very good yet ***needs to be implemented
    sources : function(){
      var tempSource = this.dom.getAttribute('data-class').split(' ')
      return tempSource;
      this.dom.removeAttribute('data-class');
      this.events.emit('complex-class-initialized');
    },
    determineClass : function(passed){
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
    },

  }

  var Condition = {
    create : function(assertion, trueState, falseState){
      var self = Object.create(this);
          self.assertion = assertion;
          self.trueState = trueState;
          self.falseState = falseState;
      return self;
    }
  }

  var Creator = {
    create : function(object, classes){
      var self = Object.create(this);
        self.dom = object;
        self.currentClass = classes;
        self.events = new broadcast;
      return self;
    }
  }
  function createChangeableObject(dom){
    console.log(dom)
    var attributes = {
      ///new mixins indexed here with dom indicator : object created.
      'toggle-content'       : ChildControl,
      'data-scenemap'        : SceneAwareness,
      'data-condition'       : ConditionalExistence,
      'data-attribute'       : ComplexAttributes,
      'data-content'         : ComplexContents,
      'data-class'           : ComplexClass,
    }
    var classes = dom.className;
    var arrayOfAttributes = [];
    var dom = dom;
    for(var domAttribute in attributes){
      var times = 0;
      switch (times, domAttribute) {
        case 0 :
          if($(dom).children().length > 0){
            //needs a fix
            console.log(yes)
            arrayOfAttributes.push(attributes[domAttribute])
          }
          times++;
          break;
        default :
          if(dom.getAttribute(domAttribute)){
            arrayOfAttributes.push(attributes[domAttribute])
          }
          break;
      }
    }
    var thingToCreate = Creator.extend(arrayOfAttributes)
        thingToCreate.create(dom, classes);
        console.log()
    return thingToCreate
  }
  var returned = createChangeableObject

  return returned
});

