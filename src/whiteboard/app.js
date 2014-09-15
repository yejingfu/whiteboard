/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var sharejs = require('share').server;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));  // use nginx for static server

// development only
if ('development' === app.get('env')) {
    console.log('debug is ON');
    app.use(express.errorHandler());
}

var ctx = {
    title: 'White board'
};

var httpHandler = function(handler) {
    return function(req, res) {
        handler(req, res, ctx);
    };
};

app.get('/', httpHandler(routes.index));



//api.test();

sharejs.attach(app, {db:{type:'none'}});    // enable sharejs

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
