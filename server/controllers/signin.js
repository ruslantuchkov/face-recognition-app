const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = db => (req, res) => {
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
};
