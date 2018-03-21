const express = require('express');
const bcrypt = require('bcrypt');
const db = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'ruslantuchkov',
    password: '',
    database: 'smart-brain'
  }
});

const salt = bcrypt.genSaltSync(10);

const app = express();

app.use(require('body-parser').json());
app.use(require('cors')());

app.get('/', (req, res) => {
  res.send('this is working');
});

app.post('/signin', (req, res) => {
  const { email, password } = req.body;
  db
    .select('email', 'hash')
    .where({ email })
    .from('login')
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db('users')
          .where({ email })
          .then(user => res.json(user[0]))
          .catch(err => res.status(400).json('unable to get user'));
      } else {
        res.status(400).json('wrong credentials');
      }
    })
    .catch(err => res.status(400).json('wrong credentials'));
});

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
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

app.get('/profile/:id', (req, res) => {
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

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users')
    .where({ id })
    .increment('entries', 1)
    .returning('entries')
    .then(entries => res.json(entries[0]))
    .catch(err => res.status(400).json('unable to get entries'));
});

app.listen('3000', () => console.log('server is running on port 3000'));
