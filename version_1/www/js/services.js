angular.module('app.services', [])
// .directive('ionBottomSheet', [function() {
//     return {
//       restrict: 'E',
//       transclude: true,
//       replace: true,
//       controller: [function() {}],
//       template: '<div class="modal-wrapper" ng-transclude></div>'  
//     };
//   }])
// .directive('ionBottomSheetView', function() {
//   return {
//     restrict: 'E',
//     compile: function(element) {
//       element.addClass('bottom-sheet modal');
//     }
//   };
// })
.value("backendUrl", "http://172.16.26.44:3000") //172.16.26.44 || 192.168.1.10
.value("categories", [
                      "Brain Quiz",
                      "Baby care",
                      "Bollywood",
                      "Business", 
                      "Computers", 
                      "Cooking", 
                      "Countries", 
                      "Cricket",
                      "Dating",
                      "Economy", 
                      "Education", 
                      "Entrepreneurship", 
                      "Exercise", 
                      "Fact", 
                      "FootBall",
                      "Gaming", 
                      "Gadget", 
                      "Gifts", 
                      "Geography", 
                      "History", 
                      "Health", 
                      "Hockey",
                      "Hollywood",
                      "Law",
                      "Love",
                      "Mathematics",
                      "Movies",
                      "Painting", 
                      "Sex", 
                      "Start ups", 
                      "Share Market", 
                      "Sports",
                      "Sketching", 
                      "Sarcasm",
                      "Photography", 
                      "Poetry", 
                      "Politics", 
                      "Technology", 
                      "Travel"
                      ])
/*******************************************LOGIN****************************************************************************/
  .factory('LoginService',function($http, backendUrl, $q){
    var loginRequestPromise = $q.defer(); 
    loginRequestPromise.resolve();
    return {
      login: function(loginDetails){
        if(loginRequestPromise.promise.$$state.status === 0){
          loginRequestPromise.resolve();
        }
        loginRequestPromise = $q.defer();
        return $http({
          url: backendUrl+'/loginRequest',
          method: 'POST',
          timeout: loginRequestPromise.promise,
          data:{username: loginDetails.username, password: loginDetails.password}
        });
      }
    }
  })
/*******************************************SIGN UP****************************************************************************/
  .factory('SignupService', function($http, backendUrl, $q){
    var signupRequestPromise = $q.defer();
    signupRequestPromise.resolve();
    return {
      signup: function(signupDetails){
        if(signupRequestPromise.promise.$$state.status === 0){
          signupRequestPromise.resolve();
        }
        signupRequestPromise = $q.defer();
        return $http({
          url: backendUrl+'/signupRequest',
          method: 'POST',
          timeout: signupRequestPromise.promise,
          data: {userdetails: signupDetails}
        });
      }
    }
  })
/******************************************CREATE CARD****************************************************************************/
  .factory('createCardService', function($http, backendUrl){
    return {
      getCategories: function(){
        return $http({
          method: 'GET',
          url: "/getCategories"
        });
      },
      postCard: function(content){
        return $http({
          url : backendUrl+"/postCard",
          method: "POST",
          data: {cardDetails: content}
        })
      }
    }
  })
/******************************************UPLOAD IMAGE TO CLOUDINARY****************************************************************************/
  .factory('uploadImageToCloudinary', function($http){
    return {
      uploadContent: function(content){
        var timestampNow = new Date().getTime();
        return $http({
          url: "https://api.cloudinary.com/v1_1/shivanu31/image/upload",
          method: 'POST',
          data: {
            file: content,
            api_key: 572472537769639,
            timestamp: timestampNow,
            signature: new Hashes.SHA1().hex("timestamp="+timestampNow+"gkRxLhy0hNwrcmUlKTsD_DSlAyk")
          }
        })
      }
    }
  })
/******************************************USER CARDS****************************************************************************/
  .factory('userCards', function($http, backendUrl){
    return {
      getUserCards: function(username){
        return $http({
          url: backendUrl+ "/getUserCards?username="+username,
          method: "GET"
        });
      }
    }
  })
/******************************************CARDS MAIN PAGE****************************************************************************/
 .factory("cardsSerice", function($http, backendUrl){
  return { 
    getQueueOfIds: function(cardNumberLastSeen){
      return $http({
        method: "GET", 
        url: backendUrl+'/fetchCardsQueue?postNumber='+cardNumberLastSeen
      });
    }, 
    submitVote: function(cardNumber, userId, optionNoSelected){
      return $http({
        method: 'POST',
        url: backendUrl+'/submitVote',
        data: {cardNumber: cardNumber, userId: userId, optionNoSelected: optionNoSelected}
      });
    },
    checkIfAlreadyVoted: function(start, end, username){
      return $http({
        method: "POST", 
        url: backendUrl+"/fetchVotes",
        data: {start: start, end: end, username: username}
      });
    },
    postComment: function(cardNumber, username, comment){
      return $http({
        method:"POST",
        url: backendUrl+'/postComment',
        data: {cardNumber:cardNumber, username:username, comment: comment}
      });
    },
    fetchComments: function(cardNumber){
      return $http({
        method: "GET",
        url: backendUrl+"/fetchComments?cardNumber="+cardNumber,
      });
    }
  }
 })
  
.service('BlankService', [function(){

}]);