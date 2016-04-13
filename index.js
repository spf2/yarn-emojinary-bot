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
    var command = message.text.trim().toLowerCase();
    if (command == "play" || command == "skip") {
      var games = storage.getItem(thread.threadId) || [];
      var prevMovie;
      games = games.filter(function(g) {
        if (g.user.ident == message.sender.ident) {
          prevMovie = g.movie;
          return false;
        }
        return true;
      });
      emojinary.aRandomMovie(function(movie) {
        games.push({
          'user': message.sender,
          'movie': movie,
        })
        storage.setItem(thread.threadId, games);
        var text;
        if (prevMovie) {
          text = 'Skipped "' + prevMovie.title + '". Your movie is now "' + movie.title + '".'
        } else {
          text = 'Your movie is "' + movie.title + '". Type it in emoji and see if your friends can guess it, or type skip for a different movie.'
        }
        res.end(JSON.stringify({'message': {'text': text}}));
      })
      return;
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
