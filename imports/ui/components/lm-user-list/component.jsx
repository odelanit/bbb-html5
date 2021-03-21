import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import UserListItemContainer from './user-list-item/container';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const propTypes = {
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  requestUserInformation: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
};

class UserList extends Component {
  handleInviteClicked = () => {

  };

  render() {
    const {
      compact,
      setEmojiStatus,
      users,
      requestUserInformation,
      currentUser,
      meetingIsBreakout,
    } = this.props;
    return (
      <div className="meeting-c">
        {currentUser.role === ROLE_MODERATOR && (
          <figure className="image is-44x44" onClick={this.handleInviteClicked}>
            <img src="img/TeamAdd.png"/>
          </figure>
        )}
        {
          // users.map((user, index) => (
          //   <figure className="image is-44x44 avatar" key={index}>
          //     <img src="img/profile-pic.jpg" className="is-rounded"/>
          //   </figure>
          // ))
          users.map((u, index) => (
            <UserListItemContainer
              {...{
                compact,
                setEmojiStatus,
                requestUserInformation,
                currentUser,
                meetingIsBreakout,
              }}
              user={u}
              key={index}
            />
          ))
        }
      </div>
    );
  }
}

UserList.propTypes = propTypes;
UserList.defaultProps = defaultProps;

export default injectIntl(UserList);
