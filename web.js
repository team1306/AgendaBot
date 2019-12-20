var redis   = require('redis');
var client  = redis.createClient();
var http    = require('http');
var async   = require('async');
var l       = require('@samr28/log');
const config= require("./config");
l.on();
l.setColors({
  web: "magenta"
});

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
}).listen(81);

function buildHtml(cb) {
  var header = '';
  var body = '';

  header += '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">';

  body += '<nav class="navbar navbar-light bg-light"> <span class="navbar-brand mb-0 h1">Agenda</span> </nav>';

  body += '<div class="container">';

  for (var i = 1; i <= data.length; i++) {
    let color;
    if (data[i-1].color === 'good') {
      color = 'success';
    } else {
      color = data[i-1].color;
    }
    body += '<div class="alert alert-' + color + ' alert-dismissible fade show" role="alert" style="overflow:auto;">';
    if(config.DISPLAY_INDEX){
      body += i + '. ';
    }
    body += data[i - 1].value;
    if (config.DISPLAY_DUE && data[i - 1].dueDate) {
      body += "<span class='text-right float-right' style='margin-right:2rem'>DUE: " + data[i - 1].dueDate.month + "/" + data[i - 1].dueDate.day + "</span>";
      body += '<br>';
    }
    if (config.DISPLAY_ASSIGNED && data[i - 1].assignee) {
      body += "<span class='text-right float-right' style='margin-right:2rem'>Assigned: " + data[i - 1].assignee + "</span>";
    }
    body += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
    body += '</div>';
  }
  body += "<p style='margin-top:1em;'> New Business?</p>";
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
  l.log('Connected to Redis!', "web");
});

client.exists('hubot:storage', function(err, reply) {
  if (reply === 1) {
    l.log('Found Data', "web");
  } else {
    l.log('No Data Found', "web");
  }
});
