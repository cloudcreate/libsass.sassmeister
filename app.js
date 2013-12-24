
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



// def unpack_dependencies(sass)
//   frontmatter = sass.slice(/^\/\/ ---\n(?:\/\/ .+\n)*\/\/ ---\n/)
// 
//   if frontmatter.nil?
//     frontmatter = sass.scan(/^\/\/ ([\w\s]+?) [\(\)v[:alnum:]\.]+?\s*$/).first
//   else
//     frontmatter = frontmatter.to_s.gsub(/(\/\/ |---|\(.+$)/, '').strip.split(/\n/)
//   end
// 
//   frontmatter.delete_if do |x|
//     ! plugins.key?(x.to_s.strip)
//   end
// 
//   if frontmatter.empty?
//     return nil
//   else
//     imports = []
// 
//     plugins[frontmatter.first.strip][:import].each do |import|
//       imports << "@import \"#{import}\""
//     end
// 
//     return imports
//   end
// end


// def require_plugins(sass)
//   get_imports_from_sass(sass) { |name, plugin| require plugin[:gem] }
// 
//   Compass.sass_engine_options[:load_paths].each do |path|
//     Sass.load_paths << path
//   end
// end


// def get_imports_from_sass(sass)
//   imports = sass.scan(/^\s*@import[\s\"\']*(.+?)[\"\';]*$/)
//   imports.map! {|i| i.first}
// 
//   plugins.each do |key, plugin|
//     if ! imports.grep(/#{plugin[:fingerprint].gsub(/\*/, '.*?')}/).empty?
//       yield key, plugin if block_given?
//     end
//   end
// end






// views as directory for all template files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // replace with whatever template language you desire
// instruct express to server up static assets
app.use(express.static('public'));
app.use(express.bodyParser());




app.all('*', function(req, res, next) {
  if(req.get('origin').match(/^http:\/\/(.+\.){0,1}sassmeister\.(com|dev|([\d+\.]{4}xip\.io))/)) {
    res.set('Access-Control-Allow-Origin', req.get('origin'));
  }

  next();
});


// Set up site routes
app.get('/', function(req, res) {
  res.render('index');
  //res.redirect('http://sassmeister.com');
});


app.post('/compile', function(req, res) {
  var css = '';

  try {
    css = sass_compile(req.body.input, req.body.output_style)
  }
  catch(e) {
    css = e.toString();
  }
  
  res.json({
    css: css,
    dependencies: {
      'libsass': '0.7.0'
    }
  });
});


app.get('/extensions', function(reg, res) {
  res.send('<div id="extension_list"></div>');
});

// With the express server and routes defined, we can start to listen
// for requests. Heroku defines the port in an environment variable.
// Our app should use that if defined, otherwise 3000 is a pretty good default.
var port = process.env.PORT || 1337;
app.listen(port);
console.log("The server is now listening on port %s", port);
