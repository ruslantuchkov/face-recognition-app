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
    password: '',
    email: '',
    entries: 0,
    joined: ''
  },
  input: '',
  imageURL: '',
  box: {},
  userLoading: false
};

const Signout = ({ clearState }) => {
  sessionStorage.removeItem('token');
  clearState();
  return <Redirect to="/signin" />;
};

class App extends Component {
  state = initialState;

  componentDidMount() {
    const token = sessionStorage.getItem('token');

    if (token) {
      this.setState({ userLoading: true });
      fetch('/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      })
        .then(response => response.json())
        .then(data => {
          this.loadUser(data[0]);
          this.setState({ userLoading: false });
        })
        .catch(err => this.setState({ userLoading: false }));
    }
  }

  calculateFaceLocation = data => {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height
    };
  };

  displayFaceBox = box => {
    this.setState({ box });
  };

  onInputChange = value => this.setState({ input: value });

  onPictureSubmit = () => {
    this.setState({ imageURL: this.state.input });

    fetch('/api/imageurl', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(res => res.json())
      .then(
        data => {
          if (data) {
            fetch('/api/image', {
              method: 'put',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: this.state.user.id
              })
            })
              .then(res => res.json())
              .then(count =>
                this.setState({ user: { ...this.state.user, entries: count } })
              )
              .catch(console.log);

            this.displayFaceBox(this.calculateFaceLocation(data));
          }
        },
        err => console.log(err)
      );
  };

  loadUser = ({ id, email, password = '', entries, name, joined }) =>
    this.setState({
      user: {
        id,
        email,
        password,
        entries,
        name,
        joined
      }
    });

  clearState = () => this.setState({ ...initialState });

  render() {
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <Navigation isSignedIn={!!this.state.user.id} />
        <Logo />

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
                      box={this.state.box}
                      imageURL={this.state.imageURL}
                    />
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
