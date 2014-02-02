/**
 *  使用mathjs库修正 js的浮点运算问题
 * @type {*}
 */
var math = require('mathjs')({
  number: 'bignumber', // 'bignumber'
  decimals: 32         // Number decimal places behind the dot for big numbers
});

/**
 * @return {String}
 *
 * M.add(M.add(0.00001,0.00002),0.1)==0.10003
 */
var M = {
  add: function (a, b) {
    return math.add(math.bignumber(a),math.bignumber(b)).toString()
  },
  sub: function (a, b) {
    return math.subtract(math.bignumber(a),math.bignumber(b)).toString()
  },
  mul: function (a, b) {
    return math.multiply(math.bignumber(a),math.bignumber(b)).toString()
  },
  div: function (a, b) {
    return math.divide(math.bignumber(a),math.bignumber(b)).toString()
  },
  // bigger:function(a,b){
  //   return math.eval(a+'>'+b);
  // 
  // },
  compare: function(a,op,b){
    return math.eval(''+a + op + b);
  }
}

module.exports=M;

//simple test
if(!module.parent){
  console.log(0.00001+0.00002==0.00003) //false
  console.log(0.00002-0.00001==0.00001)
  console.log(0.0005*0.0002==0.0000001) //false
  console.log(0.01/0.01==1)

  console.log('=====')
  console.log(M.add(0.00001,0.00002)==0.00003)
  console.log(M.sub(0.00002,0.00001)==0.00001)
  console.log(M.mul(0.0005,0.0002)==0.0000001)
  console.log(M.div(0.01,0.01)==1)
  console.log(M.add(M.add(0.00001,0.00002),0.1)==0.10003)

  console.log(math.eval('318.75799052<99'))
  console.log(M.compare('318.75799052','<','99'))

  console.log(math.eval('0.00001','0.00002'))
  console.log(math.eval('0.00001+0.00002'))

}