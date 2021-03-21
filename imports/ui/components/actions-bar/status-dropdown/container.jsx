import React from 'react';
import StatusDropdown from './component';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import UserListService from '/imports/ui/components/user-list/service';
import { injectIntl } from 'react-intl';
import Service from './service';

const StatusDropdownContainer = props => <StatusDropdown {...props} />;

export default withTracker(() => {
  const currentUser = Users.findOne({ userId: Auth.userID }, { fields: {} });
  const getAvailableActions = UserListService.getAvailableActions
  const voiceUser = UserListService.curatedVoiceUser(currentUser.userId);
  const isMeteorConnected = Meteor.status().connected;
  const getEmojiList = UserListService.getEmojiList();
  const setEmojiStatus = Service.setEmojiStatus;
  return {
    currentUser,
    getAvailableActions,
    voiceUser,
    isMeteorConnected,
    getEmojiList,
    setEmojiStatus
  }
})(injectIntl(StatusDropdownContainer))
