// var express = require('express');
// var router = express.Router();

// /* GET home page. */
// router.get('/', function(req, res) {
//   res.render('index', { title: 'White board' });
// });

// module.exports = router;

exports.index = function(req, res){
  var userId = req.query.user;
  var channelId = req.query.channel;
  res.render('index', { title: 'White board', userId: userId, channelId: channelId });
};

exports.signin = function(req, res) {
  //console.log('signin:' + JSON.stringify(req.body));
  var userId = req.body.email;
  res.redirect('/?user='+userId);
}