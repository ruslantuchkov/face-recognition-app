const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const requireLogin = require('./middlewares/requireLogin');

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

const app = express();

app.use(require('body-parser').json());

app.get('/api/auth', requireLogin(db), (req, res) => {
  res.json(req.user);
});

app.post('/api/signin', require('./controllers/signin')(db));

app.post('/api/register', require('./controllers/register')(db));

app.get(
  '/api/profile/:id',
  requireLogin(db),
  require('./controllers/profile').handleProfileGet(db)
);

app.post(
  '/api/profile/:id',
  requireLogin(db),
  require('./controllers/profile').handleProfileUpdate(db)
);

app.put(
  '/api/image',
  requireLogin(db),
  require('./controllers/image').handleImage(db)
);

app.post(
  '/api/imageurl',
  requireLogin(db),
  require('./controllers/image').handleApiCall
);

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
