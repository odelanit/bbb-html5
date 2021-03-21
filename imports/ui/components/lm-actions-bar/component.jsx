import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import { Session } from 'meteor/session';
import {styles} from './styles.scss';
import DesktopShare from './desktop-share/component';
import ActionsDropdown from './actions-dropdown/component';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import {setChatBox, setInviteBox, setPanelOpened} from "/imports/redux/actions";
import StatusDropdownContainer from './status-dropdown/container';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;

class ActionsBar extends PureComponent {
    handleMessageClicked = () => {
        const isPanelOpened = this.props.isPanelOpened;
        Session.set('openPanel', 'chat');
        Session.set('idChatOpen', PUBLIC_CHAT_ID);
        this.props.setPanelOpened(!isPanelOpened)
        this.props.setChatBox(true)
        this.props.setInviteBox(false)
    }

    render() {
        const {
            amIPresenter,
            handleShareScreen,
            handleUnshareScreen,
            isVideoBroadcasting,
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
        } = this.props;

        const actionBarClasses = {};

        actionBarClasses[styles.centerWithActions] = amIPresenter;
        actionBarClasses[styles.center] = true;
        actionBarClasses[styles.mobileLayoutSwapped] = isLayoutSwapped && amIPresenter;

        return (
            <>
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
                <StatusDropdownContainer />
                <figure className="image is-44x44" onClick={this.handleMessageClicked}>
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
                <figure className="image is-44x44 call-end">
                    <img src="img/CallHang.png"/>
                </figure>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        isPanelOpened: state.panel.isPanelOpened,
        isChatBox: state.panel.isChatBox,
        isInviteBox: state.panel.isInviteBox
    }
}

export default connect(mapStateToProps, {setPanelOpened, setChatBox, setInviteBox})(ActionsBar);
