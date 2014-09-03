define(['./defaultListeners', './eventEmitter'], function (defaults, broadcast) {

  function DynamicAppearance(object, defaultClass){
    this.dom = object;
    this.appearances = {};
    this.defaultClass = defaultClass;
    this.events = new broadcast(self);
    defaults.animEnd(this);
    return this;
  };

  DynamicAppearance.prototype.initialize = function(){
    var self = this;
    this.appearances = function(self){
      var prefix = "";
      if(self.dom.tagName == 'g'){
        prefix = "g"
      }
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

  return DynamicAppearance
});

//creates a hash that is {scene { subscene : state } }
