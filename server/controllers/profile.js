const handleProfileGet = db => (req, res) => {
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
};

const handleProfileUpdate = db => (req, res) => {
  const { id } = req.params;
  const { input } = req.body;

  if (!input.name) {
    return res.status(400).json('incorrect from submission');
  }

  db('users')
    .where({ id })
    .update({ name: input.name })
    .then(() => {
      res.json('success');
    })
    .catch(err => {
      console.log(err);
      res.status(400).json('not found');
    });
};

module.exports = {
  handleProfileGet,
  handleProfileUpdate
};
