import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Session } from 'meteor/session';
import { styles } from './styles.scss';
import cx from 'classnames';
import DesktopShare from './desktop-share/component';
import ActionsDropdown from './actions-dropdown/component';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import { setChatBox, setInviteBox, setPanelOpened } from '/imports/redux/actions';
import StatusDropdownContainer from './status-dropdown/container';
import {withModalMounter} from '/imports/ui/components/modal/service';
import EndMeetingConfirmationContainer from '/imports/ui/components/end-meeting-confirmation/container';

import PresentationOptionsContainer from './presentation-options/component';
import QuickPollDropdown from './quick-poll-dropdown/component';

import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl } from 'react-intl';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;

const intlMessages = defineMessages({
  hideNoteLabel: {
    id: 'app.note.hideNoteLabel',
    description: 'Label for hiding note button',
  },
  notetitle: {
    id: 'app.note.title',
    description: 'Title for the shared notes',
  }
});

class ActionsBar extends PureComponent {
  handleMessageClicked = () => {
    const isPanelOpened = this.props.isPanelOpened;
    Session.set('openPanel', 'chat');
    isPanelOpened ? Session.set('idChatOpen', '') : Session.set('idChatOpen', PUBLIC_CHAT_ID)
    // this.props.setPanelOpened(!isPanelOpened);
    // this.props.setChatBox(true);
    // this.props.setInviteBox(false);
  };

  handleInviteClicked = () => {
    // this.props.setPanelOpened(true)
    // this.props.setChatBox(false)
    // this.props.setInviteBox(true)
    Session.set('openPanel', 'invite');
  };
  openUserPanel = ()=>{
    console.log('@vdo im-action-bar openUserPanel openPanle',this.props.openPanel)
    if(this.props.openPanel || Session.get('openPanle')){
      Session.set('openPanel', false);
    }
    else{
      Session.set('openPanel', true);
    }
  }

  handleLogoutClicked = () => {
    console.log(this.props.mountModal(<EndMeetingConfirmationContainer/>))
  }

  render() {
    const {
      amIPresenter,
      handleShareScreen,
      handleUnshareScreen,
      isVideoBroadcasting,
      toggleSwapLayout,
      isThereCurrentPresentation,
      parseCurrentSlideContent,
      currentSlidHasContent,
      amIModerator,
      screenSharingCheck,
      enableVideo,
      isLayoutSwapped,
      handleTakePresenter,
      intl,
      isSharingVideo,
      screenShareEndAlert,
      stopExternalVideoShare,
      screenshareDataSavingSetting,
      isMeteorConnected,
      isPollingEnabled,
      allowExternalVideo,
        publicChat
    } = this.props;

    const actionBarClasses = {};

    actionBarClasses[styles.centerWithActions] = amIPresenter;
    actionBarClasses[styles.center] = true;
    actionBarClasses[styles.mobileLayoutSwapped] = isLayoutSwapped && amIPresenter;
    console.log("@GOD isThereCurrentPresentation : ",isThereCurrentPresentation);
    return (
      <>

  <div className="column">
    <div className="meeting-actions">
      <div className="px-4">9:28</div>
        <AudioControlsContainer/>
        {enableVideo
          ? (
            <JoinVideoOptionsContainer/>
          )
          : null}
        <DesktopShare {...{
          handleShareScreen,
          handleUnshareScreen,
          isVideoBroadcasting,
          amIPresenter,
          screenSharingCheck,
          screenShareEndAlert,
          isMeteorConnected,
          screenshareDataSavingSetting,
        }}
        />
        <StatusDropdownContainer/>
        <figure className="image is-44x44" onClick={this.handleMessageClicked}>
          {publicChat.unreadCounter > 0 && (
              <span className="badge is-danger">{publicChat.unreadCounter}</span>
          )}
          <img src="img/MessageIcon.png"/>
        </figure>
        <ActionsDropdown {...{
          amIPresenter,
          amIModerator,
          isPollingEnabled,
          allowExternalVideo,
          handleTakePresenter,
          intl,
          isSharingVideo,
          stopExternalVideoShare,
          isMeteorConnected,
        }}
        
        />
        {isPollingEnabled || true
            ? (
              <QuickPollDropdown
                {...{
                  currentSlidHasContent,
                  intl,
                  amIPresenter,
                  parseCurrentSlideContent,
                }}
              />
            ) : null
            
          }
        
        <figure className="image is-44x44 call-end" onClick={this.handleLogoutClicked}>
          <img src="img/CallHang.png"/>
        </figure>
        <Button
              label={intl.formatMessage(intlMessages.notetitle)}
              aria-label={intl.formatMessage(intlMessages.notetitle)}
              icon="polling"
              onClick={() => {Session.set('openPanel','poll')}}
              hideLabel
              circle
              size="lg"
              color="vdowarning"
            />
        </div>
        </div>
        <div className="column">
          {/* <UserListContainer/> */}
          
          <div className="meeting-c">
            {/* <div className={cx('vdo-presentation',styles.right)}> */}
            <div className={cx('vdo-presentation')}>
              {isLayoutSwapped
                ? (
                  <PresentationOptionsContainer
                    toggleSwapLayout={toggleSwapLayout}
                    isThereCurrentPresentation={isThereCurrentPresentation}
                  />
                )
                : null
              }
            </div>
            <Button
              label={intl.formatMessage(intlMessages.notetitle)}
              aria-label={intl.formatMessage(intlMessages.notetitle)}
              icon="copy"
              onClick={() => {Session.set('openPanel','note')}}
              hideLabel
              circle
              size="lg"
              color="vdoprimary"
            />
            {amIModerator && (
              <figure className="image is-44x44" onClick={this.handleInviteClicked}>
                <img src="img/TeamAdd.png"/>
              </figure>
            )}

              <figure className="image is-44x44" onClick={this.openUserPanel}>
                <img src="img/TeamAdd.png"/>
              </figure>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    isPanelOpened: state.panel.isPanelOpened,
    isChatBox: state.panel.isChatBox,
    isInviteBox: state.panel.isInviteBox
  };
};

export default injectIntl(connect(mapStateToProps, {
  setPanelOpened,
  setChatBox,
  setInviteBox
})(withModalMounter(ActionsBar)));
