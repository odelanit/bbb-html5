import React from 'react'
import Invite from './component';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';

const InviteContainer = props => <Invite {...props} />;

export default withTracker(() => {
  const currentUser = Users.findOne({ userId: Auth.userID }, { fields: {} });
  return {
    currentUser
  }
})(injectIntl(InviteContainer))
