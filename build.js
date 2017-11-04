/**
 *   Compile JS files using Closure-Compiler service
 */

/*jshint
  node: true
*/

var https       = require('https');
var fs          = require('fs');
var path        = require('path');
var querystring = require('querystring');

var hashes = ['watchem.js'];

var dir = __dirname;
var dist = dir;
// var packo = JSON.parse(fs.readFileSync(path.join(dir, 'package.json')));
// var version = packo.version;

if ( !fs.existsSync(dist) ) {
    fs.mkdir(dist);
}

hashes.forEach(function (filename) {
    compileFile(filename, function (err, data) {
        if (err) {
            return console.error(err);
        }
        if ( data ) {
            var _filename = path.join(dist, filename.replace(/\.js$/, '.min.js'));
            fs.writeFile(_filename, data.trim(), function (err) {
                if (err) throw err;
                console.log("\x1b[32m%s\x1b[0m", _filename);
            });
        }
    });
});

// Helpers
function compileFile(filename, cb) {
    fs.readFile(
      filename
      , { encoding: 'utf-8' }
      , function (err, data) { err ? cb(err) : compile(data, cb); }
    );
}

function compile(script, cb) {
    var options = {
        output_info: 'compiled_code'
      , output_format: 'text'
      , compilation_level: 'SIMPLE_OPTIMIZATIONS'
      , warning_level: 'QUIET'
      , js_code: script
    };

    var data = querystring.stringify(options);

    var req = https.request({
      hostname: 'closure-compiler.appspot.com'
      , port: 443
      , path: '/compile'
      , method: 'POST'
      , headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data)
      }
    }, function(res) {
      // console.log('STATUS: ' + res.statusCode);
      var body = [];
      res.setEncoding('utf8');
      res.on('data', function (chunk) { body.push(chunk); });
      res.on('end', function () { cb(null, body = body.join(''), res); });
    });

    req.on('error', cb);

    req.write(data);
    req.end();
}
