angular.module('app', ['ngRoute','app.controllers'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: 'views/exchange.html'
    });
    $routeProvider.otherwise({
      redirectTo: '/'
    });
  }]);