import React, { PureComponent } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withModalMounter } from '/imports/ui/components/modal/service';
import EndMeetingConfirmationContainer from '/imports/ui/components/end-meeting-confirmation/container';
import { makeCall } from '/imports/ui/services/api';
import AboutContainer from '/imports/ui/components/about/container';
import SettingsMenuContainer from '/imports/ui/components/settings/container';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import FullscreenService from '../../fullscreen-button/service';

const intlMessages = defineMessages({
  optionsLabel: {
    id: 'app.navBar.settingsDropdown.optionsLabel',
    description: 'Options button label',
  },
  fullscreenLabel: {
    id: 'app.navBar.settingsDropdown.fullscreenLabel',
    description: 'Make fullscreen option label',
  },
  settingsLabel: {
    id: 'app.navBar.settingsDropdown.settingsLabel',
    description: 'Open settings option label',
  },
  aboutLabel: {
    id: 'app.navBar.settingsDropdown.aboutLabel',
    description: 'About option label',
  },
  aboutDesc: {
    id: 'app.navBar.settingsDropdown.aboutDesc',
    description: 'Describes about option',
  },
  leaveSessionLabel: {
    id: 'app.navBar.settingsDropdown.leaveSessionLabel',
    description: 'Leave session button label',
  },
  fullscreenDesc: {
    id: 'app.navBar.settingsDropdown.fullscreenDesc',
    description: 'Describes fullscreen option',
  },
  settingsDesc: {
    id: 'app.navBar.settingsDropdown.settingsDesc',
    description: 'Describes settings option',
  },
  leaveSessionDesc: {
    id: 'app.navBar.settingsDropdown.leaveSessionDesc',
    description: 'Describes leave session option',
  },
  exitFullscreenDesc: {
    id: 'app.navBar.settingsDropdown.exitFullscreenDesc',
    description: 'Describes exit fullscreen option',
  },
  exitFullscreenLabel: {
    id: 'app.navBar.settingsDropdown.exitFullscreenLabel',
    description: 'Exit fullscreen option label',
  },
  hotkeysLabel: {
    id: 'app.navBar.settingsDropdown.hotkeysLabel',
    description: 'Hotkeys options label',
  },
  hotkeysDesc: {
    id: 'app.navBar.settingsDropdown.hotkeysDesc',
    description: 'Describes hotkeys option',
  },
  helpLabel: {
    id: 'app.navBar.settingsDropdown.helpLabel',
    description: 'Help options label',
  },
  helpDesc: {
    id: 'app.navBar.settingsDropdown.helpDesc',
    description: 'Describes help option',
  },
  endMeetingLabel: {
    id: 'app.navBar.settingsDropdown.endMeetingLabel',
    description: 'End meeting options label',
  },
  endMeetingDesc: {
    id: 'app.navBar.settingsDropdown.endMeetingDesc',
    description: 'Describes settings option closing the current meeting',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  handleToggleFullscreen: PropTypes.func.isRequired,
  mountModal: PropTypes.func.isRequired,
  noIOSFullscreen: PropTypes.bool,
  amIModerator: PropTypes.bool,
  shortcuts: PropTypes.string,
  isBreakoutRoom: PropTypes.bool,
  isMeteorConnected: PropTypes.bool.isRequired,
};

const defaultProps = {
  noIOSFullscreen: true,
  amIModerator: false,
  shortcuts: '',
  isBreakoutRoom: false,
};

const ALLOW_FULLSCREEN = Meteor.settings.public.app.allowFullscreen;

class SettingsDropdown extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isSettingOpen: false,
      isFullscreen: false,
    };

    // Set the logout code to 680 because it's not a real code and can be matched on the other side
    this.LOGOUT_CODE = '680';

    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
    this.leaveSession = this.leaveSession.bind(this);
    this.onFullscreenChange = this.onFullscreenChange.bind(this);
  }

  componentDidMount() {
    document.documentElement.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  componentWillUnmount() {
    document.documentElement.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  onActionsShow() {
    this.setState({
      isSettingOpen: true,
    });
  }

  onActionsHide() {
    this.setState({
      isSettingOpen: false,
    });
  }

  onFullscreenChange() {
    const { isFullscreen } = this.state;
    const newIsFullscreen = FullscreenService.isFullScreen(document.documentElement);
    if (isFullscreen !== newIsFullscreen) {
      this.setState({ isFullscreen: newIsFullscreen });
    }
  }

  getFullscreenItem() {
    const {
      intl,
      noIOSFullscreen,
      handleToggleFullscreen,
    } = this.props;
    const { isFullscreen } = this.state;

    if (noIOSFullscreen || !ALLOW_FULLSCREEN) return null;

    let fullscreenLabel = intl.formatMessage(intlMessages.fullscreenLabel);
    let fullscreenIcon = (
      <i className="far fa-expand-wide mr-2" />
    );

    if (isFullscreen) {
      fullscreenLabel = intl.formatMessage(intlMessages.exitFullscreenLabel);
      fullscreenIcon = (
        <i className="far fa-compress-wide mr-2" />
      );
    }

    return (
      <a className="navbar-item" key="list-item-fullscreen" onClick={handleToggleFullscreen}>
        {fullscreenIcon}
        {fullscreenLabel}
      </a>
    );
  }

  leaveSession() {
    makeCall('userLeftMeeting');
    // we don't check askForFeedbackOnLogout here,
    // it is checked in meeting-ended component
    Session.set('codeError', this.LOGOUT_CODE);
    // mountModal(<MeetingEndedComponent code={LOGOUT_CODE} />);
  }

  renderMenuItems() {
    const {
      intl, mountModal, amIModerator, isBreakoutRoom, isMeteorConnected,
    } = this.props;

    const allowedToEndMeeting = amIModerator && !isBreakoutRoom;

    const {
      showHelpButton: helpButton,
      helpLink,
      allowLogout: allowLogoutSetting,
    } = Meteor.settings.public.app;

    const logoutOption = (
      <a className="navbar-item" key="list-item-logout" data-test="logout" onClick={() => this.leaveSession()}>
        <i className="far fa-sign-out mr-2" />
        {intl.formatMessage(intlMessages.leaveSessionLabel)}
      </a>
    );

    const shouldRenderLogoutOption = (isMeteorConnected && allowLogoutSetting)
      ? logoutOption
      : null;

    return _.compact([
      this.getFullscreenItem(),
      (<a className="navbar-item" key="list-item-settings" onClick={() => mountModal(<SettingsMenuContainer />)}>
        <i className="far fa-cogs mr-2" />
        {intl.formatMessage(intlMessages.settingsLabel)}
       </a>),
      (<a className="navbar-item" key="list-item-about" onClick={() => mountModal(<AboutContainer />)}>
        <i className="far fa-info-circle mr-2" />
        {intl.formatMessage(intlMessages.aboutLabel)}
      </a>),
      !helpButton ? null
        : (
          <a
            className="navbar-item"
            key="list-item-shortcuts"
            onClick={() => window.open(`${helpLink}`)}
          >
            <i className="far fa-question-circle mr-2" />
            {intl.formatMessage(intlMessages.hotkeysLabel)}
          </a>
        ),
      (isMeteorConnected ? <div className="navbar-divider" key={_.uniqueId('list-separator-')} /> : null),
      allowedToEndMeeting && isMeteorConnected
        ? (
          <a
            className="navbar-item"
            key="list-item-end-meeting"
            onClick={() => mountModal(<EndMeetingConfirmationContainer />)}
          >
            <i className="far fa-browser mr-2" />
            {intl.formatMessage(intlMessages.endMeetingLabel)}
          </a>
        )
        : null,
      shouldRenderLogoutOption,
    ]);
  }

  render() {
    const {
      shortcuts: OPEN_OPTIONS_AK,
      currentUser,
    } = this.props;
    console.log('currentUser:', currentUser);

    return (
      <li className="navbar-item has-dropdown is-hoverable">
        <a className="navbar-link">
          <figure className="image">
            <img className="is-rounded" src="img/prof3.png" />
          </figure>
        </a>
        <div className="navbar-dropdown is-right">
          {this.renderMenuItems()}
        </div>
      </li>
    );
  }
}

SettingsDropdown.propTypes = propTypes;
SettingsDropdown.defaultProps = defaultProps;
export default withShortcutHelper(withModalMounter(injectIntl(SettingsDropdown)), 'openOptions');
