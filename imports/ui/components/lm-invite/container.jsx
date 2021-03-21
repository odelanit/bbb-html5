import React from 'react'
import Invite from './component';
import { withTracker } from 'meteor/react-meteor-data';
import { injectIntl } from 'react-intl';

const InviteContainer = props => <Invite {...props} />;

export default withTracker(() => {
  return {}
})(injectIntl(InviteContainer))
