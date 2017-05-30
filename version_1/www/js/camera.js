var camera = document.addEventListener("deviceready", function () {
    var options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 100,
      targetHeight: 100,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
	  correctOrientation:true
    };

    $cordovaCamera.getPicture(options).then(function(imageData) {
      var promise = new Promise(function(rej, res){
        res({photo: "data:image/jpeg;base64," + imageData})
      });
      return promise.promise;
    }, function(err) {
      var promise = new Promise(function(rej, res){
        res({error:"error"};)
      });
      return promise.promise;
    });

  }, false);

module.exports = camera;