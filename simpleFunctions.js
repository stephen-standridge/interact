define(function () {
  arrayCheck = function(needle, haystack){
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
  }

  arrayShuffle = function(arrayToShuffle){
    var item, random;
    var shuffledArray = arrayToShuffle;
    var count = shuffledArray.length;

    while(count){
      random = Math.random() * count-- | 0;
      item = shuffledArray[count];
      shuffledArray[count] = shuffledArray[random]
      shuffledArray[random] = item;
    }

    return shuffledArray
  }

  arrayFind = function(source, object, output) {
  for (var i = 0; i < source.length; i++) {
    if (source[i].dom === object.dom) {
      if(output == 'object'){
        return source[i];
      } else if (output == 'index'){
        return i;
      } else {
        return source[i];
      }
    }
  }
  throw new Error("Couldn't find the "+ object +" in the source "+ source);
}


  var simpleFunctions = {
    inArray : arrayCheck,
    shuffleArray : arrayShuffle,
    findObject : arrayFind,
  }

  return simpleFunctions
})