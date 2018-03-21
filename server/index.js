const express = require('express');
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'ruslantuchkov',
    password: '',
    database: 'smart-brain'
  }
});

console.log(knex.select('*').from('users'));

const app = express();

app.use(require('body-parser').json());
app.use(require('cors'));

app.get('/', (req, res) => {
  res.send('this is working');
});

app.listen('3000', () => console.log('server is running on port 3000'));
