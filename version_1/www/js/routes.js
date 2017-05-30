angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('menu.cards', {
    url: '/page1',
    cache:false,
    views: {
      'side-menu21': {
        templateUrl: 'templates/cards.html',
        controller: 'cardsCtrl'
      }
    }
  })

  .state('cart', {
    url: '/page2',
    cache:false,
    templateUrl: 'templates/cart.html',
    controller: 'cartCtrl'
  })

  .state('menu.account', {
    url: '/page3',
    views: {
      'side-menu21': {
        templateUrl: 'templates/account.html',
        controller: 'accountCtrl'
      }
    }
  })

  .state('menu', {
    url: '/side-menu21',
    templateUrl: 'templates/menu.html',
    controller: 'menuCtrl'
  })

  .state('login', {
    url: '/page4',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('signup', {
    url: '/page5',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

  .state('menu.comments', {
    url: '/page6',
    cache:false,
    views: {
      'side-menu21': {
        templateUrl: 'templates/comments.html',
        controller: 'commentsCtrl'
      }
    }
  })

  .state('createYourCard', {
    url: '/page7',
    cache:false,
    templateUrl: 'templates/createYourCard.html',
    controller: 'createYourCardCtrl'
  })

  .state('menu.myCards', {
    url: '/page8',
    // cache:false,
    views: {
      'side-menu21': {
        templateUrl: 'templates/myCards.html',
        controller: 'myCardsCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/side-menu21/page1')
});