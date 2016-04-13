var connect = require('connect');
var app = connect();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var storage = require('node-persist');
storage.initSync();

var emojinary = require('./emojinary');

app.use(function(req, res, next) {
  if (req.body.mention) {
    var message = {
      'text': "/add @emojinary to your thread. type 'play' for a new game"
    }
    res.end(JSON.stringify({'message': message}));
    return
  }

  if (req.body.delivery && req.body.delivery.message) {
    var message = req.body.delivery.message;
    var thread = req.body.delivery.thread;
    if (message.text.trim().toLowerCase() == "play") {
      var games = storage.getItem(thread.threadId) || [];
      games = games.filter(function(g) { g.user.ident != message.sender.ident });
      emojinary.aRandomMovie(function(movie) {
        games.push({
          'user': message.sender,
          'movie': movie,
        })
        storage.setItem(thread.threadId, games);
        var response = {
          'text': 'Your movie is "' + movie.title + '". Type it in emoji and see if your friends can guess it.'
        };
        res.end(JSON.stringify({'message': response}));
      })
    } else {
      var games = storage.getItem(thread.threadId) || [];
      var matches = games.filter(function(g) {
        return emojinary.fuzzyMatch(g.movie.title, message.text);
      });
      if (matches.length == 1) {
        var match = matches[0];
        games = games.filter(function(g) { return g != match });
        storage.setItem(thread.threadId, games);
        var message = {
          'text': message.sender.name + " got it! (" + match.user.name + "'s movie was " + match.movie.title + ")"
        };
        res.end(JSON.stringify({'message': message, 'all_participants': true}));
      }
    }
    res.end();
    return;
  }

  res.end("@emojinary");
});

var http = require('http');
http.createServer(app).listen(process.env.PORT || 3000);
