const express = require('express');

const app = express();

app.use(require('body-parser').json());
app.use(require('cors'));

app.get('/', (req, res) => {
  res.send('this is working');
});

app.listen('3000', () => console.log('server is running on port 3000'));
