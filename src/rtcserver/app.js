// var express = require('express');
// var path = require('path');
// var favicon = require('static-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');

// var routes = require('./routes/index');
// var users = require('./routes/users');

// var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// app.use(favicon());
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded());
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/users', users);

// /// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// /// error handlers

// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             message: err.message,
//             error: err
//         });
//     });
// }

// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//         message: err.message,
//         error: {}
//     });
// });


// module.exports = app;

var webRTC = require('webrtc.io').listen(3001);

webRTC.rtc.on('connect', function(rtc) {
  console.log('webRTC server: connect');
});

webRTC.rtc.on('send answer', function(rtc) {
  console.log('webRTC server: send answer');
});

webRTC.rtc.on('disconnect', function(rtc) {
  console.log('webRTC server: disconnect');
});

webRTC.rtc.on('chat_msg', function(data, socket) {
  var rooms = webRTC.rtc.rooms[data.room] || [];
  var socketId;
  var socketObj;
  var msg;
  for (var i = 0, len = rooms.length; i < len; i++) {
    socketId = rooms[i];
    if (socketId !== socket.id) {
      socketObj = webRTC.rtc.getSocket(socketId);
      if (socketObj) {
        msg = {
          'eventName': 'receive_chat_msg',
          'data': {
            'messages': data.messages,
            'color': data.color
          }
        };
        socketObj.send(JSON.stringify(msg), function(err) {
          if (err) {
            console.log('Failed to send message: ' + err);
          }
        });
      }
    }
  }   // for
});
