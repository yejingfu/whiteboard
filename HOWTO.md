How to build
============

## Install nodejs and express

In order to install `nodejs` and `express`, please reference to this [article](https://github.com/yejingfu/blog/blob/master/2014/howtoexpress.md).

To launch the server locally, call `npm start`.

    $cd src/whiteboard
    $node app.js                ## or: $npm start in express 4.x
	
	## start webrtc server
	$cd src/rtcserver
	$node app.js   ## or run in production env:
	$NODE_ENV=production node app.js

If the server is launched successfully, you can visit the home page at `http://localhost:3000/`.

## Automation with grunt
[Gruntjs](http://gruntjs.com/)
[Gruntenv](https://www.npmjs.org/package/grunt-env)
[production mode](http://www.hacksparrow.com/running-express-js-in-production-mode.html)

## Minify
[uglifyjs2](https://github.com/mishoo/UglifyJS2)

- example:  

    $uglifyjs sample.js -c -m -o sample.min.js

## RequireJS optimization
[RequireJS optimization](http://requirejs.org/docs/optimization.htm)

- exmaple:

   $r.js -o optimize=uglify2 baseUrl=. name=main out=main.min.js

## Bootstrap

## PaperJS

