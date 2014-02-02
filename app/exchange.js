

//now only use mock data
var data = require('../test/mock/data.json');
var M = require('./counter.js');

var COMMISSION = 0.01;
var ASKS = data.return.asks
var BIDS = data.return.bids


/**
 * 获得可买/卖的比特币总数量
 * @param arr
 * @returns {String}
 */
function getBTCCount(arr) {
  var sum = 0;
  for (var i = 0; i < arr.length; i++) {
    sum = M.add(sum, arr[i].amount)
  }
  return sum.toString();
}

/**
 * 获取比特币对应美元总数
 * @param arr
 * @returns {string}
 */
function getUSDCount(arr) {
  var sum = 0;
  for (var i = 0; i < arr.length; i++) {
    sum = M.add(sum, M.mul(arr[i].amount, arr[i].price))
  }
  return sum.toString();
}


/*
 计算逻辑：???
 ASKS和BIDS数据中的price皆以比特币为基础货币进行计算（美元/比特币）。
 共有四种情况：
 1.购买比特币（使用ASKS数据，该数据代表其它用户的卖价）
 a.输入比特币 要得到这些比特币需要多少美元来买
 b.输入美元   这些美元可以买到多少比特币
 2.卖比特币（使用BIDS数据，该数据代表其它用户的买价）
 a.输入比特币 卖这些比特币可以得到多少美元
 b.输入美元，要得到这些美元应卖多少比特币

 佣金计算: ???
 1.购买比特币
 a.输入比特币时 最终美元数量=计算出的美元数量*（1+佣金百分比）
 b.输入美元    用 输入的美元数量*（1-佣金百分比）计算比特币数量  （上述逆运算）
 2.卖比特币
 a.输入比特币时  最终美元数量=计算出的美元数量*（1-佣金百分比）
 b.输入美元      用 输入的美元数量*（1+佣金百分比）计算比特币数量   （上述逆运算）

 */
/**
 *
 * @param orderType   交易类型 buybtc sellbtc (对应buy bitcoin 和 sell bitcoin)
 * @param inputType   用户输入的货币类型 对应两个输入框
 * @param count       输入数值
 * @param commission  佣金  不计算佣金可设置为0
 */
function order(orderType, inputType, count, commission) {
  var i = -1, sum = 0, cost = 0;
  var temp;
  var obj={}

  if(orderType=='buybtc'){ //using ASKS
    if(inputType=='btc'){
      if (count < 0 || M.compare(count ,'>', getBTCCount(ASKS))) {
        console.error('not a number or too small or too big')
        obj.error='not a number or too small or too big'
        return obj;
      }
      i = -1;
      while (M.compare(sum,'<',count)) {
        i++;
        temp =M.add(sum, ASKS[i].amount)
        if (M.compare(temp, '<=' ,count)) {//buy all
          sum = temp
          cost = M.add(cost, M.mul(ASKS[i].amount, ASKS[i].price))
        } else {//buy part
          cost = M.add(cost, M.mul(M.sub(count, sum), ASKS[i].price))
          break;
        }
      }
      //commission
      cost=M.mul(cost,(1+commission));
    }else if(inputType=='usd'){
      //commission
      count=M.mul(count,(1-commission))

      if (count < 0 || M.compare(count ,'>', getUSDCount(ASKS))) {
        console.log('count:',count,'usdcount:',getUSDCount(ASKS))
        console.error('not a number or too small or too big')
        obj.error='not a number or too small or too big'
        return obj;
      }
      i = -1;
      while (M.compare(sum ,'<', count)) {
        i++;
        temp = M.add(sum, M.mul(ASKS[i].amount, ASKS[i].price))
        if (M.compare(temp, '<=', count)) {//buy all
          sum = temp
          cost = M.add(cost, ASKS[i].amount)
        } else {//buy part
          cost = M.add(cost, M.div(M.sub(count, sum), ASKS[i].price))
          break;
        }
      }
    }

  }else if(orderType=='sellbtc'){//using BIDS
    if(inputType=='btc'){
      if (count < 0 || M.compare(count ,'>',getBTCCount(BIDS))) {
        console.error('not a number or too small or too big')
        obj.error='not a number or too small or too big'
        return obj;
      }
      i = BIDS.length;
      while (M.compare(sum ,'<', count)) {
        i--;
        temp = M.add(sum, BIDS[i].amount)
        if (M.compare(temp ,'<=', count)) {// all
          sum = temp
          cost = M.add(cost, M.mul(BIDS[i].amount, BIDS[i].price))
        } else {// part
          cost = M.add(cost, M.mul(M.sub(count, sum), BIDS[i].price))
          break;
        }
      }
      //commission
      cost=M.mul(cost,(1-commission));
    }else if(inputType=='usd'){
      //commission
      count=M.mul(count,(1+commission))

      if (count < 0 || M.compare(count ,'>', getUSDCount(BIDS))) {
        console.error('not a number or too small or too big')
        obj.error='not a number or too small or too big'
        return obj;
      }
      i = BIDS.length;
      while (M.compare(sum ,'<', count)) {
        i--;
        temp = M.add(sum, M.mul(BIDS[i].amount, BIDS[i].price))
        if (M.compare(temp,'<=',count)) {// all
          sum = temp
          cost = M.add(cost, BIDS[i].amount)
        } else {// part
          cost = M.add(cost, M.div(M.sub(count, sum), BIDS[i].price))
          break;
        }
      }

    }
  }
  obj.cost=cost;
  return obj;
}


module.exports ={
  exchange:function(orderType, inputType, count){
       return order(orderType, inputType, count, COMMISSION)
  }
}

//simple test
if (!module.parent) {

  console.log(order('buy','btc',10))
  console.log(order('buy','usd',9504.7528))

  console.log(order('sell','btc',10))
  console.log(order('sell','usd',9425.04069))


  //console.log(getUSDCount(ASKS))
}


