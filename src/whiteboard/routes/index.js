
exports.index = function(req, res, ctx){
  ctx['userId'] = req.query.user;
  ctx['channelId'] = req.query.channel;
  res.render('index', ctx);
};

exports.signin = function(req, res, ctx) {
  //console.log('signin:' + JSON.stringify(req.body));
  var userId = req.body.email;
  res.redirect('/?user='+userId+'&channel=test01');
}