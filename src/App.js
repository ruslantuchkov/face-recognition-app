import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Profile from './components/Profile/Profile';
import Signout from './components/Signout/Signout';
import axios from 'axios';
import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
};

const initialState = {
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '',
    age: '',
    pet: ''
  },
  input: '',
  imageURL: '',
  boxes: [],
  userLoading: false,
  isProfileOpen: false,
  error: null
};

class App extends Component {
  state = initialState;

  componentDidMount() {
    const token = sessionStorage.getItem('token');

    if (token) {
      this.setState({ userLoading: true });
      axios('/api/auth')
        .then(({ data }) => {
          this.loadUser(data[0]);
        })
        .catch(err => {
          console.log(err);
          this.setState({ userLoading: false });
        });
    }
  }

  calculateFaceLocation = data => {
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return data.outputs[0].data.regions.map(face => {
      const clarifaiFace = face.region_info.bounding_box;
      return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - clarifaiFace.right_col * width,
        bottomRow: height - clarifaiFace.bottom_row * height
      };
    });
  };

  displayFaceBox = boxes => {
    this.setState({ boxes, error: null });
  };

  onInputChange = value => this.setState({ input: value });

  onPictureSubmit = () => {
    this.setState({ imageURL: this.state.input });
    axios
      .post('/api/imageurl', { input: this.state.input })
      .then(({ data }) => {
        if (!data.outputs[0].data.regions) {
          return this.setState({ error: 'No faces here.' });
        }

        this.displayFaceBox(this.calculateFaceLocation(data));

        axios
          .put('/api/image', { id: this.state.user.id })
          .then(({ data }) =>
            this.setState({ user: { ...this.state.user, entries: data } })
          )
          .catch(console.log);
      })
      .catch(err => {
        if (err.response) {
          this.setState({
            error: `Incorrect image url or ${err.response.data}.`
          });
        } else {
          console.log(err);
        }
      });
  };

  loadUser = user => {
    this.setState({
      user,
      userLoading: false
    });
  };

  clearState = () => this.setState({ ...initialState });

  toggleProfile = () =>
    this.setState(prevState => ({
      isProfileOpen: !prevState.isProfileOpen
    }));

  render() {
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        {this.state.userLoading ? (
          <div>Loading...</div>
        ) : (
          <Navigation
            isSignedIn={!!this.state.user.id}
            toggleModal={this.toggleProfile}
          />
        )}
        <Logo />
        {this.state.isProfileOpen && (
          <Profile
            isProfileOpen={this.state.isProfileOpen}
            toggleModal={this.toggleProfile}
            user={this.state.user}
            loadUser={this.loadUser}
          />
        )}

        {this.state.userLoading ? (
          <div>Loading...</div>
        ) : (
          <Switch>
            <Route
              path="/signin"
              render={props => {
                if (this.state.user.id) return <Redirect to="/home" />;
                return <Signin loadUser={this.loadUser} {...props} />;
              }}
            />
            <Route
              path="/register"
              render={props => <Register loadUser={this.loadUser} {...props} />}
            />
            <Route
              path="/home"
              render={props => {
                if (!this.state.user.id) return <Redirect to="/signin" />;
                return (
                  <div>
                    <Rank
                      name={this.state.user.name}
                      entries={this.state.user.entries}
                    />
                    <ImageLinkForm
                      onInputChange={this.onInputChange}
                      onPictureSubmit={this.onPictureSubmit}
                    />
                    <FaceRecognition
                      boxes={this.state.boxes}
                      imageURL={this.state.imageURL}
                    />
                    <p style={{ color: '#d40056' }}>{this.state.error}</p>
                  </div>
                );
              }}
            />
            <Route
              path="/signout"
              render={() => <Signout clearState={this.clearState} />}
            />
            <Route
              path="/"
              render={() =>
                this.state.user.id ? (
                  <Redirect to="/home" />
                ) : (
                  <Redirect to="/signin" />
                )
              }
            />
          </Switch>
        )}
      </div>
    );
  }
}

export default App;
