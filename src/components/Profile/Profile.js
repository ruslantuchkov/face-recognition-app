import React, { Component } from 'react';
import axios from 'axios';
import './Profile.css';

class Profile extends Component {
  state = {
    formData: {
      name: this.props.user.name,
      age: this.props.user.age || '',
      pet: this.props.user.pet || ''
    },
    formValid: {
      name: true,
      age: true,
      pet: true
    }
  };

  onProfileUpdate = () => {
    axios
      .post(`/api/profile/${this.props.user.id}`, {
        input: { ...this.state.formData }
      })
      .then(resp => {
        if (resp.data === 'success') {
          this.props.toggleModal();
          this.props.loadUser({ ...this.props.user, ...this.state.formData });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  onFormChange = ({ target: { name, value } }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value
      },
      formValid: {
        ...this.state.formValid,
        [name]: this.validate(name, value)
      }
    });
  };

  validate = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        return value ? true : false;
      case 'age':
        return !isNaN(+value) ? true : false;
      default:
        return true;
    }
  };

  render() {
    const { toggleModal, user } = this.props;
    const { name, age, pet } = this.state.formData;
    const {
      name: nameError,
      age: ageError,
      pet: petError
    } = this.state.formValid;

    return (
      <div className="profile-modal">
        <article className="br3 ba b--black-10 mv4 w-100 w-50-m w-25-l mw6 shadow-5 center bg-white">
          <main className="pa4 black-80 w-80">
            <img
              src="http://tachyons.io/img/logo.jpg"
              className="h3 w3 dib"
              alt="avatar"
            />
            <h1>{name}</h1>
            <h4>{`Images submitted: ${user.entries}`}</h4>
            <p>{`Member since: ${new Date(
              user.joined
            ).toLocaleDateString()}`}</p>
            <hr />
            <label className="mt2 fw6" htmlFor="user-name">
              Name:
            </label>
            <input
              onChange={this.onFormChange}
              value={name}
              type="text"
              name="name"
              className={`pa2 ba w-100${!nameError ? ` b--red` : ``}`}
            />
            <label className="mt2 fw6" htmlFor="user-age">
              Age:
            </label>
            <input
              onChange={this.onFormChange}
              type="text"
              name="age"
              className={`pa2 ba w-100${!ageError ? ` b--red` : ``}`}
              value={age}
            />
            <label className="mt2 fw6" htmlFor="user-pet">
              Favourite Pet:
            </label>
            <input
              onChange={this.onFormChange}
              type="text"
              name="pet"
              className={`pa2 ba w-100${!petError ? ` b--red` : ``}`}
              value={pet}
            />
            <div
              className="mt4"
              style={{ display: 'flex', justifyContent: 'space-evenly' }}
            >
              <button
                className="b pa2 grow pointer hover-white w-40 bg-light-blue b--black-20"
                onClick={() => this.onProfileUpdate()}
                disabled={Object.values(this.state.formValid).some(val => !val)}
              >
                Save
              </button>
              <button
                className="b pa2 grow pointer hover-white w-40 bg-light-red b--black-20"
                onClick={toggleModal}
              >
                Cancel
              </button>
            </div>
          </main>
          <div className="modal-close" onClick={toggleModal}>
            &times;
          </div>
        </article>
      </div>
    );
  }
}

export default Profile;
