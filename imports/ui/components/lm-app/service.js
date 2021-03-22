import Breakouts from '/imports/api/breakouts';
import Meetings from '/imports/api/meetings';
import Settings from '/imports/ui/services/settings';
import Auth from '/imports/ui/services/auth/index';
import Users from "/imports/api/users";

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const getFontSize = () => {
    const applicationSettings = Settings.application;
    return applicationSettings ? applicationSettings.fontSize : '16px';
};

const getBreakoutRooms = () => Breakouts.find().fetch();

function meetingIsBreakout() {
    const meeting = Meetings.findOne({meetingId: Auth.meetingID},
        {fields: {'meetingProp.isBreakout': 1}});
    return (meeting && meeting.meetingProp.isBreakout);
}

const validIOSVersion = () => {
    const SUPPORTED_OS_VERSION = 12.2;
    const iosMatch = navigator.userAgent.match(/OS (\d+)_(\d+)/);
    if (iosMatch) {
        const versionNumber = iosMatch[0].split(' ')[1].replace('_', '.');
        const isInvalid = parseFloat(versionNumber) < SUPPORTED_OS_VERSION;
        if (isInvalid) return false;
    }
    return true;
};

const amIModerator = () => Users.findOne({userId: Auth.userID},
    {fields: {role: 1}}).role === ROLE_MODERATOR

export {
    getFontSize,
    meetingIsBreakout,
    getBreakoutRooms,
    validIOSVersion,
    amIModerator
};
