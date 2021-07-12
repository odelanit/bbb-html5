import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import UserListItemContainer from './user-list-item/container';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { setChatBox, setInviteBox, setPanelOpened } from '/imports/redux/actions';

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
    this.props.setPanelOpened(true)
    this.props.setChatBox(false)
    this.props.setInviteBox(true)
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

const mapStateToProps = state => ({
  isPanelOpened: state.panel.isPanelOpened,
  isChatBox: state.panel.isChatBox,
  isInviteBox: state.panel.isInviteBox,
});

export default connect(mapStateToProps, {
  setPanelOpened,
  setChatBox,
  setInviteBox
})(injectIntl(UserList));
