const express = require('express');
const bcrypt = require('bcrypt');
const Clarifai = require('clarifai');
const path = require('path');
const jwt = require('jsonwebtoken');

let connection;
if (process.env.NODE_ENV === 'production') {
  connection = {
    connectionString: process.env.DATABASE_URL,
    ssl: true
  };
} else {
  connection = {
    host: '127.0.0.1',
    user: '',
    password: '',
    database: 'smart-brain'
  };
}
const db = require('knex')({
  client: 'pg',
  connection
});

const clarifaiApp = new Clarifai.App({
  apiKey: 'bd8130a0dd3a4c7a83409274157f700b'
});

const salt = bcrypt.genSaltSync(10);

const app = express();

app.use(require('body-parser').json());

app.post('/api/signin', (req, res) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, process.env.SECRET || 'secret', (err, { email }) => {
      if (err) return res.status(400).json('incorrect token');
      db('users')
        .where({ email })
        .then(user => {
          res.json(user);
        })
        .catch(err => {
          console.log(err);
          res.status(400).json('unable to get user');
        });
    });
  } else {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json('incorrect form submission');
    }
    db
      .select('email', 'hash')
      .where({ email })
      .from('login')
      .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].hash);

        if (isValid) {
          return db('users')
            .where({ email })
            .then(user => {
              user[0].token = jwt.sign(
                { email },
                process.env.SECRET || 'secret',
                {
                  expiresIn: '2 days'
                }
              );
              res.json(user[0]);
            })
            .catch(err => {
              console.log(err);
              res.status(400).json('unable to get user');
            });
        } else {
          res.status(400).json('wrong credentials');
        }
      })
      .catch(err => res.status(400).json('wrong credentials'));
  }
});

app.post('/api/register', (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect from submission');
  }
  const hash = bcrypt.hashSync(password, salt);
  db.transaction(trx => {
    trx
      .insert({ hash, email })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .insert({ email: loginEmail[0], name, joined: new Date() })
          .returning('*')
          .then(user => res.json(user[0]))
          .catch(err => res.status(400).json('unable to register'));
      })
      .then(trx.commit)
      .catch(trx.rollback);
  });
});

app.get('/api/profile/:id', (req, res) => {
  const { id } = req.params;
  db('users')
    .where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('error getting user');
      }
    })
    .catch(err => res.status(400).json('not found'));
});

app.post('/api/profile/:id', (req, res) => {
  const { id } = req.params;
  const { name, age = '', pet = '' } = req.body;

  if (!name) {
    return res.status(400).json('incorrect from submission');
  }

  db('users')
    .where({ id })
    .update({ name })
    // .returning('*')
    .then(data => {
      res.json('success');
    })
    .catch(err => {
      console.log(err);
      res.status(400).json('not found');
    });
});

app.put('/api/image', (req, res) => {
  const { id } = req.body;
  db('users')
    .where({ id })
    .increment('entries', 1)
    .returning('entries')
    .then(entries => res.json(entries[0]))
    .catch(err => res.status(400).json('unable to get entries'));
});

app.post('/api/imageurl', (req, res) => {
  const { input } = req.body;
  clarifaiApp.models
    .predict(Clarifai.FACE_DETECT_MODEL, input)
    .then(data => res.json(data))
    .catch(err => res.status(400).json('unable work with api'));
});

if (process.env.NODE_ENV === 'production') {
  app.use(
    '/static',
    express.static(path.resolve(__dirname, '..', 'build', 'static'))
  );

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`server is running on port ${port}`));
