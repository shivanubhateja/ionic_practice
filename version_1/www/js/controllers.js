angular.module('app.controllers', ['ngCordova'])
.controller('cardsCtrl', ['$scope', '$stateParams', '$state', 'cardsSerice', '$timeout', '$rootScope', '$ionicSideMenuDelegate',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $state, cardsSerice, $timeout, $rootScope, $ionicSideMenuDelegate) {
	// document.addEventListener("deviceready", function () {
		// autosize(document.getElementById("comment"));
	// }, false);
	if(localStorage.getItem('loggedIn') === 'true'){	
		$scope.cards = {};
		$scope.cards.queue = [];
		$scope.cards.nextQueue = [];
		$scope.cards.prefetchUrls = [];
		var lastCardNumberOfPage = 0;
		$scope.doRefresh = function(){
			lastCardNumberOfPage = 0;
			return $scope.fetchQueue(lastCardNumberOfPage, true);
		}
// fetch queue of ids
		$scope.fetchQueue = function(lastCardNumber, isRefresh){
			// var cardNumber = localStorage.getItem("cardNumber");
			return cardsSerice.getQueueOfIds(lastCardNumber).then(function(response){
					if(response.data.posts.length === 0) {
						$scope.cards.noMoreCardsAvailable = true;
					} else{
						if(isRefresh){
							$scope.cards.queue = response.data.posts;	
						} else{
							$scope.cards.queue.push.apply($scope.cards.queue, response.data.posts);
						}
						lastCardNumberOfPage = $scope.cards.queue[$scope.cards.queue.length - 1].cardNumber;
						// $scope.cards.queue.selectedOption = true;
						// check if user already voted
						$timeout(function(){
									// autosize(document.getElementById("comment"));
						}, 100);
						$scope.cards.checkIfAlreadyVoted(response.data.posts[0].cardNumber, response.data.posts[response.data.posts.length - 1].cardNumber, response.data.posts.length)
					}
					$scope.$broadcast('scroll.infiniteScrollComplete');
			}, function(){})
		}
		$scope.fetchQueue(lastCardNumberOfPage);
// check if current user has already voted
		$scope.cards.checkIfAlreadyVoted = function(start, end, noOfNewPosts){
			var userName = localStorage.getItem('username');
			cardsSerice.checkIfAlreadyVoted(start, end, userName).then(function(response){
				for(var i=$scope.cards.queue.length - noOfNewPosts; i <= $scope.cards.queue.length-1; i++){
					$scope.cards.queue[i].optionSelectedIndex = response.data.result[$scope.cards.queue[i].cardNumber];
					$scope.cards.queue[i].previousSelectedIndex = response.data.result[$scope.cards.queue[i].cardNumber];
				}
				console.log($scope.cards.queue)
			}, function(response){

			})
		}
// load more cards
		$scope.cards.loadMoreCards = function(){
			if($scope.cards.queue.length !== 0)
			$scope.fetchQueue(lastCardNumberOfPage);
		}
// next button
		$scope.cards.nextCard = function(){
			
		}
// previous button
		$scope.cards.previousCard = function(){

		}
// display a card
		$scope.currentCard = {};
		$scope.cards.displayCard = function(card){
			$scope.currentCard = card;
		}
// submit vote
		$scope.cards.submitVote = function(cardNumber, optionIndex, postIndex){
			console.log('submit calleds')
			var userName = localStorage.getItem('username');
			cardsSerice.submitVote(cardNumber, userName, optionIndex).then(function(response){
				console.log(response);
				if(response.data.success === true){
						$scope.cards.queue[postIndex].options[optionIndex].votes += 1;
					if($scope.cards.queue[postIndex].previousSelectedIndex !== undefined){
						console.log($scope.cards.queue[postIndex].previousSelectedIndex, "-----------", optionIndex)
						$scope.cards.queue[postIndex].options[$scope.cards.queue[postIndex].previousSelectedIndex].votes -= 1;
					} else{
						$scope.cards.queue[postIndex].totalVotes++;
					}
					$scope.cards.queue[postIndex].previousSelectedIndex = optionIndex;
				}
			}, function(response){
				console.log(response)
			})
		}
// post a comment
		$scope.postComment = function(cardNumber, indexOfPost){
			var comment = $scope.cards.queue[indexOfPost].comment
			var userName = localStorage.getItem("username");
			cardsSerice.postComment(cardNumber, userName, comment).then(function(response){
				$scope.cards.queue[indexOfPost].top2Comments = response.data.top2Comments
				$scope.cards.queue[indexOfPost].comment = "";
			}, function(){

			})
		};
// fetch comments
		$scope.fetchComments = function(postNumber){
			cardsSerice.fetchComments(postNumber).then(function(response){
				// $timeout(function(){
					$rootScope.comments = response.data.comments;
					// console.log($rootScope.comments)
			  $ionicSideMenuDelegate.toggleRight();
				// }, 0)
			// $state.go("menu.comments")
			// $rootScope.$apply()
			}, function(){})
		}
// create card 
		$scope.composeCard = function(){
			$state.go('createYourCard');
		};
	} else{
		$state.go('login');
	}

}])
   
.controller('accountCtrl', ['$scope', '$stateParams','$rootScope', '$state', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $rootScope, $state) {
	$scope.logout = function(){
		$rootScope.loggedIn = false;
	        localStorage.removeItem("loggedIn", "false");
	        localStorage.removeItem("username");
	        localStorage.removeItem("emailid");
	        localStorage.removeItem("phoneno");
	        localStorage.removeItem("profilepicurl");
	        localStorage.removeItem("cardNumber");
	        $state.go('login');
	}

}])
   
.controller('menuCtrl', ['$scope', '$stateParams', '$rootScope','cardsSerice', '$ionicSideMenuDelegate',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $rootScope, cardsSerice, $ionicSideMenuDelegate) {
		// fetch comments
		$scope.fetchComments = function(postNumber){
			return cardsSerice.fetchComments(postNumber).then(function(response){
					$rootScope.comments = response.data.comments;
			}, function(){})
		};
		$scope.$on('$ionicView.enter', function(){
	      $ionicSideMenuDelegate.$getByHandle('deli').canDragContent(false);
	    });
	  $scope.$on('$ionicView.leave', function(){
	      $ionicSideMenuDelegate.$getByHandle('deli').canDragContent(false);
	    });
}])
   
.controller('loginCtrl', ['$scope', '$stateParams', 'LoginService', '$rootScope', '$state', '$ionicModal', 'categories',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, LoginService, $rootScope, $state, $ionicModal, categories) {
  $scope.categories = categories;
  $scope.loginDetails={};
  $scope.loginDetails.errorMessage = "";
  $scope.loginRequest = function(){
	if(!$scope.loginDetails.username && !$scope.loginDetails.password){
		$scope.loginDetails.errorMessage = "Enter User Name And Password";
			$scope.expertiseModal.show();
	} else{
	    LoginService.login($scope.loginDetails).then(function successCall(response){
	      if(response.data.error){
	  		$scope.loginDetails.loginError = ""
	      } else{
	        $rootScope.loggedIn = true;
	        localStorage.setItem("loggedIn", "true"); // temporary false
	        localStorage.setItem("username", response.data.username);
	        localStorage.setItem("emailid", response.data.emailid);
	        localStorage.setItem("phoneno", response.data.phoneno);
	        localStorage.setItem("profilepicurl", response.data.profilepicurl);
	        localStorage.setItem("cardNumber", response.data.lastPostUserResponded);
			// open expertise selection modal
	        $state.go("menu.cards")
	      }
	    }, function failureCall(){});
	  }
  	};
  	// expertise selection modal
    $ionicModal.fromTemplateUrl('../templates/selectExpertise.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.expertiseModal = modal;
    }); 
    $scope.saveExpertise = function(){
    	// $scope.expertiseModal.hide();
    } 	
    // load exertise images
    $scope.expertise = {}
    $scope.expertise.fields = [];
 	$scope.expertise.selected = [];
    $scope.expertise.addSelection = function(index){
    	$scope.expertise.fields[index].selected = !$scope.expertise.fields[index].selected;
    }
    $scope.expertise.loadImages = function() {
        for(var i = 0; i < $scope.categories.length; i++) {
            $scope.expertise.fields[i] = {id: i, selected:false, src: "../img/"+$scope.categories[i]+'.jpeg', name: $scope.categories[i]};
        }
        console.log($scope.expertise.fields)
    }
}])
   
.controller('signupCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('commentsCtrl', ['$scope', '$stateParams', '$rootScope',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $rootScope) {
	// $scope.allComments = $rootScope.comments.comments;

}])

.controller('createYourCardCtrl', ['$scope', '$stateParams', 'createCardService', 'categories', '$ionicPlatform', '$state', '$cordovaCamera', '$timeout', '$ionicLoading', 'uploadImageToCloudinary', '$cordovaImagePicker', '$ionicActionSheet',// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
function ($scope, $stateParams, createCardService, categories, $ionicPlatform, $state, $cordovaCamera, $timeout, $ionicLoading, uploadImageToCloudinary, $cordovaImagePicker, $ionicActionSheet) {
	// {imageSrc: "../img/7qAm6ZYSypknVtizUgQd_avatar.jpg"},{imageSrc: "../img/gHd5vedGQJu4s4qsPQvr_kitten2.jpg"}
	autosize(document.getElementById("note"));
	$scope.categories = categories;
	$scope.postData = {};
	$scope.postData.sliderInCreate = [];
// back button handle
	$ionicPlatform.registerBackButtonAction(function (event) {
	  event.preventDefault();
	  $state.go("menu.cards");
	}, 100);
// slider
		//create delegate reference to link with slider
		$scope.data = {}
	    $scope.data.sliderDelegate = null;

	    //watch our data.sliderDelegate reference, and use it when it becomes available
	    $scope.$watch('data.sliderDelegate', function(newVal, oldVal) {
	      // if (newVal != null) {
		      //   $scope.data.sliderDelegate.on('slideChangeEnd', function() {
		      //     $scope.currentPage = $scope.data.sliderDelegate.activeIndex;
		      //     alert($scope.currentPage)
		      //     $scope.$apply();
		      //   });
	      // }
	    });
// camera
		$scope.takePicture = function(){
		    document.addEventListener("deviceready", function () {
				    var options = {
				      // quality: 1000,
				      destinationType: Camera.DestinationType.DATA_URL,
				      sourceType: Camera.PictureSourceType.CAMERA,
				      // allowEdit: true,
				      encodingType: Camera .EncodingType.JPEG,
					  targetWidth: 1000,
					  targetHeight: 700,
					  cameraDirection: 0,
					  //    popoverOptions: CameraPopoverOptions,
					  saveToPhotoAlbum: true,
					  // correctOrientation:true
				    };
				    $cordovaCamera.getPicture(options).then(function(imageData) {
					    var src = "data:image/jpeg;base64," +imageData;
				      	// $scope.postData.sliderInCreate.push({imageSrc:src});
					      		$scope.uploadContent(src);
				      	//$ionicLoading.show({
					    //   template: 'Loading...',
					    //   duration: 500
					    // }).then(function(){
					    // });
				    }, function(err) {
				      alert(err)
				    });
			}, false);
	  	};
// photo library
	$scope.photoLibrary = function(){
		document.addEventListener('deviceready', function(){
			  var options = {
			   maximumImagesCount: 10,
			   width: 800,
			   height: 800,
			   quality: 80
			  };

			  $cordovaImagePicker.getPictures(options)
			    .then(function (results) {
			      for (var i = 0; i < results.length; i++) {
			        // $scope.collection.selectedImage = results[i];   // We loading only one image so we can use it like this

                window.plugins.Base64.encodeFile(results[i], function(base64){  // Encode URI to Base64 needed for contacts plugin
			        var imageWithoutType = base64.split("base64,")[1];
			        $scope.uploadContent("data:image/jpeg;base64,"+imageWithoutType);
                });

			      }
			    }, function(error) {
			      console.log(error)
			    });
		}, false)
		}
// upload image
	  $scope.uploadContent = function(content){
	  	// console.log(content)
	    uploadImageToCloudinary.uploadContent(content).then(function(response){
	      	$scope.postData.sliderInCreate.push({imageSrc:response.data.url});
	      	console.log("uploaded")
	      	$timeout(function(){
		      	if($scope.postData.sliderInCreate.length !== 1){
		      		$scope.data.sliderDelegate.slideTo($scope.postData.sliderInCreate.length-1 ,500);
		      	}
	      	}, 1000);
	    }, function(response){
	    	console.log(JSON.stringify(response))

	    })
	  }
// action sheet
	$scope.showActionsheet = function() {
	    $ionicActionSheet.show({
	      titleText: 'Upload Image',
	      buttons: [
	        { text: '<i class="icon ion-android-camera"></i> Camera' },
	        { text: '<i class="icon ion-android-phone-portrait"></i> Photo Library' },
	      ],
	      // destructiveText: 'Delete',
	      cancelText: 'Cancel',
	      cancel: function() {
	        console.log('CANCELLED');
	      },
	      buttonClicked: function(index) {
	      	if(index === 0) $scope.takePicture();
	      	else if(index === 1) $scope.photoLibrary();
	        return true;
	      },
	      // destructiveButtonClicked: function() {
	      //   console.log('DESTRUCT');
	      //   return true;
	      // }
	    });
  	};
// selection of category
	$scope.$watch('postData.categorySelected', function(newVal, oldVal){
		$scope.postData.options = [];
		if(newVal !== oldVal){
			if(newVal === "Fact"){
				$scope.postData.options[0] = {option: "Wowwwwww", votes: 0};
				$scope.postData.options[1] = {option: "This is super Awesome", votes: 0};
				$scope.postData.options[2] = {option: "I never knew this", votes: 0};
				$scope.postData.options[3] = {option: "EveryBody Knows This", votes: 0};
			}
		}
	})
// post card
	$scope.postCard = {};
	$scope.postCard.post = function(){
		console.log($scope.postData)
		for(var i = 0; i<$scope.postData.options.length; i++){
			if($scope.postData.options[i].option){
				$scope.postData.options[i].votes = 0;
				$scope.postData.options[i].indexOfOption = i;
			}
		}
		$scope.postData.username = localStorage.getItem('username');
		$scope.postData.profilepicurl = localStorage.getItem('profilepicurl');
		createCardService.postCard($scope.postData).then(function(response){
			if(!response.data.success){
				console.log("error");
			} else{
				console.log('sucesss');
				$scope.goToCards();
			}
		}, function(response){

		})
	}
// go to cards
	$scope.goToCards = function(){
				$scope.postData = {};
				$scope.postData.options = [];
				$scope.postData.sliderInCreate = [];
				$state.go("menu.cards");
	}
}])
   
.controller('myCardsCtrl', ['$scope', '$stateParams', 'userCards', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, userCards) {
	// alert("loaded")
	$scope.mycards = {}
	var username = localStorage.getItem('username');
	$scope.getUserCards = function(){
		userCards.getUserCards(username).then(function(response){
			$scope.mycards.queue = [];
			$scope.mycards.queue = response.data.cards;
			console.log("request completed", response)
			// $scope.$apply();
		}, function(response){})
	};
	$scope.getUserCards();
}])
 