// var express = require('express');
// var router = express.Router();

// /* GET users listing. */
// router.get('/', function(req, res) {
//   res.send('respond with a resource');
// });

// module.exports = router;


exports.user = function(req, res){
  res.render('index', { title: 'White board' });
};