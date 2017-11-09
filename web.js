var redis = require('redis');
var client = redis.createClient();
var http = require('http');
var async = require('async');

var data;
var agenda;
var html;

http.createServer(function (req, res) {
  async.series([
    getData,
    buildHtml,
    function(cb) {
      displayPage(res, cb);
    }
  ]);
}).listen(8080);

function buildHtml(cb) {
  var header = '';
  var body = '';

  header += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">';

  body += '<div class="container">';

  for (var i = 1; i <= data.length; i++) {
    body += '<div class="alert alert-' + data[i-1].color + ' alert-dismissible fade show" role="alert">';
    body += i + '. ' + data[i-1].value + '<br>';
    body += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
    body += '</div>';
  }

  body += '</div>';

  body += `<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js" integrity="sha384-vFJXuSJphROIrBnz7yo7oB41mKfc8JzQZiCq4NCceLEaO4IHwicKwpJf9c9IpFgh" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js" integrity="sha384-alpBpkh1PFOepccYVYDB4do5UnbKysX5WZXm3XxPqe5iKTfUKjNkCk9SaVuEZflJ" crossorigin="anonymous"></script>`;
  html = '<!DOCTYPE html><html><header>' + header + '</header><body>' + body + '</body></html>';
  return cb();
}

function displayPage(res, cb) {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': html.length,
    'Expires': new Date().toUTCString()
  });
  res.end(html);
}

function getData(cb) {
  client.get('hubot:storage', function(err, reply) {
    data = JSON.parse(reply);
    data = data._private.agenda;
    return cb();
  });
}


client.on('connect', function() {
    console.log('Web Connected to Redis!');
});

client.exists('hubot:storage', function(err, reply) {
    if (reply === 1) {
        console.log('Found Data');
    } else {
        console.log('No Data Found');
    }
});
