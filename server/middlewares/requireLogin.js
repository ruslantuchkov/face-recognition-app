const jwt = require('jsonwebtoken');

module.exports = db => (req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, process.env.SECRET || 'secret', (err, { email }) => {
      if (err) return res.status(401).json({ error: 'incorrect token' });
      db('users')
        .where({ email })
        .then(user => {
          req.user = user;
          next();
        })
        .catch(err => {
          console.log(err);
          res.status(400).json('unable to get user');
        });
    });
  } else {
    return res.status(401).json({ error: 'You must log in!' });
  }
};
