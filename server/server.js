require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');
var {Councilman} = require('./models/councilman');
var {allowCrossDomain} = require('./middleware/allowCrossDomain');

var app = express();
const port = process.env.PORT;
app.use(bodyParser.json());
app.use(allowCrossDomain);

app.post('/councilmen', (req, res) => {
  var councilman = new Councilman({
    name: req.body.name,
    party: req.body.party,
    is_present: req.body.party
  });

  councilman.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/councilmen', (req, res) => {
  Councilman.find().sort({name: 'asc'}).then((councilmen) => {
    res.send({councilmen});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/councilmen/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Councilman.findById({
    _id: id
  }).then((councilman) => {
    if (!councilman) {
      return res.status(404).send();
    }

    res.send({councilman});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/councilmen/:id', (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['name', 'party', 'is_present']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Councilman.findOneAndUpdate({_id: id}, {$set: body}, {new: true}).then((councilman) => {
    if (!councilman) {
      return res.status(404).send();
    }

    res.send({councilman});
  }).catch((e) => {
    res.status(400).send();
  })
});

app.delete('/councilmen/:id', (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Councilman.findOneAndRemove({
    _id: id
  }).then((councilman) => {
    if (!councilman) {
      return res.status(404).send();
    }

    res.send({councilman});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
