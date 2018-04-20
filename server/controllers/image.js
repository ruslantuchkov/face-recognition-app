const Clarifai = require('clarifai');

const clarifaiApp = new Clarifai.App({
  apiKey: 'bd8130a0dd3a4c7a83409274157f700b'
});

const handleApiCall = (req, res) => {
  const { input } = req.body;
  clarifaiApp.models
    .predict(Clarifai.FACE_DETECT_MODEL, input)
    .then(data => res.json(data))
    .catch(err =>
      res.status(400).json({ status: 'error', message: 'unable work with api' })
    );
};

const handleImage = db => (req, res) => {
  const { id } = req.body;
  db('users')
    .where({ id })
    .increment('entries', 1)
    .returning('entries')
    .then(entries => res.json(entries[0]))
    .catch(err => res.status(400).json('unable to get entries'));
};

module.exports = {
  handleApiCall,
  handleImage
};
