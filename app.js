require('newrelic');

// set variables for environment
var express = require('express');
var app = express();
var path = require('path');
var nodeSass = require('node-sass');
var fs = require('fs');
var sassModules = require('./config/plugins.json');

var APP_LAST_MODIFIED = fs.statSync('./config/plugins.json').mtime;

var extractImports = function(sass) {
  var imports = [],
      regex = /@import\s*[("']*([^;]+)[;)"']*/g;

  while ((result = regex.exec(sass)) !== null ) {
    var x = result[1].replace(/"|'/gi, "").split(",");

    for(i = 0; i < x.length; i++) {
      imports.push(x[i].trim());
    }
  }

  return imports;
};

var setIncludePaths = function(imports) {
  var paths = ["sass_modules/"];
  var fingerprint;

  for(i = 0; i < imports.length; i++) {
    for(var module in sassModules) {
      fingerprint = new RegExp(sassModules[module].fingerprint, "gi");

      if(imports[i].match(fingerprint)) {
        for(path in sassModules[module].paths) {
          paths.push("sass_modules/" + sassModules[module].paths[path] + "/");
        }
      }
    }
  }

  paths= paths.filter(function (v, i, a) { return a.indexOf (v) == i }); // dedupe array

  return paths;  
};

var sassCompile = function(sass, outputStyle) {
  var includePaths = setIncludePaths(extractImports(sass));

  return nodeSass.renderSync({
    data: sass,
    outputStyle: outputStyle,
    includePaths: includePaths
  });
};



// views as directory for all template files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // replace with whatever template language you desire
// instruct express to server up static assets
app.use(express.static('public'));
app.use(express.bodyParser());



app.all('*', function(req, res, next) {
  if(req.get('origin') && req.get('origin').match(/^http:\/\/(.+\.){0,1}sassmeister\.(com|dev|([\d+\.]{4}xip\.io))/)) {
    res.set('Access-Control-Allow-Origin', req.get('origin'));
  }

  next();
});


// Set up site routes
app.get('/', function(req, res) {
  res.render('index');
});


app.post('/compile', function(req, res) {
  var css = '',
      sass = req.body.input,
      outputStyle = req.body.output_style;

  var time = new Date;

  try {
    if(req.body.syntax == 'sass') {
      console.log('Converting...');
      var convert = require('./sass_modules/sass2scss');

      sass = convert.sass2scss(sass);
    }

    css = sassCompile(sass, outputStyle)
  }
  catch(e) {
    css = e.toString();
  }

  time = (new Date - time) / 1000;

  res.json({
    css: css,
    dependencies: {
      'libsass': '2.0.0'
    },
    time: time //.run().times.elapsed
  });
});


app.get('/extensions', function(reg, res) {
  var extensions = {}

  for(extension in sassModules) {
    extensions[extension] = {import: sassModules[extension].imports}
  }

  res.setHeader('Last-Modified', (new Date(APP_LAST_MODIFIED)).toUTCString());
  res.setHeader('Cache-Control', 'public, max-age=2592000');
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(extensions));

  //res.render('extensions', {extensions: sassModules});
});

// With the express server and routes defined, we can start to listen
// for requests. Heroku defines the port in an environment variable.
// Our app should use that if defined, otherwise 3000 is a pretty good default.
var port = process.env.PORT || 1337;
app.listen(port);
console.log("The server is now listening on port %s", port);
