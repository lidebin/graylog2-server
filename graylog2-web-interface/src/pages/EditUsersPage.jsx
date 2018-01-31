import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';
import Reflux from 'reflux';

import StoreProvider from 'injection/StoreProvider';
const UsersStore = StoreProvider.getStore('Users');
const StartpageStore = StoreProvider.getStore('Startpage');

import { DocumentTitle, PageHeader, Spinner } from 'components/common';
import UserForm from 'components/users/UserForm';

import UserPreferencesButton from 'components/users/UserPreferencesButton';
import PermissionsMixin from 'util/PermissionsMixin';

const CurrentUserStore = StoreProvider.getStore('CurrentUser');

const EditUsersPage = React.createClass({
  mixins: [Reflux.connect(CurrentUserStore), PermissionsMixin],

  propTypes: {
    params: PropTypes.object.isRequired,
  },
  getInitialState() {
    return {
      user: undefined,
      tokens: [],
    };
  },
  componentDidMount() {
    this._loadUser(this.props.params.username);
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.params.username !== nextProps.params.username) {
      this._loadUser(nextProps.params.username);
    }
  },

  _loadUser(username) {
    UsersStore.load(username).then((user) => {
      this.setState({ user: user });
    });
    this._loadTokens(username);
  },

  _loadTokens(username) {
    if (this._canListTokens(username)) {
      UsersStore.loadTokens(username).then((tokens) => {
        this.setState({ tokens: tokens });
      });
    } else {
      this.setState({ tokens: [] });
    }
  },

  _canListTokens(username) {
    return this.isPermitted(this.state.currentUser.permissions,
      [`users:tokenlist:${username}`]);
  },

  _deleteToken(token) {
    const promise = UsersStore.deleteToken(this.state.user.username, token);
    promise.then(() => this._loadTokens(this.state.user.username));
  },

  _createToken(tokenName) {
    const promise = UsersStore.createToken(this.state.user.username, tokenName);
    promise.then(() => this._loadTokens(this.state.user.username));
  },

  _resetStartpage() {
    if (window.confirm('Are you sure you want to reset the start page?')) {
      const username = this.props.params.username;
      StartpageStore.set(username).then(() => this._loadUser(username));
    }
  },
  render() {
    if (!this.state.user) {
      return <Spinner />;
    }

    const user = this.state.user;
    let resetStartpageButton;
    if (!user.read_only && user.startpage !== null && Object.keys(user.startpage).length > 0) {
      resetStartpageButton = <Button bsStyle="info" onClick={this._resetStartpage}>Reset custom startpage</Button>;
    }

    const userPreferencesButton = !user.read_only ?
      (<span id="react-user-preferences-button" data-user-name={this.props.params.username}>
        <UserPreferencesButton userName={user.username} />
      </span>)
      : null;

    return (
      <DocumentTitle title={`Edit user ${this.props.params.username}`}>
        <span>
          <PageHeader title={<span>Edit user <em>{this.props.params.username}</em></span>} subpage>
            <span>You can either change the details of a user here or set a new password.</span>
            {null}
            <div>
              {resetStartpageButton}{' '}
              {userPreferencesButton}
            </div>
          </PageHeader>

          <UserForm user={this.state.user}
                    tokens={this.state.tokens}
                    deleteToken={this._deleteToken}
                    createToken={this._createToken} />
        </span>
      </DocumentTitle>
    );
  },
});

export default EditUsersPage;
