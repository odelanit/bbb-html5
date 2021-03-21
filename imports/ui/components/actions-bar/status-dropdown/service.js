import Auth from '/imports/ui/services/auth';
import { EMOJI_STATUSES } from '/imports/utils/statuses';
import { makeCall } from '/imports/ui/services/api';

const setEmojiStatus = (userId, emoji) => {
  const statusAvailable = (Object.keys(EMOJI_STATUSES)
    .includes(emoji));

  return statusAvailable
    ? makeCall('setEmojiStatus', Auth.userID, emoji)
    : makeCall('setEmojiStatus', userId, 'none');
};


export default {
  setEmojiStatus,
};
