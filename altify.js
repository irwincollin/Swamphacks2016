function getToken(callback) {
  $.post("https://api.clarifai.com/v1/token/",
  {
    grant_type: "client_credentials",
    client_id: "", // put your client id here
    client_secret: "" // put your client secret here
  },
  function(data, status){
    var token = data.access_token;
    callback(token);
  }
);
}

function getAltsForImgs(token, imgURL, successFunc) {
  if(imgURL && !(imgURL === "") && imgURL.indexOf("data") == -1) {
    $.ajax(
      {
        url: "https://api.clarifai.com/v1/tag/",
        headers:  {'Authorization': 'Bearer ' + token},
        data: "url=" + imgURL,
        success: successFunc
      }
    );
  }
}

function setAltsForImgs(data){
  var token = data.access_token;
  callback(token);
}

function getAltlessImgs(imgs) {
  var altlessImgs = [];
  for (var i = 0, len = imgs.length; i < len; ++i) {
    if (hasInvalidAlt(imgs[i].alt)) {
      altlessImgs.push(imgs[i]);
    }
  }
  return altlessImgs;
}

function hasInvalidAlt(value) {
  return !value.alt || (value.alt.length === 0 || !value.alt.trim())
}

function createFunc(i) {
  return function(data) {
    if(data.status_code === "OK" && data.results[0].status_code === "OK") {
      var results = data.results[0].result.tag.classes;
      var taggedWords = new POSTagger().tag(results);

      var adjectives = [];
      var nouns = [];
      var numAdjectives = 2;
      var numNouns = 1;
      var adjectivesFound = 0;
      var nounsFound = 0;

      for (i in taggedWords) {
        var taggedWord = taggedWords[i];
        var word = taggedWord[0];
        var tag = taggedWord[1];

        if(adjectivesFound != numAdjectives && tag.indexOf("JJ") != -1) {
          adjectives.push(word);
          ++adjectivesFound;
        }
        else if(nounsFound != numNouns && tag.indexOf("NN") != -1) {
          nouns.push(word);
          ++nounsFound;
        }
        if(nounsFound == numNouns && adjectivesFound == numAdjectives)
          break;
      }

      // no adjective order, so it can sound funky
      var phrase = "";
      for(var i = 0; i < adjectivesFound; ++i) {
        phrase += adjectives[i] + " ";
      }

      if(nounsFound >= 1) {
        phrase += nouns[0];
        for(var i = 1; i < nounsFound; ++i) {
            phrase += " and " + nouns[i];
        }
      }

      if(isVowel(phrase[0])) {
          phrase = "An " + phrase;
      } else {
        phrase = "A " + phrase;
      }
      altlessImgs[i].alt = phrase;
      console.log("Added: " + phrase);
    }
  }
}

function isVowel(c) {
    return ['a', 'e', 'i', 'o', 'u'].indexOf(c.toLowerCase()) !== -1
}

var imgs = document.getElementsByTagName("img");
var altlessImgs = getAltlessImgs(imgs);
getToken(
  function(token) {
    var len = altlessImgs.length;
    for (var i = 0; i < len; ++i) {
      getAltsForImgs(token, altlessImgs[i].src, createFunc(i));
    }
  }
);
