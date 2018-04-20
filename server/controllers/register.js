const bcrypt = require('bcrypt');

module.exports = db => (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json('incorrect from submission');
  }
  const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

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
};
