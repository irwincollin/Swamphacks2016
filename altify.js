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
      var newAlt = "Clarify predicts " + results[0] + ", " + results[1] + ", and " + results[2];
      altlessImgs[i].alt = newAlt;
      console.log("Added: " + newAlt);
    }
  }
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
