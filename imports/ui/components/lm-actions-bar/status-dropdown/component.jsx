import React from 'react'
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import styles from './styles.scss'
import { defineMessages } from 'react-intl';
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const messages = defineMessages({
  ClearStatusLabel: {
    id: 'app.userList.menu.clearStatus.label',
    description: 'Clear the emoji status of this user',
  },
})

class StatusDropdown extends React.Component {

  makeDropdownItem = (key, label, onClick, icon = null, iconRight = null) => {
    const { getEmoji } = this.props;
    return (
      <DropdownListItem
        {...{
          key,
          label,
          onClick,
          icon,
          iconRight,
        }}
        className={key === getEmoji ? `${styles.emojiSelected} dropdown-item` : 'dropdown-item'}
        data-test={key}
      />
    );
  }

  onActionsHide = (callback) => {
    if (callback) {
      return callback;
    }
  }

  getActions = () => {
    const {
      isMeteorConnected,
      getAvailableActions,
      currentUser,
      meetingIsBreakout,
      voiceUser,
      getEmojiList,
      setEmojiStatus,
      intl
    } = this.props
    const amIModerator = currentUser.role === ROLE_MODERATOR;
    const actionPermissions = getAvailableActions(amIModerator, meetingIsBreakout, currentUser, voiceUser);

    const {
      allowedToChangeStatus,
      allowedToResetStatus,
    } = actionPermissions;

    let actions = []
    if (allowedToChangeStatus && isMeteorConnected) {
      const statuses = Object.keys(getEmojiList);
      statuses.map(status => actions.push(this.makeDropdownItem(
        status,
        intl.formatMessage({ id: `app.actionsBar.emojiMenu.${status}Label` }),
        () => {
          setEmojiStatus(currentUser.userId, status);
        },
        getEmojiList[status],
      )));
    }
    if (allowedToResetStatus && currentUser.emoji !== 'none' && isMeteorConnected) {
      actions.push(this.makeDropdownItem(
        'clearStatus',
        intl.formatMessage(messages.ClearStatusLabel),
        () => this.onActionsHide(setEmojiStatus(currentUser.userId, 'none')),
        'clear_status',
      ));
    }
    return actions
  }

  render() {
    const actions = this.getActions()
    if (!actions.length) return null
    return (
      <div className="dropdown is-up">
        <div className="dropdown-trigger">
          <figure className="image is-44x44">
            <img src="img/Hand.png" alt=""/>
          </figure>
        </div>
        <div className="dropdown-menu">
          <ul className="dropdown-content">
            {actions}
          </ul>
        </div>
      </div>
    );
  }
}

export default StatusDropdown
