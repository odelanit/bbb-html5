import React from 'react'
import Invite from './component';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import Meetings from "/imports/api/meetings";

const InviteContainer = props => <Invite {...props} />;

export default withTracker(() => {
  const currentUser = Users.findOne({ userId: Auth.userID }, { fields: {} });
  const currentMeeting = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: {meetingProp: 1} });
  const {meetingProp} = currentMeeting
  return {
    currentUser,
    currentMeeting,
    meetingProp
  }
})(injectIntl(InviteContainer))
