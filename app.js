
// set variables for environment
var express = require('express');
var app = express();
var path = require('path');
var nodeSass = require('node-sass');


//   def sass_compile(sass, syntax, output_style)
//     imports = ''
//
//     if ! sass.match(/^\/\/ ----\n/) && sass.match(/^\/\/ ([\w\s]+?) [\(\)v\d\.]+?\s*$/)
//       imports = unpack_dependencies(sass)
//       imports = imports.join("#{syntax == 'scss' ? ';' : ''}\n") + "#{syntax == 'scss' ? ';' : ''}\n" if ! imports.nil?
//     end
//
//     sass.slice!(/(^\/\/ [\-]{3,4}\n(?:\/\/ .+\n)*\/\/ [\-]{3,4}\s*)*/)
//
//     sass = imports + sass if ! imports.nil?
//
//     require_plugins(sass)
//
//     begin
//       send("#{syntax}".to_sym, sass.chomp, {:style => :"#{output_style}", :quiet => true})
//
//     rescue Sass::SyntaxError => e
//       status 200
//       e.to_s
//     end
//   end



var sass_compile = function(sass, output_style) {
  return nodeSass.renderSync({
    data: sass,
    outputStyle: output_style
  });
};

// views as directory for all template files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // replace with whatever template language you desire
// instruct express to server up static assets
app.use(express.static('public'));
app.use(express.bodyParser());


// Set up site routes
app.get('/', function(req, res) {
  res.render('index');
  //res.redirect('http://sassmeister.com');
});


app.post('/compile', function(req, res) {
  // RUBY CODE:
  // content_type 'application/json'
  //
  // {
  //   css: sass_compile(params[:input], params[:syntax], params[:output_style]),
  //   dependencies: get_build_dependencies(params[:input])
  // }.to_json.to_s


  var css = '';

  try {
    css = sass_compile(req.body.input, req.body.output_style)
  }
  catch(e) {
    css = e.toString();
  }
  
  res.json({
    css: css,
    dependencies: {}
  });
  
  
  //  console.log(req.body.input);
  
});


// With the express server and routes defined, we can start to listen
// for requests. Heroku defines the port in an environment variable.
// Our app should use that if defined, otherwise 3000 is a pretty good default.
var port = process.env.PORT || 1337;
app.listen(port);
console.log("The server is now listening on port %s", port);
