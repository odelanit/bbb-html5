import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Modal from 'react-modal';
import browser from 'browser-detect';
import { connect } from 'react-redux';
import PanelManager from '/imports/ui/components/panel-manager/component';
import PollingContainer from '/imports/ui/components/polling/container';
import logger from '/imports/startup/client/logger';
import ActivityCheckContainer from '/imports/ui/components/activity-check/container';
import UserInfoContainer from '/imports/ui/components/user-info/container';
import BreakoutRoomInvitation from '/imports/ui/components/breakout-room/invitation/container';
import ToastContainer from '../toast/container';
import ModalContainer from '../modal/container';
import NotificationsBarContainer from '../notifications-bar/container';
import AudioContainer from '../audio/container';
import ChatAlertContainer from '../chat/alert/container';
import BannerBarContainer from '/imports/ui/components/banner-bar/container';
import WaitingNotifierContainer from '/imports/ui/components/waiting-users/alert/container';
import LockNotifier from '/imports/ui/components/lock-viewers/notify/container';
import PingPongContainer from '/imports/ui/components/ping-pong/container';
import MediaService from '/imports/ui/components/media/service';
import ManyWebcamsNotifier from '/imports/ui/components/video-provider/many-users-notify/container';
import { styles } from './styles';
import { setChatBox, setInviteBox, setPanelOpened } from '/imports/redux/actions';

const MOBILE_MEDIA = 'only screen and (max-width: 40em)';
const APP_CONFIG = Meteor.settings.public.app;
const DESKTOP_FONT_SIZE = APP_CONFIG.desktopFontSize;
const MOBILE_FONT_SIZE = APP_CONFIG.mobileFontSize;
const ENABLE_NETWORK_MONITORING = Meteor.settings.public.networkMonitoring.enableNetworkMonitoring;

const intlMessages = defineMessages({
  userListLabel: {
    id: 'app.userList.label',
    description: 'Aria-label for Userlist Nav',
  },
  chatLabel: {
    id: 'app.chat.label',
    description: 'Aria-label for Chat Section',
  },
  mediaLabel: {
    id: 'app.media.label',
    description: 'Aria-label for Media Section',
  },
  actionsBarLabel: {
    id: 'app.actionsBar.label',
    description: 'Aria-label for ActionsBar Section',
  },
  iOSWarning: {
    id: 'app.iOSWarning.label',
    description: 'message indicating to upgrade ios version',
  },
  clearedEmoji: {
    id: 'app.toast.clearedEmoji.label',
    description: 'message for cleared emoji status',
  },
  setEmoji: {
    id: 'app.toast.setEmoji.label',
    description: 'message when a user emoji has been set',
  },
  meetingMuteOn: {
    id: 'app.toast.meetingMuteOn.label',
    description: 'message used when meeting has been muted',
  },
  meetingMuteOff: {
    id: 'app.toast.meetingMuteOff.label',
    description: 'message used when meeting has been unmuted',
  },
  pollPublishedLabel: {
    id: 'app.whiteboard.annotations.poll',
    description: 'message displayed when a poll is published',
  },
});

const propTypes = {
  navbar: PropTypes.element,
  sidebar: PropTypes.element,
  media: PropTypes.element,
  actionsbar: PropTypes.element,
  captions: PropTypes.element,
  locale: PropTypes.string,
  intl: intlShape.isRequired,
};

const defaultProps = {
  navbar: null,
  sidebar: null,
  media: null,
  actionsbar: null,
  captions: null,
  locale: 'en',
};

const LAYERED_BREAKPOINT = 640;
const isLayeredView = window.matchMedia(`(max-width: ${LAYERED_BREAKPOINT}px)`);

class App extends Component {
  constructor() {
    super();
    this.state = {
      enableResize: !window.matchMedia(MOBILE_MEDIA).matches,
    };

    this.handleWindowResize = throttle(this.handleWindowResize).bind(this);
    this.shouldAriaHide = this.shouldAriaHide.bind(this);
  }

  componentDidMount() {
    const {
      locale, notify, intl, validIOSVersion, startBandwidthMonitoring, handleNetworkConnection,
    } = this.props;
    const BROWSER_RESULTS = browser();
    const isMobileBrowser = BROWSER_RESULTS.mobile || BROWSER_RESULTS.os.includes('Android');

    MediaService.setSwapLayout();
    Modal.setAppElement('#app');
    document.getElementsByTagName('html')[0].lang = locale;
    // document.getElementsByTagName('html')[0].style.fontSize = isMobileBrowser ? MOBILE_FONT_SIZE : DESKTOP_FONT_SIZE;

    const body = document.getElementsByTagName('body')[0];
    if (BROWSER_RESULTS && BROWSER_RESULTS.name) {
      body.classList.add(`browser-${BROWSER_RESULTS.name}`);
    }
    if (BROWSER_RESULTS && BROWSER_RESULTS.os) {
      body.classList.add(`os-${BROWSER_RESULTS.os.split(' ').shift().toLowerCase()}`);
    }

    if (!validIOSVersion()) {
      notify(
        intl.formatMessage(intlMessages.iOSWarning), 'error', 'warning',
      );
    }

    this.handleWindowResize();
    window.addEventListener('resize', this.handleWindowResize, false);
    window.ondragover = function (e) {
      e.preventDefault();
    };
    window.ondrop = function (e) {
      e.preventDefault();
    };

    if (ENABLE_NETWORK_MONITORING) {
      if (navigator.connection) {
        handleNetworkConnection();
        navigator.connection.addEventListener('change', handleNetworkConnection);
      }

      startBandwidthMonitoring();
    }

    logger.info({ logCode: 'app_component_componentdidmount' }, 'Client loaded successfully');
  }

  componentDidUpdate(prevProps) {
    const {
      meetingMuted, notify, currentUserEmoji, intl, hasPublishedPoll,
    } = this.props;

    if (prevProps.currentUserEmoji.status !== currentUserEmoji.status) {
      const formattedEmojiStatus = intl.formatMessage({ id: `app.actionsBar.emojiMenu.${currentUserEmoji.status}Label` })
                || currentUserEmoji.status;

      notify(
        currentUserEmoji.status === 'none'
          ? intl.formatMessage(intlMessages.clearedEmoji)
          : intl.formatMessage(intlMessages.setEmoji, ({ 0: formattedEmojiStatus })),
        'info',
        currentUserEmoji.status === 'none'
          ? 'clear_status'
          : 'user',
      );
    }
    if (!prevProps.meetingMuted && meetingMuted) {
      notify(
        intl.formatMessage(intlMessages.meetingMuteOn), 'info', 'mute',
      );
    }
    if (prevProps.meetingMuted && !meetingMuted) {
      notify(
        intl.formatMessage(intlMessages.meetingMuteOff), 'info', 'unmute',
      );
    }
    if (!prevProps.hasPublishedPoll && hasPublishedPoll) {
      notify(
        intl.formatMessage(intlMessages.pollPublishedLabel), 'info', 'polling',
      );
    }
  }

  componentWillUnmount() {
    const { handleNetworkConnection } = this.props;
    window.removeEventListener('resize', this.handleWindowResize, false);
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleNetworkConnection, false);
    }
  }

  handleWindowResize() {
    const { enableResize } = this.state;
    const shouldEnableResize = !window.matchMedia(MOBILE_MEDIA).matches;
    if (enableResize === shouldEnableResize) return;

    this.setState({ enableResize: shouldEnableResize });
  }

  shouldAriaHide() {
    const { openPanel, isPhone } = this.props;
    return openPanel !== '' && (isPhone || isLayeredView.matches);
  }

  renderPanel() {
    const { enableResize } = this.state;
    const { openPanel, isRTL } = this.props;

    return (
      <PanelManager
        {...{
          openPanel,
          enableResize,
          isRTL,
        }}
        shouldAriaHide={this.shouldAriaHide}
      />
    );
  }

  renderNavBar() {
    const { navbar } = this.props;

    if (!navbar) return null;

    return (
            <>
              {navbar}
            </>
    );
  }

  renderSidebar() {
    const { sidebar } = this.props;

    if (!sidebar) return null;

    return (
      <aside className={styles.sidebar}>
        {sidebar}
      </aside>
    );
  }

  renderCaptions() {
    const { captions } = this.props;

    if (!captions) return null;

    return (
      <div className={styles.captionsWrapper}>
        {captions}
      </div>
    );
  }

  renderMedia() {
    const {
      media,
      intl,
    } = this.props;

    if (!media) return null;

    return (
      <section
        style={{ height: '100%' }}
        aria-label={intl.formatMessage(intlMessages.mediaLabel)}
        aria-hidden={this.shouldAriaHide()}
      >
        {media}
        {this.renderCaptions()}
      </section>
    );
  }

  renderActionsBar() {
    const {
      actionsbar,
      intl,
    } = this.props;

    if (!actionsbar) return null;

    return (
            <>
              {actionsbar}
            </>
    );
  }

  renderActivityCheck() {
    const { User } = this.props;

    const { inactivityCheck, responseDelay } = User;

    return (inactivityCheck ? (
      <ActivityCheckContainer
        inactivityCheck={inactivityCheck}
        responseDelay={responseDelay}
      />) : null);
  }

  renderUserInformation() {
    const { UserInfo, User } = this.props;

    return (UserInfo.length > 0 ? (
      <UserInfoContainer
        UserInfo={UserInfo}
        requesterUserId={User.userId}
        meetingId={User.meetingId}
      />) : null);
  }

  render() {
    const {
      customStyle, customStyleUrl, openPanel, users,
    } = this.props;
    return (
      <main>
        {this.renderActivityCheck()}
        {this.renderUserInformation()}
        <BannerBarContainer />
        <NotificationsBarContainer />
        <div id="wrapper" className="wrapper">
          {this.renderNavBar()}
          <div className="container is-fluid main">
            <div className="columns" style={{ height: '100%' }}>
              <div
                className={this.props.isPanelOpened ? 'column is-three-quarters meeting-main' : 'column meeting-main'}
              >
                <div className="meeting-media" style={{ height: 'calc(100% - 122px)' }}>
                  {this.renderMedia()}
                </div>
                <div className="call-m py-5 px-3">
                  <div className="columns">
                    <div className="column">
                      <div className="meeting-actions">
                            <div className="px-4">9:28</div>
                            {this.renderActionsBar()}
                          </div>
                    </div>
                    <div className="column">
                      <div className="meeting-c">
                            <figure className="image is-44x44" onClick={this.handleInviteClicked}>
                                <img src="img/TeamAdd.png" />
                              </figure>
                            {
                                                    users.map((user, index) => (
                                                      <figure className="image is-44x44 avatar" key={index}>
                                                        <img src="img/profile-pic.jpg" className="is-rounded" />
                                                      </figure>
                                                    ))
                                                }
                          </div>
                    </div>
                  </div>
                </div>
              </div>
              {this.props.isPanelOpened && (
              <div className="column">
                <div className="meeting-sidebar">
                  {this.props.isChatBox && (
                                            <>
                                              <div className="px-4 py-5 ">
                                                <h3 className="mt-10">Meeting Chat</h3>
                                                <div className="media w-50 mb-3">
                                                  <img
                                                    src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
                                                    alt="user"
                                                    width="50"
                                                    className="rounded-circle"
                                                  />
                                                  <div className="media-body ml-3">
                                                    <div className="bg-light rounded py-2 px-3 mb-2">
                                                      <p className="text-small mb-0 text-muted">
Test which is
                                                                    a new approach
                                                                    all
                                                                    solutions
                                                      </p>
                                                    </div>
                                                    <p className="small text-muted">12:00 PM | Aug 13</p>
                                                  </div>
                                                </div>

                                                <div className="media w-50 ml-auto mb-3">
                                                  <div className="media-body">
                                                    <div className="bg-primary rounded py-2 px-3 mb-2">
                                                      <p className="text-small mb-0 text-white">
Test which is
                                                                    a new approach
                                                                    to have all
                                                                    solutions
                                                      </p>
                                                    </div>
                                                    <p className="small text-muted">12:00 PM | Aug 13</p>
                                                  </div>
                                                </div>

                                                <div className="media w-50 mb-3">
                                                  <img
                                                    src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
                                                    alt="user"
                                                    width="50"
                                                    className="rounded-circle"
                                                  />
                                                  <div className="media-body ml-3">
                                                    <div className="bg-light rounded py-2 px-3 mb-2">
                                                      <p className="text-small mb-0 text-muted">
Test, which is
                                                                    a new approach
                                                                    to have
                                                      </p>
                                                    </div>
                                                    <p className="small text-muted">12:00 PM | Aug 13</p>
                                                  </div>
                                                </div>

                                                <div className="media w-50 ml-auto mb-3">
                                                  <div className="media-body">
                                                    <div className="bg-primary rounded py-2 px-3 mb-2">
                                                      <p className="text-small mb-0 text-white">
Apollo
                                                                    University, Delhi,
                                                                    India Test
                                                      </p>
                                                    </div>
                                                    <p className="small text-muted">12:00 PM | Aug 13</p>
                                                  </div>
                                                </div>

                                                <div className="media w-50 mb-3">
                                                  <img
                                                    src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
                                                    alt="user"
                                                    width="50"
                                                    className="rounded-circle"
                                                  />
                                                  <div className="media-body ml-3">
                                                    <div className="bg-light rounded py-2 px-3 mb-2">
                                                      <p className="text-small mb-0 text-muted">
Test, which is
                                                                    a new
                                                                    approach
                                                      </p>
                                                    </div>
                                                    <p className="small text-muted">12:00 PM | Aug 13</p>
                                                  </div>
                                                </div>

                                                <div className="media w-50 ml-auto mb-3">
                                                  <div className="media-body">
                                                    <div className="bg-primary rounded py-2 px-3 mb-2">
                                                      <p className="text-small mb-0 text-white">
Apollo
                                                                    University, Delhi,
                                                                    India Test
                                                      </p>
                                                    </div>
                                                    <p className="small text-muted">12:00 PM | Aug 13</p>
                                                  </div>
                                                </div>

                                              </div>
                                              <form action="#" className="bg-light">
                                                <div className="input-group">
                                                  <input
                                                    type="text"
                                                    placeholder="Type a message"
                                                    aria-describedby="button-addon2"
                                                    className="form-control rounded-0 border-0 py-4 bg-light"
                                                  />
                                                  <div className="input-group-append">
                                                    <button
                                                      id="button-addon2"
                                                      type="submit"
                                                      className="btn btn-link"
                                                    >
                                                      <i className="fa fa-paper-plane" />
                                                    </button>
                                                  </div>
                                                </div>
                                              </form>
                                            </>
                  )}
                  {this.props.isInviteBox && (
                  <div className="px-4 py-5 chat-box chat-box-h bg-white">
                          <h3 className="mt-10">Invite People</h3>
                          <div className="input-group call-inv">
                            <div className="input-group-prepend">
                                  <div
                                    className="input-group-text bg-transparent border-right-0 call-sear"
                                  >
                                    <i className="fa fa-search" />
                                  </div>
                                </div>
                            <input
                                  className="form-control py-2 border-left-0 border call-invi"
                                  type="search"
                                  value="Invite someone"
                                  id="example-search-input"
                                />

                          </div>
                          <div className="media w-50 mb-3 call-in-p">
                            <img
                                  src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
                                  alt="user"
                                  width="50"
                                  className="rounded-circle"
                                />
                            <div className="media-body ml-3">
                                  <div className="rounded py-2 mb-2">

                                    <p className="small text-muted mr0">Julian Mendez</p>
                                    <div className="row">
                                          <div className="col-md-8">
                                            <p className="text-small mb-0 text-muted">
Sr. UX
                                                                        Designer, New York
                                                </p>
                                          </div>
                                          <div className="col-md-4">
                                            <input
                                                  type="checkbox"
                                                  name="vehicle3"
                                                  value="Boat"
                                                />
                                            <label htmlFor="vehicle3"> Invite</label>
                                          </div>
                                        </div>
                                  </div>

                                </div>
                          </div>

                          <div className="media w-50 mb-3 call-in-p">
                            <img
                                  src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
                                  alt="user"
                                  width="50"
                                  className="rounded-circle"
                                />
                            <div className="media-body ml-3">
                                  <div className="rounded py-2 mb-2">

                                    <p className="small text-muted mr0">Julian Mendez</p>
                                    <div className="row">
                                          <div className="col-md-8">
                                            <p className="text-small mb-0 text-muted">
Sr. UX
                                                                        Designer, New York
                                                </p>
                                          </div>
                                          <div className="col-md-4">
                                            <input
                                                  type="checkbox"
                                                  name="vehicle3"
                                                  value="Boat"
                                                />
                                            <label htmlFor="vehicle3"> Invite</label>
                                          </div>
                                        </div>
                                  </div>

                                </div>
                          </div>

                          <div className="media w-50 mb-3 call-in-p">
                            <img
                                  src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
                                  alt="user"
                                  width="50"
                                  className="rounded-circle"
                                />
                            <div className="media-body ml-3">
                                  <div className="rounded py-2 mb-2">

                                    <p className="small text-muted mr0">Julian Mendez</p>
                                    <div className="row">
                                          <div className="col-md-8">
                                            <p className="text-small mb-0 text-muted">
Sr. UX
                                                                        Designer, New York
                                                </p>
                                          </div>
                                          <div className="col-md-4">
                                            <input
                                                  type="checkbox"
                                                  name="vehicle3"
                                                  value="Boat"
                                                />
                                            <label htmlFor="vehicle3"> Invite</label>
                                          </div>
                                        </div>
                                  </div>

                                </div>
                          </div>

                          <div className="media w-50 mb-3 call-in-p">
                            <img
                                  src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
                                  alt="user"
                                  width="50"
                                  className="rounded-circle"
                                />
                            <div className="media-body ml-3">
                                  <div className="rounded py-2 mb-2">

                                    <p className="small text-muted mr0">Julian Mendez</p>
                                    <div className="row">
                                          <div className="col-md-8">
                                            <p className="text-small mb-0 text-muted">
Sr. UX
                                                                        Designer, New York
                                                </p>
                                          </div>
                                          <div className="col-md-4">
                                            <input
                                                  type="checkbox"
                                                  name="vehicle3"
                                                  value="Boat"
                                                />
                                            <label htmlFor="vehicle3"> Invite</label>
                                          </div>
                                        </div>
                                  </div>

                                </div>
                          </div>

                          <div className="media w-50 mb-3 call-in-p">
                            <img
                                  src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
                                  alt="user"
                                  width="50"
                                  className="rounded-circle"
                                />
                            <div className="media-body ml-3">
                                  <div className="rounded py-2 mb-2">

                                    <p className="small text-muted mr0">Julian Mendez</p>
                                    <div className="row">
                                          <div className="col-md-8">
                                            <p className="text-small mb-0 text-muted">
Sr. UX
                                                                        Designer, New York
                                                </p>
                                          </div>
                                          <div className="col-md-4">
                                            <input
                                                  type="checkbox"
                                                  name="vehicle3"
                                                  value="Boat"
                                                />
                                            <label htmlFor="vehicle3"> Invite</label>
                                          </div>
                                        </div>
                                  </div>

                                </div>
                          </div>

                          <div className="media w-50 mb-3 call-in-p">
                            <img
                                  src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
                                  alt="user"
                                  width="50"
                                  className="rounded-circle"
                                />
                            <div className="media-body ml-3">
                                  <div className="rounded py-2 mb-2">

                                    <p className="small text-muted mr0">Julian Mendez</p>
                                    <div className="row">
                                          <div className="col-md-8">
                                            <p className="text-small mb-0 text-muted">
Sr. UX
                                                                        Designer, New York
                                                </p>
                                          </div>
                                          <div className="col-md-4">
                                            <input
                                                  type="checkbox"
                                                  name="vehicle3"
                                                  value="Boat"
                                                />
                                            <label htmlFor="vehicle3"> Invite</label>
                                          </div>
                                        </div>
                                  </div>

                                </div>
                          </div>
                          <div className="media w-50 mb-3 call-in-p">
                            <img
                                  src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
                                  alt="user"
                                  width="50"
                                  className="rounded-circle"
                                />
                            <div className="media-body ml-3">
                                  <div className="rounded py-2 mb-2">

                                    <p className="small text-muted mr0">Julian Mendez</p>
                                    <div className="row">
                                          <div className="col-md-8">
                                            <p className="text-small mb-0 text-muted">
Sr. UX
                                                                        Designer, New York
                                                </p>
                                          </div>
                                          <div className="col-md-4">
                                            <input
                                                  type="checkbox"
                                                  name="vehicle3"
                                                  value="Boat"
                                                />
                                            <label htmlFor="vehicle3"> Invite</label>
                                          </div>
                                        </div>
                                  </div>

                                </div>
                          </div>
                          <div className="media w-50 mb-3 call-in-p">
                            <img
                                  src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
                                  alt="user"
                                  width="50"
                                  className="rounded-circle"
                                />
                            <div className="media-body ml-3">
                                  <div className="rounded py-2 mb-2">

                                    <p className="small text-muted mr0">Julian Mendez</p>
                                    <div className="row">
                                          <div className="col-md-8">
                                            <p className="text-small mb-0 text-muted">
Sr. UX
                                                                        Designer, New York
                                                </p>
                                          </div>
                                          <div className="col-md-4">
                                            <input
                                                  type="checkbox"
                                                  name="vehicle3"
                                                  value="Boat"
                                                />
                                            <label htmlFor="vehicle3"> Invite</label>
                                          </div>
                                        </div>
                                  </div>

                                </div>
                          </div>
                          <div className="media w-50 mb-3 call-in-p">
                            <img
                                  src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"
                                  alt="user"
                                  width="50"
                                  className="rounded-circle"
                                />
                            <div className="media-body ml-3">
                                  <div className="rounded py-2 mb-2">

                                    <p className="small text-muted mr0">Julian Mendez</p>
                                    <div className="row">
                                          <div className="col-md-8">
                                            <p className="text-small mb-0 text-muted">
Sr. UX
                                                                        Designer, New York
                                                </p>
                                          </div>
                                          <div className="col-md-4">
                                            <input
                                                  type="checkbox"
                                                  name="vehicle3"
                                                  value="Boat"
                                                />
                                            <label htmlFor="vehicle3"> Invite</label>
                                          </div>
                                        </div>
                                  </div>

                                </div>
                          </div>

                        </div>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
          <footer className="footer is-fixed-bottom">
            <div className="content has-text-centered">
              <span>Copyright &copy; LetsMeet 2020</span>
            </div>
          </footer>
        </div>
        <BreakoutRoomInvitation />
        <PollingContainer />
        <ModalContainer />
        <AudioContainer />
        <ToastContainer rtl />
        <ChatAlertContainer />
        <WaitingNotifierContainer />
        <LockNotifier />
        <PingPongContainer />
        <ManyWebcamsNotifier />
        {customStyleUrl ? <link rel="stylesheet" type="text/css" href={customStyleUrl} /> : null}
        {customStyle ? (
          <link
            rel="stylesheet"
            type="text/css"
            href={`data:text/css;charset=UTF-8,${encodeURIComponent(customStyle)}`}
          />
        ) : null}
      </main>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

const mapStateToProps = state => ({
  isPanelOpened: state.panel.isPanelOpened,
  isChatBox: state.panel.isChatBox,
  isInviteBox: state.panel.isInviteBox,
});

export default connect(mapStateToProps, { setPanelOpened, setChatBox, setInviteBox })(injectIntl(App));
