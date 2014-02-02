angular.module('app.controllers', [])
  .controller('NavController', [function () {
    console.log('NavController')
  }])
  .controller('ExchangeController', ['$rootScope', '$scope', '$http', '$q',
    function ($rootScope, $scope, $http, $q) {

      function validateInput(type, value){//todo optimize UI
        var ret=true;
        value=value && value.trim()
        if(isNaN(value)){
          $scope.data.error='input not a number';

          ret=false;
        }else if(value==''){
          $scope.data.error=null;
          ret = false;
        }else{
          $scope.data.error=null;
        }
        return ret;
      }

      //解决触发多个ajax请求时 先发的请求后到覆盖最新的数据问题
      //确保仅最新的ajax请求起作用
      var singleQueryDfd=null;
      $scope.exchange = function () {
        $scope.info.loading=true
        //
        singleQueryDfd && singleQueryDfd.reject
                       && singleQueryDfd.reject('reject_previous_query')
        singleQueryDfd = $q.defer();

        var reqObj={
          exchange_type: $scope.data.exchange_type, //buybtc sellbtc
          input_type: $scope.data.input_type    //btc usd
        }
        reqObj[reqObj.input_type]= $scope.data[reqObj.input_type].trim();


        $http({
          method: 'GET',
          url: '/exchange',
          params: reqObj

        })
        .success(function (data, status, headers, config) {
          if(data.error){
            singleQueryDfd.reject(data.error)
          }else{
            singleQueryDfd.resolve(data)
          }

        })
        .error(function (data, status, headers, config) {
          singleQueryDfd.reject(data)
          $scope.info.loading=false;
        })

        singleQueryDfd.promise.then(function(data){
          console.log(data)
          $scope.info.loading=false
          $scope.data = data;
        },function(error){
          $scope.info.loading=false
          $scope.data.error=error;
          console.log(error)
        })
      }

      //延迟相应键盘输入,避免频繁触发ajax请求
      var inputTimer = null;
      $scope.inputChange = function (type,value) {
        if (type == 'input_buy' || type == 'input_sell') { //type select
          console.log('input_buy input_sell')

          if ($scope.data.input_type == 'btc') {
            $scope.data.usd = ''
            if ($scope.data.btc) {
              $scope.exchange();
            }
          } else if ($scope.data.input_type == 'usd') {
            $scope.data.btc = '';

            if ($scope.data.usd) {
              $scope.exchange();
            }
          }
        } else if (type == 'input_btc' || type == 'input_usd') { //key input
          if (type == 'input_btc') {
            $scope.data.usd = ''
            $scope.data.input_type = 'btc'
          } else if (type == 'input_usd') {
            $scope.data.btc = ''
            $scope.data.input_type = 'usd'
          }
          if (inputTimer) {
            clearTimeout(inputTimer);
            inputTimer=null;
          }

          console.log(value)
          if(!validateInput(type,value)) return;

          inputTimer = setTimeout(function () {


            $scope.exchange();
            inputTimer=null;

          }, 100);


        }


        console.log($scope.data)
      }

      $scope.convertClick=function(){
        if($scope.loading) return;
        if(!validateInput($scope.data.input_type,$scope.data[$scope.data.input_type])) return;
        $scope.exchange();
      }

      $scope.info={
        loading:false
      }
      $scope.data = {
        exchange_type: "buybtc", //buybtc sellbtc
        input_type: '',    //btc usd
        btc: '',
        usd: '',
        error:''
      }
      console.log('ExchangeController')
    }])
