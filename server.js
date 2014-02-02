var express = require('express');
var app = express();

var exchange = require('./app/exchange.js').exchange;

app.engine('.html', require('ejs').__express);

app.use(express.static(__dirname + '/public'));
//app.use('/static', express.static(__dirname + '/public'));
//app.use(express.static(__dirname + '/public/css'));

app.set('views', __dirname + '/public/views');
app.set('view engine', 'html');

app.get('/', function(req, res){
  res.render('index', {
    title: "EJS example",
    header: "Some users"
  });
});

app.get('/exchange', function(req, res){
  var q= req.query;

  //validate param in backend todo

  //do exchange
  console.log(q)
  var result=exchange(q.exchange_type,q.input_type,q[q.input_type])
  if(result.error){
    q.error= result.error;
  }else{
    if(q.input_type=='btc'){
      q.usd=result.cost;
    }else if(q.input_type=='usd'){
      q.btc=result.cost;
    }
  }

  console.log(q)
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(q),'utf-8')

});

if (!module.parent) {
  app.listen(3000);
  console.log('Express app started on port 3000');
}