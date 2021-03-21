import React from 'react'
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import styles from './styles.scss'
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

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
